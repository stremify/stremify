// uses verhdlink for movies, so this scraper is for series only :+1:
import { superivdeodroploadResolve } from "../../embeds/supervideo-dropload"

const baseurl = "https://cinehdplus.cam"

export async function scrapeCinehdplus(imdb, season, episode) {
  const finalstreams = []
  try {
      const response = await fetch(`${baseurl}/series/?story=${imdb}&do=search&subaction=search"`, {
          headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36"
          }
      })
      if (!response.ok) {
          return (null)
      }
      const searchResponse = await response.text()
      const searchRegex = /<div class="card__cover"><a href="[^"]*">[\s\S]*? class="idioma" alt="[^"]*">/g; // yes, they can be made into groups for faster processing, but some movies appear to be failing with that method so I had to resort to this one
      const searchMatch = searchRegex.exec(searchResponse)

      const urlregex = /<a href="([^"]*)">/;
      const showUrl = urlregex.exec(searchMatch[0])

      let lang = ""
      if (searchMatch[0].includes("latino")) { // i still havent figured out how dual-language series work, however there is only like 2 or 3 of them on the site (or at least that I was able to find)
          lang = "Latino"
      } else {
          lang = "Castellano"
      }
      const episodeFetch = await fetch(new URL(showUrl[1]), {
          headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36"
          }
      })

      const episodeData = await episodeFetch.text()
      const droploadregex = new RegExp(`data-num="${season}x${episode}".*?data-link="(https://dropload\\.io/embed-\\w+\\.html)"`, 's'); // not the greatest way to do it, but it works ig

      const droploadmatch = droploadregex.exec(episodeData);

      if (droploadmatch != null) {
          const url = await superivdeodroploadResolve(new URL(droploadmatch[1]));
          finalstreams.push({
              name: "Stremify ES",
              type: "url",
              url: url,
              title: `Cinehdplus ${lang} - auto (dropload.io)`
          })
      }

      const supervideoregex = new RegExp(`${season}x${episode} Episode ${episode} –.*?<a target="_blank" href="([^"]+)">Supervideo</a>`);

      const supervideomatch = supervideoregex.exec(episodeData);
      if (supervideomatch != null) {
          const url = await superivdeodroploadResolve(new URL(supervideomatch[1].replace(/(.tv\/)(.*)/, '$1e/$2').replace(".html", ""))) // gives us an embed

          finalstreams.push({
              name: "Stremify ES",
              type: "url",
              url: url,
              title: `Cinehdplus ${lang} - auto (supervideo.cc)`
          })
      }


      return (finalstreams)

  } catch {
      return (null)
  }

}