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

export async function searchGogoanime(query: string) {
    const finalLinks = {"metas": []}

    const dramacool = new ANIME.Gogoanime;

    const searchResults = await dramacool.search(query);

    for (const searchResult of searchResults.results) {
        finalLinks.metas.push({
            'id': `${gogoanimePrefix}${btoa(searchResult.id)}`,
            'type': 'series',
            'name': searchResult.title,
            'poster': searchResult.image
        })
    }

    return(finalLinks)
}

export async function scrapefromGogoanimeCatalog(id) {
    if (id.startsWith(gogoanimePrefix) != true) { return [] }
    let finalstreams = []

    const dramacool = new ANIME.Gogoanime;

    const episodeId = atob(id.split(':')[1])

    const episodeSources = await dramacool.fetchEpisodeSources(episodeId)
            
    for (const result of episodeSources.sources) {
        finalstreams.push({
            name: "Stremify",
            type: "url",
            url: result.url,
            title: `Gogoanime`,
            behaviorHints: {
                bingeGroup: `gogoanime`
            }
        })
    }

    return(finalstreams)
}


export async function gogoanimeMeta(id: string, type: 'movie' | 'series') {
    console.log(id)
    if (id.includes(gogoanimePrefix) != true) { return [] }
    const elemId = atob(id.split(':')[1])
    
    const gogoanime = new ANIME.Gogoanime;

    const gogoanimeMediaInfo = await gogoanime.fetchAnimeInfo(elemId);

    const videos = []

    let i = 1;

    for (const episode of gogoanimeMediaInfo.episodes) {
        videos.push({
            "season": 1,
            "episode": episode.number || i,
            "id": `${gogoanimePrefix}${btoa(episode.id)}`,
            "title": episode.title || `Episode ${i}`,
            "thumbnail": episode.image,
            "overview": episode.description,
        })
        i++;
    }

    if (gogoanimeMediaInfo) {
        return({
            'meta': {
                id,
                type,
                name: gogoanimeMediaInfo.title,
                description: gogoanimeMediaInfo.description,
                releaseInfo: gogoanimeMediaInfo.releaseDate,
                poster: gogoanimeMediaInfo.image,
                background: gogoanimeMediaInfo.image,
                genres: gogoanimeMediaInfo.genres,
                cast: gogoanimeMediaInfo.casts,
                videos,
            }
        })
    }
}

export const gogoanimePrefix = "stremify_gogoanime:"

export const gogoanime_catalog = [
    {
        "id": "gogoanime",
        "type": "series",
        "name": "Gogoanime",
        "idPrefixes": [gogoanimePrefix],
        "extra": [
            { "name": "search", "isRequired": true }
        ]
    }
]