// enable at your own risk
import { convertImdbIdToTmdbId, getEpisodeIMDbID, getMovieMediaDetails, getShowMediaDetails } from "../../../functions/tmdb"

const server1 = `https://s1.goquick.st`
const server2 = `https://s2.goquick.st`

export async function scrapeGoquick(imdb, season, episode) {
    let finalstreams = []
    
    if (episode == 0) {
        const tmdb = await convertImdbIdToTmdbId(imdb)
        const movie_media = await getMovieMediaDetails(tmdb)
        const url = `${server1}/play/${imdb}/${encodeURIComponent(movie_media.title)}?season=&episode=`
        const playerData = await fetch(url, {
            headers: {
                "Referer": "https://streamium.st"
            }
        })
        
        if (playerData.ok != true) {
            return([])
        }

        const playerText = await playerData.text()

        const videoRegex = /<source src=\"([^"]*)"/

        const videoPath = videoRegex.exec(playerText)[1]

        finalstreams.push({
            name: "Stremify",
            type: "url",
            url: `${server1}${videoPath}`,
            title: `GoQuick - auto (server 1)`,
        })

        finalstreams.push({
            name: "Stremify",
            type: "url",
            url: `${server2}${videoPath}`,
            title: `GoQuick - auto (server 2)`,
        })
    } else {

        const tmdb = await convertImdbIdToTmdbId(imdb)

        const episodeId = await getEpisodeIMDbID(tmdb, season, episode)

        const movie_media = await getShowMediaDetails(tmdb, season, episode)

        const fullurl = `${server1}/play/${episodeId}/${encodeURIComponent(movie_media.title)}?season=${season}&episode=${episode}`

        const playerData = await fetch(`${fullurl}`, {
            headers: {
                "Referer": "https://streamium.st"
            }
        })
        
        if (playerData.ok != true) {
            return([])
        }

        const playerText = await playerData.text()
        
        const videoRegex = /<source src=\"([^"]*)"/

        const videoPath = videoRegex.exec(playerText)[1]

        finalstreams.push({
            name: "Stremify",
            type: "url",
            url: `${server1}${videoPath}`,
            title: `GoQuick - auto (server 1)`,
        })

        finalstreams.push({
            name: "Stremify",
            type: "url",
            url: `${server2}${videoPath}`,
            title: `GoQuick - auto (server 2)`,
        })
    }
    return(finalstreams)
}