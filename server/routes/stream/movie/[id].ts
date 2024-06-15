import { getMovieMediaDetails, convertImdbIdToTmdbId } from "../../../functions/tmdb";
import { scrapeBuiltIn } from "~/functions/built_in_wrapper";
import { convertResult } from "~/functions/stream_info_conversion";

import 'dotenv/config'
const scrape_built_in = process.env.scrape_built_in

export default eventHandler(async (event) => {
    let finalStreams: any = { streams: [] };

    if (scrape_built_in == "false") { return(finalStreams); }
    
    const path = getRouterParam(event, 'id')
    const id = path.split('.')[0];

    let tmdb
    if (id.startsWith('tmdb') == true) {
        tmdb = id.replace('tmdb:', '')
    } else {
        tmdb = await convertImdbIdToTmdbId(id)
    }
    
    const media = await getMovieMediaDetails(tmdb)

    const output = await scrapeBuiltIn(media)

    for (const result of output) {
        finalStreams.streams.push(await convertResult(result))
    }

    return(finalStreams)
});