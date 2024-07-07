// no longer used coz added to movie-web

import { convertImdbIdToTmdbId } from "../../../functions/tmdb";

const baseurl = "https://myfilestorage.xyz"

export async function scrapeMyfilestorage(id, season, episode) {
    if (episode == 0 || episode == "0") {
        let tmdb;
        if (id.includes('tt')) {
            tmdb = await convertImdbIdToTmdbId(id)
        } else {
            tmdb=id
        }
        const mediaURL = `${baseurl}/${tmdb}.mp4`

        const mediaHEAD = await fetch(mediaURL, {
            method: 'HEAD',
            headers: {
                'Referer': 'https://bflix.gs'
            }
        })

        if (mediaHEAD.ok != true) {
            return([])
        } else {
            return([{
                name: "Stremify",
                type: "url",
                url: mediaURL,
                title: `Myfilestorage - auto`,
                behaviorHints: {
                    proxyHeaders: {"request": 
                    { "Referer": "https://bflix.gs" }
                },
                notWebReady: true,
                }
            }])
        }
    } else {
        let tmdb;
        if (id.includes('tt')) {
            tmdb = await convertImdbIdToTmdbId(id)
        } else {
            tmdb=id
        }
        const mediaURL = `${baseurl}/tv/${tmdb}/s${season}e${await addleadingzero(episode)}`

        const mediaHEAD = await fetch(mediaURL, {
            method: 'HEAD',
            headers: {
                'Referer': 'https://bflix.gs'
            }
        })

        if (mediaHEAD.ok != true) {
            return([])
        } else {
            return([{
                name: "Stremify",
                type: "url",
                url: mediaURL,
                title: `Myfilestorage - auto`,
                behaviorHints: {
                    proxyHeaders: {"request": 
                    { "Referer": "https://bflix.gs" }
                },
                notWebReady: true,
                }
            }])
        }
    }
}

async function addleadingzero(i: string) {
    const num = Number(i)
    if (num <= 9) {
        return(`0${i}`)
    } else {
        return(i)
    }
}