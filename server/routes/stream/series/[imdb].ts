import { getShowMediaDetails, convertImdbIdToTmdbId } from "../../../functions/tmdb";
import { getMedia } from "../../../functions/providers";
import { scrapeCustom } from "../../../additional-sources/languages/language-scraper";
import 'dotenv/config'
const scrape_english = process.env.scrape_english
const sources = ["showbox", "vidsrc", "vidsrcto"] // the other sources seemingly do not work - either with Stremio or as a whole, please open up a PR or an issue if you have any idea why as I was not able to figure it out

  
export default eventHandler(async (event) => {
    
    const path = getRouterParam(event, 'imdb')
    const nonEncoded = decodeURIComponent(path)
    const imdb = nonEncoded.split('.')[0];
    const mediaInfo = {
        imdbid: imdb.split(':')[0],
        season: imdb.split(':')[1],
        episode: imdb.split(':')[2],
    }

    const output: any = { streams: [] };

    if (scrape_english == "true") {
        const tmdb = await convertImdbIdToTmdbId(mediaInfo.imdbid)
        const media = await getShowMediaDetails(tmdb, mediaInfo.season, mediaInfo.episode)    
        for (const source of sources) {
            const stream = await getMedia(media, source)
            for (const embed in stream) {
                    const streams = stream[embed].stream;
                    for (const streamItem of streams) {
                        if (streamItem.type === "file") {
                            for (const qualityKey in streamItem.qualities) {
                                const quality = streamItem.qualities[qualityKey];
                                output.streams.push({
                                    name: "Stremify",
                                    type: "url",
                                    url: quality.url,
                                    title: `${source} - ${qualityKey}p (${embed})`
                                });
                            }
                        } else if (streamItem.type == "hls") {
                            output.streams.push({
                                name: "Stremify",
                                type: "url",
                                url: streamItem.playlist,
                                title: `${source} - auto (${embed})`
                            })
                        }
                    }
            }
                
            
        }
    }
    
    const foreignstreams = await scrapeCustom(mediaInfo.imdbid, mediaInfo.season, mediaInfo.episode)

    for (const foreignstream of foreignstreams) {
        output.streams.push(foreignstream)
    }

    return output;
});