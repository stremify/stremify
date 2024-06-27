import { convertImdbIdToTmdbId, getMovieMediaDetails, getShowMediaDetails, totalEpisodes } from "../../../functions/tmdb"
import { getKitsuMediaDetails } from "~/functions/kitsu"
import { ANIME } from "@consumet/extensions"

import 'dotenv/config'
const tmdb_api_key = process.env.TMDB_API_KEY

export async function scrapeGogoanime(id, season, episode, media?) { 
    episode = parseInt(episode)
    let finalstreams = []

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
        } else if (id.includes('kitsu')) {
            media = await getKitsuMediaDetails(id.split(':')[1]);
        }
    }

    const gogoanime = new ANIME.Gogoanime;

    const searchResults = (await gogoanime.search(media.title)).results
    
    let i = 0;
    for (const searchResult of searchResults) {
        if (i >= 3) { break; }
        let data;

        try {
            data = await gogoanime.fetchAnimeInfo(searchResult.id)
        } catch(err) {
            continue;
        }

        const episodeNum = episode - 1
        if (data.episodes[episodeNum]) {
            const episodeSources = await gogoanime.fetchEpisodeSources(data.episodes[episodeNum].id)
            
            for (const result of episodeSources.sources) {
                finalstreams.push({
                    name: "Stremify",
                    type: "url",
                    url: result.url,
                    title: `Gogoanime - ${searchResult.title} E${episode} ${result.quality}`,
                    behaviorHints: {
                        bingeGroup: `gogoanime_${encodeURIComponent(searchResult.title.toString())}`
                    }
                })
            }
        }
        i++;
    }

    return(finalstreams)
}
