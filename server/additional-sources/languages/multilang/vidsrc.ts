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
]

// Any incoming request URL which matches any of these regexes is explicitly denied.
const VIDSRC_URL_REGEX_DENIED = [
    new RegExp(atob('Xmh0dHBzXDpcL1wvLipcL2Rpc2FibGUtZGV2dG9vbChcLm1pbik/XC5qcyhcPy4qKT8k')),
]

// Scrapes vidsrc to return a stream from the given id and episode information if necessary.
export async function scrapeVidSrc(id: string, season: string, episode: string, stopAt: number) {
    let streams = []
    // Init BrowserScraper with a constructed URL based on the id.
    let fetchUrl = episode === '0' ? `${VIDSRC_URL_BASE}/movie/${id}` : `${VIDSRC_URL_BASE}/tv/${id}/${season}/${episode}`
    let browserScraper = new BrowserScraper(
        /*provider=*/'vidsrc',
        /*streamRegex=*//^https:\/\/.*\.m3u8$/,
        VIDSRC_URL_REGEX_ALLOWED,
        VIDSRC_URL_REGEX_DENIED)
    await browserScraper.init()

    // Find play button and click it. This will trigger stream links to come over the network.
    try {
        // Navigate to the page and wait for all network traffic to stop. This will ensure all
        // elements are loaded on the page.
        await browserScraper.page.goto(fetchUrl, {
            timeout: 10000,
            waitUntil: 'networkidle0'
        })
        // Double check that all relevant iframes are loaded, and store the player iframe.
        const playerContainerFrame = await browserScraper.page.waitForFrame(async frame => {
            const hasPlayer = (await frame.$("#player_iframe")) !== null
            return hasPlayer
        }, {
            timeout: 2000
        })
        const playerIframe = await browserScraper.page.waitForFrame(async frame => {
            const hasPlayer = (await frame.$("#pl_but")) !== null
            return hasPlayer
        }, {
            timeout: 2000
        })
        // Click the play button.
        await playerIframe.$eval(`#pl_but`, element =>
            element.click()
        );
        // Wait for streams to come over the network and return them.
        streams = await browserScraper.getStreams(/*timeout=*/5000)
    } catch (err) {
        console.log(`Failed to find player button: ${err.message}`)
    } finally {
        await browserScraper.close()
        return streams
    }
}
