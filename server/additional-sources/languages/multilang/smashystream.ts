import { pjsExtractor } from "~/functions/playerjs/pjs_extractor"

const smashystreamBase = atob('aHR0cHM6Ly9lbWJlZC5zbWFzaHlzdHJlYW0uY29tLw==')

const smashystreamKeys = ["DTAO/DHnAR/baks","0eeda/BVfget/Nw9","boaax/2bhatSI/ZSFac","ssdeHbt/WFnaujB/7GsaodW","xNjauiev/Tmsh0sy/frtjsi"]

let ciphers = {
    '{v1}': '0',
    '{v2}': '.',
    '{v3}': '/',
    '{v4}': 'm3u8',
    '{v5}': '5'
}

export async function scrapeSmashystreamOrg(id: string, season: string, episode: string, stopAt: number) {
    const finalstreams = [];
    const players = await fetch(episode === "0" ? `${smashystreamBase}/dataaw.php?imdb=${id}` : `${smashystreamBase}/dataaa.php?imdb=${id}&season=${season}&episode=${episode}`)

    if (players.ok != true) { return([]); }

    const playerData: result = await players.json()

    /*if (smashystreamKeys = []) {
        smashystreamKeys = await pjsExtractor(atob('aHR0cDovL2VtYmVkLnNtYXNoeXN0cmVhbS5jb20vcGwzLmpz'))
    }*/

    if (playerData.url_array) {
        let i = 0;
        for (const player of playerData.url_array) {
            if (i >= stopAt) {
                return(finalstreams)
            }
            if (player.name.includes('(') != true && player.type != "iframe") {
                const sourceOutput = await fetch(player.url.replace(/\\/gm, ''))
                if (sourceOutput.ok != true) { return([]); }

                const sourceResult: sourceResult = await sourceOutput.json()

                for (let mediaURL of sourceResult.sourceUrls) {
                    mediaURL = mediaURL.replace("#4", "").replace(/\/\//gm, "")
                    
                    for (const encryptionkey of smashystreamKeys) {
                        mediaURL = mediaURL.replace(btoa(encryptionkey), "")
                    }
                    
                    mediaURL = atob(mediaURL)

                    for (const cipher in ciphers) {
                        mediaURL = mediaURL.replace(new RegExp(cipher, 'g'), ciphers[cipher])
                    }

                    if (mediaURL.includes("stream.smashystream")) {
                        finalstreams.push(await extractStreamLink(mediaURL, '', player.name))
                        break;
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
    const players = await fetch(episode === "0" ? `${smashystreamBase}/dataaw.php?imdb=${id}` : `${smashystreamBase}/dataaa.php?imdb=${id}&season=${season}&episode=${episode}`)

    if (players.ok != true) { return([]); }

    const playerData: result = await players.json()
    /*
    if (smashystreamKeys = []) {
        smashystreamKeys = await pjsExtractor(atob('aHR0cDovL2VtYmVkLnNtYXNoeXN0cmVhbS5jb20vcGwzLmpz'))
    }*/

    if (playerData.url_array) {
        for (const player of playerData.url_array) {
            if (player.name.includes(lang) && player.type != "iframe") {
                const sourceOutput = await fetch(player.url.replace(/\\/gm, ''))
                if (sourceOutput.ok != true) { return([]); }

                const sourceResult: sourceResult = await sourceOutput.json()

                for (let mediaURL of sourceResult.sourceUrls) {
                    mediaURL = mediaURL.replace("#4", "").replace(/\/\//gm, "")
                    
                    for (const encryptionkey of smashystreamKeys) {
                        mediaURL = mediaURL.replace(btoa(encryptionkey), "")
                    }
                    
                    mediaURL = atob(mediaURL)

                    for (const cipher in ciphers) {
                        mediaURL = mediaURL.replace(new RegExp(cipher, 'g'), ciphers[cipher])
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