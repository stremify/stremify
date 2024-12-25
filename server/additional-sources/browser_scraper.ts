import puppeteer from 'puppeteer';

// Scraper which uses a headless browser to conduct its scraping. This is slower than direct HTTP
// requests, but circumvents any need to stay on top of API token/auth changes. Useful for
// providers without a publicy available API for direct stream links.
export class BrowserScraper {
  constructor(urlRegexesAllowed, urlRegexesDenied) {
    this.urlRegexesAllowed = urlRegexesAllowed
    this.urlRegexesDenied = urlRegexesDenied

    // These fields will be overridden in init().
    this.browser = null
    this.page = null
  }

  // Initializes the BrowserScraper's headless browser. Must be called before any other methods.
  async init() {
    this.browser = await puppeteer.launch({headless: 'shell'})
    this.page = await this.browser.newPage()

    // Only allowed request domains will be let through. Safeguarding traffic will block ads and
    // other unwanted traffic.
    await this.page.setRequestInterception(true)
    this.page.on('request', request => {
      let allowlisted = false
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

  // Closes the headless browser.
  async close() {
    await this.browser.close()
  }

  // Navigates the browser page to the given URL.
  async goto(url: string) {
    await this.page.goto(url, {
      timeout: 5000
    })
  }

  // Waits for the stream url to come over the network and returns it.
  async getStreamUrl(timeout: number) {
    let streamUrl = null

    try {
      await this.page.waitForRequest(request => {
        if (request.url().endsWith('m3u8')) {
          streamUrl = request.url()
          return true
        }
        return false
      }, {
        timeout: timeout,
      })
    } catch (err) {
        console.log(`m3u8 stream url catching failed: ${err.message}`)
    }

    return streamUrl
  }
}