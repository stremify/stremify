// uses meinecloud for movies, so this is only for series
import { evalResolver } from "../../embeds/evalResolver"
import 'dotenv/config'

const remote = process.env.disable_same_ip_embeds

const baseurl = "https://kinokiste.live"

export async function scrapeKinokiste(imdb, season, episode) {
    const finalstreams = []
    try {
        const response = await fetch(`${baseurl}/serien/?do=search&subaction=search&story=${imdb}"`, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36"
            }
          })
          if (!response.ok) {
            return(null)
          }
          const searchResponse = await response.text()
          const searchRegex = /<a href="([^"]+)">\s*<img src="/g;
          const searchMatchesIterator = searchResponse.matchAll(searchRegex);
        
          const urls = Array.from(searchMatchesIterator, match => match[1]);
          
          const episodeFetch = await fetch(urls[0], {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36"
            }
          })

          const episodeData = await episodeFetch.text()

          const linksmatch = episodeData.match(`${season}x${episode} Episode ${episode} –.*`);
          if (linksmatch) {
            const supervideomatch = linksmatch[0].match(`<a target="_blank" href="([^"]+)">Supervideo</a>`);
            if (supervideomatch) {
              const url = await evalResolver(new URL(supervideomatch[1].replace(/(.tv\/)(.*)/, '$1e/$2').replace(".html", ""))) // gives us an embed
              finalstreams.push(
                  {
                      name: "Stremify DE",
                      type: "url",
                      url: url,
                      title: `Kinokiste - auto (supervideo.cc)`,
                      behaviorHints: {
                        bingeGroup: `de_supervideo`
                      }
                  }
              )
            }

            if (remote != "true") {
              const droploadmatch = linksmatch[0].match(`<a href="([^"]+)">Dropload</a>`);
              if (droploadmatch) {
                const url = await evalResolver(new URL(droploadmatch[1].replace(/(.io\/)(.*)/, '$1embed-$2.html'))) // gives us an embed
                finalstreams.push(
                  {
                      name: "Stremify DE",
                      type: "url",
                      url: url,
                      title: `Kinokiste - auto (dropload.io)`,
                      behaviorHints: {
                        bingeGroup: `de_dropload`
                      }
                  }
                )
              }
            }

          }

          return(finalstreams)

    } catch(error) {
      console.log(error)
    }

}