// technically an embed too, but it uses embeds in it's own embeds so...
// this only gets streamtape and dropload embeds
// movies only provider

import { superivdeodroploadResolve } from "../../embeds/supervideo-dropload";
import { streamtapeResolve } from "../../embeds/streamtape";

const baseurl = "https://meinecloud.click/"

export async function scrapeMeinecloud(imdbid) {
    const finalstreams = []
    const url = `${baseurl}/movie/${imdbid}`;

    try {
      const response = await fetch(url);
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
                name: "Stremify DE",
                type: "url",
                url: url,
                title: `Meinecloud - auto (dropload.io)`
            })
      }
  
      while ((match = streamtaperegex.exec(text)) !== null) {
        const initialurl = await streamtapeResolve(match[0])
        const finalurl = initialurl.replace('  .substring(1).substring(2)', "")
        finalstreams.push({
            name: "Stremify DE",
            type: "url",
            url: finalurl,
            title: `Meinecloud - auto (streamtape.com)`
        })
      }

      while ((match = supervideoregex.exec(text)) !== null) {
        const embedurl = `https://${match[0]}`        
        const url = await superivdeodroploadResolve(new URL(embedurl))
            finalstreams.push({
                name: "Stremify DE",
                type: "url",
                url: url,
                title: `Meinecloud - auto (supervideo.cc)`
            })
      }

      return(finalstreams)
  
    } catch (error) {
      return(null)
    }

}