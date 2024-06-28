import { convertImdbIdToTmdbId, getMovieMediaDetails, getShowMediaDetails, totalEpisodes } from "../../../functions/tmdb"
import { MOVIES } from "@consumet/extensions"

import 'dotenv/config'
const tmdb_api_key = process.env.TMDB_API_KEY

export async function scrapeDramacool(id, season, episode, media?) {
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

export async function searchDramacool(query: string) {
    const finalLinks = {"metas": []}

    const dramacool = new MOVIES.DramaCool;

    const searchResults = await dramacool.search(query);

    for (const searchResult of searchResults.results) {
        finalLinks.metas.push({
            'id': `${dramacoolPrefix}${btoa(searchResult.id)}`,
            'type': 'series',
            'name': searchResult.title,
            'poster': searchResult.image
        })
    }

    return(finalLinks)
}

export async function scrapefromDramacoolCatalog(id) {
    if (id.startsWith(dramacoolPrefix) != true) { return [] }
    let finalstreams = []

    const dramacool = new MOVIES.DramaCool;

    const episodeId = atob(id.split(':')[1])

    const episodeSources = await dramacool.fetchEpisodeSources(episodeId)
            
    for (const result of episodeSources.sources) {
        finalstreams.push({
            name: "Stremify",
            type: "url",
            url: result.url,
            title: `DramaCool`,
            behaviorHints: {
                bingeGroup: `dramacool`
            }
        })
    }

    return(finalstreams)
}


export async function dramacoolMeta(id: string, type: 'movie' | 'series') {
    if (id.includes(dramacoolPrefix) != true) { return [] }
    const elemId = atob(id.split(':')[1])
    
    const dramacool = new MOVIES.DramaCool;

    const dramacoolMediaInfo = await dramacool.fetchMediaInfo(elemId);

    const videos = []

    let i = 1;

    for (const episode of dramacoolMediaInfo.episodes) {
        videos.push({
            "season": 1,
            "episode": episode.number || i,
            "id": `${dramacoolPrefix}${btoa(episode.id)}`,
            "title": episode.title,
            "thumbnail": episode.image,
            "overview": episode.description,
        })
        i++;
    }

    if (dramacoolMediaInfo) {
        return({
            'meta': {
                id,
                type,
                name: dramacoolMediaInfo.title,
                description: dramacoolMediaInfo.description,
                releaseInfo: dramacoolMediaInfo.releaseDate,
                poster: dramacoolMediaInfo.image,
                background: dramacoolMediaInfo.image,
                genres: dramacoolMediaInfo.genres,
                cast: dramacoolMediaInfo.casts,
                videos,
            }
        })
    }
}

export const dramacoolPrefix = "stremify_dramacool:"

export const dramacool_catalog = [
    {
        "id": "dramacool_series",
        "type": "series",
        "name": "Dramacool",
        "idPrefixes": [dramacoolPrefix],
        "extra": [
            { "name": "search", "isRequired": true }
        ]
    }
]

function decode(str: string): string {
    return str.replace(/\\u[\dA-F]{4}/gi, function (match) {
        return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
    });
}