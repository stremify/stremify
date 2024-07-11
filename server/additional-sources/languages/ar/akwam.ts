const akwamBase = "https://ak.sv"

export async function scrapeAkwam(id: string) {
    if (id.includes(akwamPrefix) != true) { return [] }

    const url = decodeURIComponent(atob(id.split(':')[1]))
    const episodePage = await fetch(url)
    const episodePageData = await episodePage.text()

    const linkShortener = episodePageData.match(/(http:\/\/go.ak.sv\/[^"]*)/)
    const shortenerPage = await fetch(linkShortener[1])
    const shortenerData = await shortenerPage.text();

    const streamingPageURL = shortenerData.match(/(https:\/\/ak\.sv[^"]*)/)
    const streamingPage = await fetch(streamingPageURL[1])
    const streamingPageData = await streamingPage.text()

    const videoURL = streamingPageData.match(/<source[^*]*?src=\"([^"]*)/)

    if (videoURL) {
        return([{
            name: "Stremify AR",
            type: "url",
            url: videoURL[1],
            title: "Akwam",
            behaviorHints: {
                bingeGroup: `akwam`,
            }
        }])
    }
}

export async function searchAkwam(query: string, mediaType: 'movie' | 'series') {
    const finalLinks = {"metas": []}

    const searchURL = await fetch(`${akwamBase}/search?q=${query.replace(/ /g, '+')}`);
    const searchData = await searchURL.text();

    const searchRegex = /<div class=\"entry-image\">[^*]*?href=\"([^"]*)"[^*]*?href=\"[^*]*?data-src="([^"]*)"[^*]*?alt=\"([^"]*)/gm;

    let match;
    while ((match = searchRegex.exec(searchData)) != null) {
        const type = match[1].includes('series') ? 'series' : 'movie'
        if (type == mediaType) {
            finalLinks.metas.push({
                'id': `${akwamPrefix}${btoa(encodeURIComponent(match[1]))}`,
                type,
                'name': match[3],
                'poster': match[2]
            })
        }
    };

    return(finalLinks)
}

export async function getAkwamMeta(id: string, type: 'movie' | 'series') {
    if (id.includes(akwamPrefix) != true) { return [] }
    const url = decodeURIComponent(atob(id.split(':')[1]))
    const pageData = await fetch(url)
    const data = await pageData.text()

    const meta = data.match(/text-white font-size-18\" style=\"line-height: 1.7;\">([^<]*)<p>([^<]*)/)
    let name;
    let description;
    if (meta) { name = meta[1]; description = meta[2]; };

    let poster: any = data.match(/<a href=\"([^"]*)" data-fancybox/)
    if (poster) { poster = poster[1]; };

    const meta2 = data.match(/<div class=\"row py-4\">[^*]*?<span class=\"mx-2\">10 \/ ([^<]*)[^*]*?<div class="font-size-16 text-white mt-2"><span>[^*]*?<div class="font-size-16 text-white mt-2"><span>[^*]*?<div class="font-size-16 text-white mt-2"><span>[^*]*?<div class="font-size-16 text-white mt-2"><span>[^0-9]*([^<]*)/)
    let releaseInfo;
    let imdbRating;
    if (meta2) {
        releaseInfo = meta2[2];
        imdbRating = parseInt(meta2[1]);
    }

    const videos = [];
    if (type == 'series') {
        const seriesRegex = /<div class="bg-primary2 p-4 col-lg-4 col-md-6 col-12" style="margin-bottom: 2px">[^*]*?<a href=\"([^"]*)\" class=\"text-white\">([^<]*)[^*]*?src=\"([^"]*)/gm
        let match;
        let episode = 1;
        while ((match = seriesRegex.exec(data)) != null) {
            videos.push({
                episode,
                "id": `${akwamPrefix}${btoa(encodeURIComponent(match[1]))}`,
                "title": match[2],
                "thumbnail": match[3],
            })
        }
    }

    return({
        'meta': {
            id,
            type,
            name,
            description,
            releaseInfo,
            poster,
            background: poster,
            videos,
            imdbRating,
        }
    })
}

export const akwamPrefix = "akwam:"

export const akwamCatalog = [
    {
        "id": "akwam_movies",
        "type": "movie",
        "name": "Akwam",
        "idPrefixes": [akwamPrefix],
        "extra": [
            { "name": "search", "isRequired": true }
        ]
    },
    {
        "id": "akwam_series",
        "type": "series",
        "name": "Akwam",
        "idPrefixes": [akwamPrefix],
        "extra": [
            { "name": "search", "isRequired": true }
        ]
    }
]