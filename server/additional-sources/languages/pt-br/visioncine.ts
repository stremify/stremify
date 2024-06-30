import { visioncineResolve } from "~/additional-sources/embeds/visioncine"

const baseurl = atob('aHR0cHM6Ly93d3cudmlzaW9uY2luZS0xLmNvbQ==')

export async function scrapeVisioncine(id) {
    if (id.includes(visioncinePrefix) != true) { return [] }

    id = atob(id.split(':')[1]);

    const mediaURL = await visioncineResolve(new URL(id));

    if (mediaURL != null) {
        return([{
            name: "Stremify PT-BR",
            type: "url",
            url: mediaURL,
            title: "Visioncine",
            behaviorHints: {
                bingeGroup: 'visioncine'
            }
        }])
    }
}

export async function searchVisioncine(query, type: 'movie' | 'series') {
    const finalLinks = {"metas": []}
    query = query.replace(' ', '+')

    const searchURL = await fetch(`${baseurl}/search.php?q=${query}`)
    if (searchURL.ok != true) { return([]) }

    const searchData = await searchURL.text()

    const searchRegex = /<div class="content" style="background-image: url\(([^)]*)\)">[\w\W]*?<div class="px-2">[\w\W]*?<h6>([^"]*)<\/h6>[\w\W]*?<a href="([^"]*)" type="button" class="btn free fw-bold">/gm

    let match;
    while ((match = searchRegex.exec(searchData)) != null) {
        const mediaType = match[0].includes('Min') ? 'movie' : 'series';

        if (mediaType == type) {
            finalLinks.metas.push({
                'id': `${visioncinePrefix}${btoa(match[3])}`,
                type,
                'name': match[2],
                'poster': match[1]
            })
        }
    };

    return(finalLinks)
}

export async function visioncineMeta(id, type: 'movie' | 'series') {
    if (id.includes(visioncinePrefix) != true) { return [] }
    const url = atob(id.split(':')[1])

    const pageData = await fetch(url)
    const data = await pageData.text()

    const titleRegex = data.match(/<h1 class="fw-bolder mb-0">([^<]*)/)
    const name = titleRegex[1]

    const descriptionRegex = data.match(/<p class="small linefive">([^*]*?)<\/p>/)
    const description = descriptionRegex[1]

    const genreRegex = data.match(/<p class="lineone">([^*]*?)<\/p>/)
    const genres = []

    const spanGenreRegex = /<span>([^<]*)/g

    let match;
    while ((match = spanGenreRegex.exec(genreRegex[0])) != null) {
        if(match[1] != 'Gênero' && (/[a-zA-Z]/).test(match[1])) {
            genres.push(match[1])
        }
    };

    const meta = data.match(/<p class="log py-4 mb-0">[\w\W]*?<span>([^<]*)<\/span>[\w\W]*?<span>([^<]*)<\/span>[\w\W]*?IMDb<\/b>([^<]*)/);
    
    let minutes = meta[1]
    let releaseInfo = meta[2]
    let imdbRating = meta[3]

    const backdropRegex = data.match(/<div class="backImage" style="background-image: url\(\'([^']*)/)
    let background = backdropRegex[1]

    const videos = [];

    if (type == 'series') {
        const selectedSeasonId = data.match(/<option selected value="([^"]*)">/)

        let season = 1;

        const episodeRegex = /<div class="ep">[\w\W]*?<h5 class="fw-bold">([^<]*)[\w\W]*?<a href="([^"]*)/g

        if (selectedSeasonId[1]) {
            const episodeListURL = await fetch(`${baseurl}/ajax/episodes.php?season=${selectedSeasonId[1]}`);
            const episodeListData = await episodeListURL.text();

            let match;
            let episode = 1;
            while ((match = episodeRegex.exec(episodeListData)) != null) {
                videos.push({
                    season,
                    episode,
                    id: `${visioncinePrefix}${btoa(match[2])}`,
                    title: match[1],
                })
                episode++;
            }
        }

        const seasonIds = /<option  value="([^"]*)">/g

        let seasonmatch;
        while ((seasonmatch = seasonIds.exec(data)) != null) {
            season++;
            const episodeListURL = await fetch(`${baseurl}/ajax/episodes.php?season=${seasonmatch[1]}`);
            const episodeListData = await episodeListURL.text();
            
            let episodeElem;
            let episode = 1;
            while ((episodeElem = episodeRegex.exec(episodeListData)) != null) {
                videos.push({
                    season,
                    episode,
                    id: `${visioncinePrefix}${btoa(episodeElem[2])}`,
                    title: episodeElem[1],
                })
                episode++;
            }
        }
    } else {
        const playurl = data.match(/<a href="([^"]*)" type="button" class="btn free fw-bold" data-tippy-content=/)[1]
        id = `${visioncinePrefix}${btoa(playurl)}`
    }

    return({
        'meta': {
            id,
            type,
            name,
            description,
            background,
            releaseInfo,
            minutes: type == 'series' ? null : minutes,
            imdbRating,
            genres,
            videos,
        }
    })
}

async function extractVisioncineEpisodes(id, season) {
    

}

export const visioncinePrefix = "visioncine:"


export const visioncineCatalogs = [
    {
        "id": "visioncine_movies",
        "type": "movie",
        "name": "Visioncine",
        "idPrefixes": [visioncinePrefix],
        "extra": [
            { "name": "search", "isRequired": true }
        ]
    },
    {
        "id": "visioncine_series",
        "type": "series",
        "name": "Visioncine",
        "idPrefixes": [visioncinePrefix],
        "extra": [
            { "name": "search", "isRequired": true }
        ]
    }
]
