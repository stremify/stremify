import { scrapeCustom } from "../../../additional-sources/languages/language-scraper";
import { getShowMediaDetails } from "../../../functions/tmdb";
import { convertImdbIdToTmdbId } from "../../../functions/tmdb";
export default eventHandler(async (event) => {
    
    const path = getRouterParam(event, 'imdb')
    const nonEncoded = decodeURIComponent(path)
    const imdb = nonEncoded.split('.')[0];
    const mediaInfo = {
        imdbid: imdb.split(':')[0],
        season: imdb.split(':')[1],
        episode: imdb.split(':')[2],
    }
    const tmdb = await convertImdbIdToTmdbId(mediaInfo.imdbid)

    console.log(mediaInfo)
    const media = await getShowMediaDetails(tmdb, mediaInfo.season, mediaInfo.episode)
    console.log(media)
    const scraper = await scrapeCustom(media)

    return(scraper)
})
/*
import { scrapeCustom } from "../../../additional-sources/languages/language-scraper";
import { convertImdbIdToTmdbId } from "../../../functions/tmdb";
import { getMovieMediaDetails } from "../../../functions/tmdb";

export default eventHandler(async (event) => {
    
    const path = getRouterParam(event, 'imdb')
    const imdb = path.split('.')[0];
    const tmdb = await convertImdbIdToTmdbId(imdb)
    const media = await getMovieMediaDetails(tmdb)


    const scraper = await scrapeCustom(media)

    return(scraper)
})*/