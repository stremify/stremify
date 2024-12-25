import puppeteer from 'puppeteer';

import { convertImdbIdToTmdbId } from "../../../functions/tmdb"

// Most URLs and URL regexes declared here are obfuscated.

// Base URL to fetch initial data.
const VIDLINK_URL_BASE = atob('aHR0cHM6Ly92aWRsaW5rLnBybw==')

// Any incoming request URL which matches any of these regexes is allowed.
const VIDLINK_URL_REGEX_ALLOWED = [
    new RegExp(atob('Xmh0dHBzOlwvXC8oW2EtekEtel0rXC4pP3ZpZGxpbmtcLi4qJA==')),
    new RegExp(atob('Xmh0dHBzOlwvXC8oW2EtekEtel0rXC4pP3RtZGJcLi4qJA==')),
    /^https:\/\/.*\.m3u8$/,
]

// Returns whether the given request URL is allowed.
function requestIsAllowed(url: string) {
    let allowlisted = false

    for (const urlRegexAllowed of VIDLINK_URL_REGEX_ALLOWED) {
        allowlisted |= urlRegexAllowed.exec(url) !== null
    }

    return allowlisted
}

// Scrapes vidlink to return a stream from the given id and episode information if necessary.
export async function scrapeVidLink(id: string, season: string, episode: string, stopAt: number) {
    // Create puppeteer headless browser to conduct the scraping. This is slower than direct HTTP
    // requests, but circumvents any need to stay on top of API token/auth changes.
    let browser = await puppeteer.launch({headless: 'shell'})
    const page = await browser.newPage()

    // Convert IMDB id to TMDB id, as that is what vidlink uses.
    if (id.startsWith('tt')) {
      id = await convertImdbIdToTmdbId(id)
    }
    if (id === null) {
      console.log(`Was not able to convert IMDB id to TMDB id.`)
      await browser.close()
      return []
    }

    // Only allowed request domains will be let through. Safeguarding traffic will block ads and
    // other unwanted traffic.
    await page.setRequestInterception(true)
    page.on('request', request => {
        if (!requestIsAllowed(request.url())) {
            return request.abort()
        }
        request.continue()
    })

    // Get the URL to start scraping, which could be for a movie or TV series.
    let fetchUrl = episode === '0' ? `${VIDLINK_URL_BASE}/movie/${id}` : `${VIDLINK_URL_BASE}/tv/${id}/${season}/${episode}`
    
    // Navigate to the page.
    await page.goto(fetchUrl, {
        timeout: 5000,
    })

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
        description: `vidlink - HLS`,
    }]
}
