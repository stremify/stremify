import { getMovieMediaDetails, convertImdbIdToTmdbId } from "../../../functions/tmdb";
import { scrapeBuiltIn } from "~/functions/built_in_wrapper";
import { convertResult } from "~/functions/stream_info_conversion";
import { getCache, setCache } from "~/functions/caching";

import 'dotenv/config'
const scrape_built_in = process.env.scrape_built_in

export default eventHandler(async (event) => {

    if (scrape_built_in == "false") { return({streams: []}); }
    
    const path = getRouterParam(event, 'id')
    const id = path.split('.')[0];

    return({streams:await scrapeBuiltinMovie(id)})
});

export async function scrapeBuiltinMovie(id) {
    let finalStreams: any = [];
    let tmdb
    if (id.startsWith('tmdb') == true) {
        tmdb = id.replace('tmdb:', '')
    } else {
        tmdb = await convertImdbIdToTmdbId(id)
    }
    
    const cache = await getCache('built-in', tmdb)
    if (cache) { return(cache) }

    const media = await getMovieMediaDetails(tmdb)

    const output = await scrapeBuiltIn(media)

    for (const result of output) {
        finalStreams.push(await convertResult(result))
    }

    await setCache(finalStreams, 'built-in', tmdb)

    return(finalStreams)
}