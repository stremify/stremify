import { convertImdbIdToTmdbId, getMovieMediaDetails, getShowMediaDetails, totalEpisodes } from "../../../functions/tmdb"
import { MOVIES } from "@consumet/extensions"

import 'dotenv/config'
const tmdb_api_key = process.env.TMDB_API_KEY

export async function scrapeDramacool(id, season, episode, media?) {
    let finalstreams = []
    if (tmdb_api_key == null || tmdb_api_key == '' && media == null) {
        console.warn('No TMDB API key provided, it is required for dramacool.')
        return ([])
    }

    if (media == null) {
        if (id.includes('tt') == true) {
            id = await convertImdbIdToTmdbId(id)
            if (id == null) {
                return([])
            }
            media = episode === 0 ? await getMovieMediaDetails(id) : getShowMediaDetails(id, season, episode)
            if (media == null) {
                return([])
            }
        } else if (id.includes('tmdb')) {
            media = episode === 0 ? await getMovieMediaDetails(id) : getShowMediaDetails(id, season, episode)
            if (media == null) {
                return([])
            }
        } else {
            return ([])
        }
    }

    const dramacool = new MOVIES.DramaCool;

    const searchResults = (await dramacool.search(media.title)).results
    
    for (const searchResult of searchResults) {
        let data;

        try {
            data = await dramacool.fetchMediaInfo(searchResult.id)
        } catch(err) {
            continue;
        }

        if (data.episodes[episode === 0 ? 0 : episode - 1]) {
            const episodeSources = await dramacool.fetchEpisodeSources(data.episodes[episode === 0 ? 0 : episode - 1].id)
            
            for (const result of episodeSources.sources) {
                finalstreams.push({
                    name: "Stremify",
                    type: "url",
                    url: result.url,
                    title: `DramaCool - ${searchResult.title} E${episode}`,
                    behaviorHints: {
                        bingeGroup: `dramacool_${encodeURIComponent(searchResult.title.toString())}`
                    }
                })
            }
        }
    }

    return(finalstreams)
}
