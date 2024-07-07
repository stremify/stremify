// unfinished code 
/*import { getMovieMediaDetails, getShowMediaDetails, convertImdbIdToTmdbId } from "../../../functions/tmdb";
import { resolveMoviesapi } from "../../embeds/moviesapi";


const baseurl = `http://moviesapi.club`

export async function scrapeMoviesapi(id, season, episode, media?) {
    let finalstreams = []
    if (episode == 0) {
        if (id.includes('tt') == true) {
            id = await convertImdbIdToTmdbId(id)
        } else if (media) {
            id = media.tmdbId
        }

        const player = await fetch(`${baseurl}/movie/${id}`, {
            headers: {
                'Referer': 'https://moviesapi.club'
            }
        })
        if (player.ok != true) {
            return([])
        }

        const playerData = await player.text()
        const iframeRegex = /class=\"vidframe\" src=\"([^"]*)"/

        const iframesrc = iframeRegex.exec(playerData)[1]

        if (iframesrc) {
            const url = await resolveMoviesapi(new URL(iframesrc))
            console.log(url)
            if (url) {
               
            }
        }
    } else {

    }

    return(finalstreams)

}*/