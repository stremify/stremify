const wecimaBase = "https://wecima.show"

export async function scrapeWecima(id: string, season: string, episode: string) {

}

export async function searchWecima(query: string, mediaType) {
    const finalLinks = {"metas": []}
    const searchPath = await fetch(`${wecimaBase}/AjaxCenter/Searching/${encodeURIComponent(query)}`)
    
    if (searchPath.ok != true) { return [] }

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
    if (id.includes('wecima') != true) { return [] }
    const url = atob(id.split(':')[1])
    const pageData = await fetch(url)
    const data = await pageData.text()

    let description: any = data.match(/<div class=\"StoryMovieContent\">([^<]*)/)
    if (description && description[1]) { description = description[1] }

    let imageURL: any = data.match(/data-lazy-style=\"--img:url\(([^\)]*)/)
    if (imageURL && imageURL[1]) { imageURL = imageURL[1] }

    let meta = data.match(/<h1 dir=\"auto\" itemprop=\"name\">([^\(]*)[^>]*>([^<]*)/)
    let name;
    let releaseInfo;

    if (meta && meta[1] && meta[2]) { name = meta[1]; releaseInfo = meta[2]}

    let videos = [];
    if (type == 'series') {

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