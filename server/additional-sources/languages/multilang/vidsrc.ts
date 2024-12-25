import { BrowserScraper } from "../../browser_scraper"

// Most URLs and URL regexes declared here are obfuscated.

// Base URL to fetch initial data.
const VIDSRC_URL_BASE = atob('aHR0cHM6Ly92aWRzcmMueHl6L2VtYmVk')

// Any incoming request URL which matches any of these regexes is allowed.
const VIDSRC_URL_REGEX_ALLOWED = [
    new RegExp(atob('Xmh0dHBzXDpcL1wvKFthLXpBLXpdK1wuKT92aWRzcmNcLi4qJA==')),
    new RegExp(atob('Xmh0dHBzXDpcL1wvKFthLXpBLXpdK1wuKT9jbG91ZGZsYXJlXC4uKiQ=')),
    new RegExp(atob('Xmh0dHBzXDpcL1wvKFthLXpBLXpdK1wuKT9lZGdlZGVsaXZlcnluZXR3b3JrXC4uKiQ=')),
    new RegExp(atob('Xmh0dHBzXDpcL1wvKFthLXpBLXpdK1wuKT9nb29nbGVhcGlzXC4uKiQ=')),
    new RegExp(atob('Xmh0dHBzXDpcL1wvLipcL3V0XC5qcyhcPy4qKT8k')),
    new RegExp(atob('Xmh0dHBzXDpcL1wvKFthLXpBLXpdK1wuKT90bWRi')),
    /^https\:\/\/.*\.m3u8$/,
]

// Any incoming request URL which matches any of these regexes is explicitly denied.
const VIDSRC_URL_REGEX_DENIED = [
    new RegExp(atob('Xmh0dHBzXDpcL1wvLipcL2Rpc2FibGUtZGV2dG9vbChcLm1pbik/XC5qcyhcPy4qKT8k')),
]

// Gets player iframe from the given puppeteer page after navigating to the fetchUrl. Retries up to
// maxAttempts times.
async function navigateAndGetPlayerIframe(browserScraper, fetchUrl: string, maxAttempts: number) {
    let playerIframe = undefined

    while (!playerIframe && maxAttempts > 0) {
        await browserScraper.goto(fetchUrl)
        playerIframe = await browserScraper.page.$('#player_iframe')
        maxAttempts--
    }

    return playerIframe
}

// Scrapes vidsrc to return a stream from the given id and episode information if necessary.
export async function scrapeVidSrc(id: string, season: string, episode: string, stopAt: number) {
    // Init BrowserScraper with a constructed URL based on the id.
    let fetchUrl = episode === '0' ? `${VIDSRC_URL_BASE}/movie/${id}` : `${VIDSRC_URL_BASE}/tv/${id}/${season}/${episode}`
    let browserScraper = new BrowserScraper(VIDSRC_URL_REGEX_ALLOWED, VIDSRC_URL_REGEX_DENIED)
    await browserScraper.init()

    // Navigate to the page and get the player iframe, which will have a clickable play button
    // inside which loads the stream.
    let playerIframeHandle = await navigateAndGetPlayerIframe(browserScraper, fetchUrl, 3)
    if (!playerIframeHandle) {
        console.log(`No iframe found. Perhaps the media is not hosted yet?`)
        await browser.close()
        return []
    }

    // Find play button and click it. This will trigger stream links to come over the network.
    let playerIframe = await playerIframeHandle.contentFrame()
    try {
        await playerIframe.waitForSelector('#pl_but', {
            timeout: 2000
        })
        await playerIframe.$eval(`#pl_but`, element =>
            element.click()
        );
    } catch (err) {
        console.log(`Failed to find player button: ${err.message}`)
        await browserScraper.close()
        return []
    }

    // Wait for the master m3u8 to come over network (for 10 seconds max), then close the page.
    let masterStreamUrl = null
    try {
      masterStreamUrl = await browserScraper.getStreamUrl(/*timeout=*/10000)
    } catch (err) {
      console.log(`vidsrc scrape failed: ${err.message}`)
    } finally {
        await browserScraper.close()
      // If no stream was found, nothing should be returned to Stremio.
      if (!masterStreamUrl) {
          console.log(`No stream found from vidlink.`)
          return []
      }
    }

    // Otherwise, return a working stream.
    return [{
        name: `Stremify`,
        type: 'url',
        url: masterStreamUrl,
        description: `vidsrc - HLS`,
    }]
}
