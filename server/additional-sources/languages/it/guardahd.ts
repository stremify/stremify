// technically an embed too, but it uses embeds in it's own embeds so...
// this only gets streamtape and dropload embeds
// movies only provider

import { superivdeodroploadResolve } from "../../embeds/supervideo-dropload";
import { streamtapeResolve } from "../../embeds/streamtape";

const baseurl = "https://guardahd.stream"

export async function scrapeGuardahd(imdbid) {
    const finalstreams = []
    const url = `${baseurl}/movie/${imdbid}`;
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36",
        }
      })
      if (!response.ok) {
        return(null)
      }
      const text = await response.text();  
      const droploadregex = /dropload\.io\/([^"]+)/g;
      const supervideoregex = /supervideo\.cc\/([^"]+)/g;
      const streamtaperegex = /https:\/\/streamtape\.com\/([^"]+)/g;


      let match;
      while ((match = droploadregex.exec(text)) !== null) {
        const embedurl = `https://${match[0]}`        
        const url = await superivdeodroploadResolve(new URL(embedurl))
            finalstreams.push({
                name: "Stremify IT",
                type: "url",
                url: url,
                title: `GuardaHD - auto (dropload.io)`
            })
      }
  
      while ((match = streamtaperegex.exec(text)) !== null) {
        const initialurl = await streamtapeResolve(match[0])
        const finalurl = initialurl.replace('  .substring(1).substring(2)', "")
        finalstreams.push({
            name: "Stremify IT",
            type: "url",
            url: finalurl,
            title: `GuardaHD - auto (streamtape.com)`
        })
      }

      while ((match = supervideoregex.exec(text)) !== null) {
        const embedurl = `https://${match[0]}`        
        const url = await superivdeodroploadResolve(new URL (embedurl))
            finalstreams.push({
                name: "Stremify IT",
                type: "url",
                url: url,
                title: `GuardaHD - auto (supervideo.cc)`
            })
      }
      return(finalstreams)
  
    } catch (error) {
      return(null)
    }

}