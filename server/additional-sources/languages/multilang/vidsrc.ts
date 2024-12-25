import puppeteer from 'puppeteer';

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
async function navigateAndGetPlayerIframe(page, fetchUrl: string, maxAttempts: number) {
    let playerIframe = undefined

    while (!playerIframe && maxAttempts > 0) {
        await page.goto(fetchUrl, {
            timeout: 5000,
        })
        playerIframe = await page.$('#player_iframe')
        maxAttempts--
    }

    return playerIframe
}

// Returns whether the given request URL is allowed.
function requestIsAllowed(url: string) {
    let allowlisted = false
    let denylisted = false

    for (const urlRegexAllowed of VIDSRC_URL_REGEX_ALLOWED) {
        allowlisted |= urlRegexAllowed.exec(url) !== null
    }
    for (const urlRegexDenied of VIDSRC_URL_REGEX_DENIED) {
        denylisted |= urlRegexDenied.exec(url) !== null
    }

    // A valid URL must be both allowed and not explicitly denied.
    return allowlisted && !denylisted
}

// Scrapes vidsrc to return a stream from the given id and episode information if necessary.
export async function scrapeVidSrc(id: string, season: string, episode: string, stopAt: number) {
    // Create puppeteer headless browser to conduct the scraping. This is slower than direct HTTP
    // requests, but circumvents any need to stay on top of API token/auth changes.
    let browser = await puppeteer.launch({headless: 'shell'})
    const page = await browser.newPage()

    // Only allowed request domains will be let through. Safeguarding traffic will:
    //   1. Block ads which could prevent the play button from surfacing
    //   2. Improve performance in general
    await page.setRequestInterception(true)
    page.on('request', request => {
        if (!requestIsAllowed(request.url())) {
            return request.abort()
        }
        request.continue()
    })

    // Get the URL to start scraping, which could be for a movie or TV series.
    let fetchUrl = episode === '0' ? `${VIDSRC_URL_BASE}/movie/${id}` : `${VIDSRC_URL_BASE}/tv/${id}/${season}/${episode}`

    // Navigate to the page via puppeteer and get the player iframe, which will have a clickable
    // play button inside which loads the stream.
    let playerIframeHandle = await navigateAndGetPlayerIframe(page, fetchUrl, 3)
    if (!playerIframeHandle) {
        console.log(`No iframe found. Perhaps the media is not hosted yet?`)
        await browser.close()
        return []
    }

    // Find play button and click it. This will trigger stream links to come over the network.
    let playerIframe = await playerIframeHandle.contentFrame()
    try {
        await playerIframe.waitForSelector('#pl_but', {
            timeout: 7000
        })
        await playerIframe.$eval(`#pl_but`, element =>
            element.click()
        );
    } catch (err) {
        console.log(`Failed to find player button: ${err.message}`)
        await browser.close()
        return []
    }

    // Wait for the master m3u8 to come over network (for 10 seconds max), then close the page.
    let masterStreamUrl = undefined
    try {
        await page.waitForRequest(request => {
            if (request.url().endsWith('m3u8')) {
                console.log(`m3u8 found: ${request.url()}`)
                masterStreamUrl = request.url()
                return true
            }
            return false
        }, {
            timeout: 10000,
        })
    } catch (err) {
        console.log(`m3u8 stream url catching failed: ${err.message}`)
    }

    await browser.close()

    // If no stream url was found, nothing should be returned to Stremio.
    if (!masterStreamUrl) {
        return []
    }

    // Otherwise, return a working stream.
    return [{
        name: `Stremify`,
        type: 'url',
        url: masterStreamUrl,
        description: `vidsrc - HLS`,
    }]
}
