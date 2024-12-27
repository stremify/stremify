import { convertImdbIdToTmdbId } from "../../../functions/tmdb"
import { BrowserScraper } from "../../browser_scraper"

// Most URLs and URL regexes declared here are obfuscated.

// Base URL to fetch initial data.
const VIDLINK_URL_BASE = atob('aHR0cHM6Ly92aWRsaW5rLnBybw==')

// Any incoming request URL which matches any of these regexes is allowed.
const VIDLINK_URL_REGEX_ALLOWED = [
    new RegExp(atob('Xmh0dHBzOlwvXC8oW2EtekEtel0rXC4pP3ZpZGxpbmtcLi4qJA==')),
    new RegExp(atob('Xmh0dHBzOlwvXC8oW2EtekEtel0rXC4pP3RtZGJcLi4qJA==')),
]

// Scrapes vidlink to return a stream from the given id and episode information if necessary.
export async function scrapeVidLink(id: string, season: string, episode: string, stopAt: number) {
    // Convert IMDB id to TMDB id, as that is what vidlink uses.
    if (id.startsWith('tt')) {
      id = await convertImdbIdToTmdbId(id)
    }
    if (id === null) {
      console.log(`Was not able to convert IMDB id to TMDB id.`)
      return []
    }

    // Init BrowserScraper with a constructed URL based on the id.
    let fetchUrl = episode === '0' ? `${VIDLINK_URL_BASE}/movie/${id}` : `${VIDLINK_URL_BASE}/tv/${id}/${season}/${episode}`
    let browserScraper = new BrowserScraper(
      /*provider=*/'vidlink',
      /*streamRegex=*//^https:\/\/.*\.m3u8$/,
      VIDLINK_URL_REGEX_ALLOWED,
      /*urlRegexesDenied=*/[])
    await browserScraper.init()
    await browserScraper.goto(fetchUrl)
    
    // Wait for streams to come over the network and return them.
    let streams = await browserScraper.getStreams(/*timeout=*/10000)
    await browserScraper.close()
    return streams
}
