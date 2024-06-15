import { getShowMediaDetails, convertImdbIdToTmdbId } from "../../../functions/tmdb";
import { scrapeBuiltIn } from "~/functions/built_in_wrapper";
import { convertResult } from "~/functions/stream_info_conversion";
import 'dotenv/config'
const scrape_built_in = process.env.scrape_built_in

  
export default eventHandler(async (event) => {
    let finalStreams: any = { streams: [] };

    if (scrape_built_in == "false") { return(finalStreams); }
    
    const path = getRouterParam(event, 'id')
    const decodedId = decodeURIComponent(path)
    const id = decodedId.split('.')[0];

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

    const media = await getShowMediaDetails(tmdb, mediaInfo.season, mediaInfo.episode)
  
    const output = await scrapeBuiltIn(media)

    for (const result of output) {
        finalStreams.streams.push(await convertResult(result))
    }

    return(finalStreams)
});