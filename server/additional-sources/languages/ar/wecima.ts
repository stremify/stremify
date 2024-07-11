import { govvidResolve } from "~/additional-sources/embeds/govid"
import { convertImdbIdToTmdbId, getMovieMediaDetails, getShowMediaDetails } from "~/functions/tmdb"

const wecimaBase = "https://wecima.show"

export async function scrapeWecima(id: string) {
    if (id.includes(weCimaPrefix) != true) { return [] }
    const finalstreams = []

    id = atob(id.split(':')[1]);

    const streamPage = await fetch(id);
    const streamPageData = await streamPage.text();

    const govid = (/url="([^"]*)" class="hoverable activable"><i class="fal fa-play"><\/i><strong>GoViD/).exec(streamPageData)
    if (govid[1]) {
        console.log('s')
        const urls = await govvidResolve(new URL(govid[1]))
        for (const url of urls) {
            finalstreams.push({
                name: "Stremify AR",
                type: "url",
                url,
                title: "WeCima - govid",
                behaviorHints: {
                    bingeGroup: `wecima_govid`,
                }
            })
        }
    }

    return(finalstreams)
}

export async function searchWecima(query: string, mediaType): Promise<searchResponse> {
    const finalLinks: searchResponse = {"metas": []}
    const searchPath = await fetch(`${wecimaBase}/AjaxCenter/Searching/${encodeURIComponent(query)}`)
    
    if (searchPath.ok != true) { return finalLinks; }

    const searchData = (await searchPath.text()).replace(/\\/g, '');

    const searchRegex = /<a href="([^"]*)" title=\"([^"]*)"><span class="BG--GridItem" data-lazy-style="--image:url\((([^)]*))[^]*?hasyear\">([^<]*)[^]*?>([^<]*)/gm

    let match;
    while ((match = searchRegex.exec(searchData)) != null) {
        const type = match[1].includes('series') ? 'series' : 'movie'
        if (type == mediaType) {
            finalLinks.metas.push({
                'id': `${weCimaPrefix}${btoa(match[1])}`,
                type,
                'name': decode(match[2].replace(/u/g, '\\u')),
                'poster': match[3]
            })
        }
    }

    return(finalLinks)
}

export async function getWecimaMeta(id: string, type: 'movie' | 'series') {
    if (id.includes(weCimaPrefix) != true) { return [] }
    const url = atob(id.split(':')[1])
    const pageData = await fetch(url)
    const data = await pageData.text()

    let description: any = data.match(/<div class=\"StoryMovieContent\">([^<]*)/)
    if (description && description[1]) { description = description[1] }

    let imageURL: any = data.match(/--img:url\(([^\)]*)/)
    if (imageURL && imageURL[1]) { imageURL = imageURL[1] }

    let meta = data.match(/<h1 dir=\"auto\" itemprop=\"name\">([^\(]*)[^>]*>([^<]*)/) || data.match(/<h1>([^<]*)<a href=[^>]*>([^<]*)/)
    let name;
    let releaseInfo;

    if (meta && meta[1] && meta[2]) { name = meta[1].replace('(', ''); releaseInfo = meta[2]}

    let videos = [];
    if (type == 'series') {
        const episodeRegex = /<a class="hoverable activable" href="([^"]*)"><div class="Thumb"><span><i class="fa fa-play"><\/i><\/span><\/div><episodeArea><episodeTitle>([^<]*)/gm
        try {
            const episodePanelRegex = /<div class="Episodes--Seasons--Episodes">[^*]*ifr/
            const episodePanelHTML = episodePanelRegex.exec(data)
        
            let episodeElem;
            let episode = 1;
            while ((episodeElem = episodeRegex.exec(episodePanelHTML[0])) != null) {
                let episodeNumber = episodeElem[2].replace(/\D/g, '')
                videos.push({
                    "season": 1,
                    "episode": parseInt(episodeNumber) || episode, 
                    "id": `${weCimaPrefix}${btoa(episodeElem[1])}`,
                    "title": episodeElem[2],
                })
                episode++;
            };
        } catch(err) {
            const episodePanelRegex = /<div class="Seasons--Episodes">[^*]*singlesections/
            const episodePanelHTML = episodePanelRegex.exec(data)
    
            const episodeRegex = /<a class="hoverable activable" href="([^"]*)"><div class="Thumb"><span><i class="fa fa-play"><\/i><\/span><\/div><episodeArea><episodeTitle>([^<]*)/gm
    
            let episodeElem;
            let episode = 1;
            while ((episodeElem = episodeRegex.exec(episodePanelHTML[0])) != null) {
                let episodeNumber = episodeElem[2].replace(/\D/g, '')
                videos.push({
                    "season": 1,
                    "episode": parseInt(episodeNumber) || episode, 
                    "id": `${weCimaPrefix}${btoa(episodeElem[1])}`,
                    "title": episodeElem[2],
                })
                episode++;
            };
        }

        try {
            const seasonsRegex = /<div class="List--Seasons--Episodes">[^*]*?<\/div>/
            const seasonElement = seasonsRegex.exec(data)
            const nonActiveSeasonRegex = /<a class="hoverable activable" href="([^"]*)">([^<]*)/gm
            let match;
            let season = 1;
            while ((match = nonActiveSeasonRegex.exec(seasonElement[0])) != null) {
                season++;
                const seasonData = await fetch(match[1])
                const seasonHTML = await seasonData.text()
    
                const episodePanel = (/div class="Episodes--Seasons--Episodes">[^*]*--p/).exec(seasonHTML)
                let episode = 1;
                let episodeElem;
                try {
                    while ((episodeElem = episodeRegex.exec(episodePanel[0])) != null) {
                        let episodeNumber = episodeElem[2].replace(/\D/g, '')
                        videos.push({
                            "season": season,
                            "episode": parseInt(episodeNumber) || episode,
                            "id": `${weCimaPrefix}${btoa(episodeElem[1])}`,
                            "title": episodeElem[2],
                        })
                        episode++;
                    };
                } catch(err) {}
            }
        } catch(err) {
            console.log(err);
        }
    }
    
    return({
        'meta': {
            id,
            type,
            name,
            description,
            releaseInfo,
            poster: imageURL,
            background: imageURL,
            videos,
        }
    })
}

export const weCimaPrefix = "wecima:"

export const wecimaCatalogs = [
    {
        "id": "wecima_movies",
        "type": "movie",
        "name": "Wecima",
        "idPrefixes": [weCimaPrefix],
        "extra": [
            { "name": "search", "isRequired": true }
        ]
    },
    {
        "id": "wecima_series",
        "type": "series",
        "name": "Wecima",
        "idPrefixes": [weCimaPrefix],
        "extra": [
            { "name": "search", "isRequired": true }
        ]
    }
]

function decode(str: string) {
    return str.replace(/\\u[\dA-F]{4}/gi, function (match) {
        return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
    });
}

interface searchResponse {
    metas: any[]
}