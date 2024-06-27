import { getShowMediaDetails, convertImdbIdToTmdbId } from "../../../functions/tmdb";
import { scrapeBuiltIn } from "~/functions/built_in_wrapper";
import { convertResult } from "~/functions/stream_info_conversion";
import { getCache, setCache } from "~/functions/caching";

import 'dotenv/config'
const scrape_built_in = process.env.scrape_built_in

  
export default eventHandler(async (event) => {

    if (scrape_built_in == "false") { return({streams: []}); }
    
    const path = getRouterParam(event, 'id')
    const decodedId = decodeURIComponent(path)
    const id = decodedId.split('.')[0];

    return({streams:[await scrapeBuiltinSeries(id)]})
});

export async function scrapeBuiltinSeries(id) {
    let finalStreams: any = [];
    let tmdb
    let mediaInfo = {season: '', episode: ''}

    if (id.includes('tmdb') == true) {
        mediaInfo = {
            season: id.split(':')[2],
            episode: id.split(':')[3],    
        }
        tmdb = id.split(':')[1]
    } else {
        mediaInfo = {
            season: id.split(':')[1],
            episode: id.split(':')[2],    
        }
        tmdb = await convertImdbIdToTmdbId(id.split(':')[0])
    }

    const cache = await getCache('built-in', tmdb, mediaInfo.season, mediaInfo.episode)
    if (cache) { return(cache) }

    const media = await getShowMediaDetails(tmdb, mediaInfo.season, mediaInfo.episode)
  
    const output = await scrapeBuiltIn(media)

    for (const result of output) {
        finalStreams.push(await convertResult(result))
    }

    await setCache(finalStreams, 'built-in', tmdb, mediaInfo.season, mediaInfo.episode)

    return(finalStreams)
}