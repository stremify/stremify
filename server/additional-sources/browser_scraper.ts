import 'dotenv/config'

import { connect }  from 'puppeteer-real-browser'

// TODO: figure out how to close this browser on SIGTERM, SIGINT, and SIGHUP.
//
// All signs have pointed to a non-headless browser being necessary for full functionality.
// Instantiating such a browser for every individual provider on every individual call is
// incredibly wasteful, so a singleton is used to hold the browser instance.
//
// That being said, catching any interrupt signals from node to close this singleton instance has
// been a nightmare, as seemingly every forum post online has an "easy fix" that doesn't do
// anything here. Maybe one day it will be figured out, but until then, you must manage your
// browser instances manually. It is especially annoying with nodemon.
let BROWSER = null

// Assign BROWSER if enabled via environment variables.
if (process.env.enable_browser_scraping === "true") {
  console.log(`Browser scraping enabled. Initializing puppeteer browser...`)
  connect({
      headless: false,
      turnstile: true,
      disableXvfb: false,
  }).then((newBrowser, firstPage) => {
    console.log(`Browser ready via real browser. Make sure to clean up any zombie processes on app closure.`)
    BROWSER = newBrowser.browser
  })
}

// Scraper which uses a browser to conduct its scraping. This is slower than direct HTTP requests,
// but circumvents any need to stay on top of API token/auth changes. Useful for providers without
// a publicy available API for direct stream links (e.g vidsrc, vidlink, and smashystream).
//
// Each instance of BrowserScraper represents a single open page on a singleton Chrome browser
// instance which is initiated on app startup.
export class BrowserScraper {
  constructor(provider: string, streamRegex, urlRegexesAllowed, urlRegexesDenied) {
    // Name of the provider.
    this.provider = provider

    // Regex of the stream to find.
    this.streamRegex = streamRegex

    // Other URLs to either be allowed or explicitly denied via regex.
    this.urlRegexesAllowed = urlRegexesAllowed
    this.urlRegexesDenied = urlRegexesDenied

    // These fields will be overridden in init().
    this.page = null
  }

  // Initializes the BrowserScraper's headless browser. Must be called before any other methods.
  async init() {
    // Ensure browser is active.
    if (!BROWSER) {
      throw new Error(`Browser not active. Have you enabled browser scraping in .env?`)
    }

    // Open the one tab to be used and associated with this scraper.
    this.page = await BROWSER.newPage()

    // Only allowed request domains will be let through. Safeguarding traffic will block ads and
    // other unwanted traffic.
    await this.page.setRequestInterception(true)
    this.page.on('request', request => {
      let allowlisted = this.streamRegex.exec(request.url()) !== null
      let denylisted = false

      for (const urlRegexAllowed of this.urlRegexesAllowed) {
          allowlisted |= urlRegexAllowed.exec(request.url()) !== null
      }
      for (const urlRegexDenied of this.urlRegexesDenied) {
          denylisted |= urlRegexDenied.exec(request.url()) !== null
      }

      if (!allowlisted || denylisted) {
        return request.abort()
      }
      request.continue()
    })
  }

  // Closes the page. After calling this, the BrowserScraper should not be used again.
  async close() {
    await this.page.close()
  }

  // Waits for the streams to come over the network and returns them.
  async getStreams(timeout: number) {
    let streamUrl = null

    try {
      await this.page.waitForRequest(request => {
        if (this.streamRegex.exec(request.url())) {
          streamUrl = request.url()
          return true
        }
        return false
      }, {
        timeout: timeout,
      })

      if (!streamUrl) {
        throw new Error(`stream empty`)
      }

      return [{
        name: 'Stremify',
        type: 'url',
        url: streamUrl,
        description: `${this.provider} - HLS`
      }]
    } catch (err) {
        console.log(`${this.provider} failed to find stream: ${err.message}`)
        return []
    }
  }
}