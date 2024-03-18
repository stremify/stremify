// uses guardahd for movies, so this is only for series

import { superivdeodroploadResolve } from "../../embeds/supervideo-dropload"

const baseurl = "https://eurostreaming.forum/"

export async function scrapeEurostreaming(imdb, season, episode) {
    const finalstreams = []
    try {
        const response = await fetch(`${baseurl}/index.php`, {
          method: 'POST',
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36",
              "Content-Type": "application/x-www-form-urlencoded"
            },
            body: `do=search&subaction=search&search_start=0&full_search=0&result_from=1&story=${imdb}` 
          })
          if (!response.ok) {
            return(null)
          }
          const searchResponse = await response.text()
          const searchRegex = /<h2><a href="([^"]+)"[^>]*>/g;
          const searchMatchesIterator = searchResponse.matchAll(searchRegex);
        
          const urls = Array.from(searchMatchesIterator, match => match[1]);
          
          const episodeFetch = await fetch(urls[0], {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36"
            }
          })

          const episodeData = await episodeFetch.text()

          const droploadregex = new RegExp(`${season}x${episode} Episodio ${episode} – .*\n&nbsp; <a href="([^"]+)">Dropload`);

          const droploadmatch = droploadregex.exec(episodeData);

          if (droploadmatch != null) {
            const url = await superivdeodroploadResolve(new URL(droploadmatch[1].replace(/(.io\/)(.*)/, '$1e/$2'))); // replace adds an /e/ to the url so that we can scrape
            finalstreams.push(
                {
                    name: "Stremify IT",
                    type: "url",
                    url: url,
                    title: `Eurostreaming - auto (dropload.io)`
                }
            )
          }

          const supervideoregex = new RegExp(`${season}x${episode} Episodio ${episode} –.*?<a target="_blank" href="([^"]+)">Supervideo</a>`);

          const supervideomatch = supervideoregex.exec(episodeData);
          if (supervideomatch != null) {
            const url = await superivdeodroploadResolve(new URL(supervideomatch[1].replace(/(.tv\/)(.*)/, '$1e/$2').replace(".html", ""))) // gives us an embed
            
            finalstreams.push(
                {
                    name: "Stremify IT",
                    type: "url",
                    url: url,
                    title: `Eurostreaming - auto (supervideo.cc)`
                }
            )
          }


          return(finalstreams)

    } catch(err) {
        return(null)
    }

}