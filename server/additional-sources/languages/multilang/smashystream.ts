import { pjsExtractor } from "~/functions/playerjs/pjs_extractor"

const smashystreamBase = atob('aHR0cHM6Ly9lbWJlZC5zbWFzaHlzdHJlYW0uY29tLw==')

let smashystreamKeys = []

export async function scrapeSmashystreamOrg(id: string | number, season: string, episode: string, stopAt: number) {
    // original audio scraper
    const finalstreams = [];
    const players = await fetch(episode === "0" ? `${smashystreamBase}/dataaa.php?imdb=${id}` : `${smashystreamBase}/dataaa.php?imdb=${id}&season=${season}&episode=${episode}`)

    if (players.ok != true) { return([]); }

    const playerData: result = await players.json()

    if (smashystreamKeys = []) {
        smashystreamKeys = await pjsExtractor(atob('aHR0cDovL2VtYmVkLnNtYXNoeXN0cmVhbS5jb20vcGwzLmpz'))
    }

    if (playerData.url_array) {
        for (const player of playerData.url_array) {
            let i = 0;
            if (player.type != "iframe" && player.name.includes("(") != true) {
                if (i >= stopAt) { return finalstreams;}
                const sourceOutput = await fetch(player.url.replace(/\\/gm, ''))
                if (sourceOutput.ok != true) { return([]); }

                const sourceResult: sourceResult = await sourceOutput.json()

                for (let mediaURL of sourceResult.sourceUrls) {
                    mediaURL = mediaURL.replace("#2", "").replace(/\\\//gm, "")

                    for (const key of smashystreamKeys) {
                        mediaURL = mediaURL.replace(btoa(key), "")
                    }

                    finalstreams.push({
                        name: `Stremify`,
                        type: "url",
                        url: mediaURL,
                        title: `Smashhystream - auto (${player.name})`,
                        behaviorHints: {
                            bingeGroup: `smashystream_auto_${encodeURIComponent(player.name)}`,
                            proxyHeaders: {},
                            notWebReady: false,
                        }
                    })
                    i++;
                }
            }
        }
    }
    return(finalstreams)
}

export async function scrapeSmashystreamLang(id: string, season: string, episode: string, lang: string) {
    // specifically scrapes a certain language
    const finalstreams = [];
    const players = await fetch(episode === "0" ? `${smashystreamBase}/dataaa.php?imdb=${id}` : `${smashystreamBase}/dataaa.php?imdb=${id}&season=${season}&episode=${episode}`)

    if (players.ok != true) { return([]); }

    const playerData: result = await players.json()

    if (smashystreamKeys = []) {
        smashystreamKeys = await pjsExtractor(atob('aHR0cDovL2VtYmVkLnNtYXNoeXN0cmVhbS5jb20vcGwzLmpz'))
    }

    if (playerData.url_array) {
        for (const player of playerData.url_array) {
            if (player.name.includes(lang) && player.type != "iframe") {
                const sourceOutput = await fetch(player.url.replace(/\\/gm, ''))
                if (sourceOutput.ok != true) { return([]); }

                const sourceResult: sourceResult = await sourceOutput.json()

                for (let mediaURL of sourceResult.sourceUrls) {
                    mediaURL = mediaURL.replace("#2", "").replace(/\\\//gm, "")

                    for (const key of smashystreamKeys) {
                        mediaURL = mediaURL.replace(btoa(key), "")
                    }

                    if (mediaURL.includes("stream.smashystream")) {
                        finalstreams.push(await extractStreamLink(mediaURL, lang, player.name))
                        break;
                    }

                    finalstreams.push({
                        name: `Stremify ${lang}`,
                        type: "url",
                        url: mediaURL,
                        title: `Smashhystream - auto (${player.name})`,
                        behaviorHints: {
                            bingeGroup: `smashystream_auto_${encodeURIComponent(player.name)}`,
                            proxyHeaders: {},
                            notWebReady: false,
                        }
                    })
                }
            }
        }
    }
    return(finalstreams)
}

async function extractStreamLink(mediaURL, lang, playername) {
    // either way we will have to add a proxy header to either use their proxy or the stream directly
    // at that point might as well extract the headers ourselves to not put load on their proxy
    const urlregex = /(https%3A%2F[^\/]*)\/([^\/]*)/ // first path is the URL itself, second is the headers

    const data = urlregex.exec(mediaURL)
    
    const newURL = decodeURIComponent(data[1])
    const headers = decodeURIComponent(data[2])

    return({
        name: `Stremify ${lang}`,
        type: "url",
        url: newURL,
        title: `Smashhystream - auto (${playername})`,
        behaviorHints: {
            bingeGroup: `smashystream_auto_${encodeURIComponent(playername)}`,
            proxyHeaders: {"request": JSON.parse(headers)},
            notWebReady: true,
        }
    })
}

interface result {
    tmdb:      number;
    imdb:      string;
    title:     string;
    season:    string;
    episode:   string;
    type:      string;
    poster:    string;
    year:      Date;
    url_array: playerArray[];
}

interface playerArray {
    url:  string;
    name: string;
    type: "iframe" | "player";
}

interface sourceResult {
    sourceUrls: string[];
    subtitles:  null;
}