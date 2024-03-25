// this source requires an IMDB api key

import { convertImdbIdToTmdbId, getMovieMediaDetails, getShowMediaDetails, totalEpisodes } from "../../../functions/tmdb"

import 'dotenv/config'
import { pladaricResolver } from "../../embeds/pladric"

const tmdb_api_key = process.env.TMDB_API_KEY

const baseurl = 'https://dramacool.com.pa'


export async function scrapeDramacool(id, season, episode, media ? ) {
    let finalstreams = []
    if (tmdb_api_key == null || tmdb_api_key == '' && media == null) {
        console.warn('No TMDB API key provided, it is required for dramacool.')
        return ([])
    }


    if (episode == 0) {
        if (media == null) {
            if (id.includes('tt') == true) {
                id = await convertImdbIdToTmdbId(id)
                if (id == null) {
                    return([])
                }
                media = await getMovieMediaDetails(id)
                if (media == null) {
                    return([])
                }
            } else if (id.includes('tmdb')) {
                media = await getMovieMediaDetails(id)
                if (media == null) {
                    return([])
                }
            } else {
                return ([])
            }

            const searchResults = await fetch(`https://dramacool.com.pa/search?type=movies&keyword=${encodeURIComponent(media.title)}`)
            if (searchResults.ok != true) {
                return ([])
            }

            const searchResultsResponse = await searchResults.text()

            const URLRegex = /<a[^>]*href="([^"]*)"[^>]*class="img">/g;
            let match
            while ((match = URLRegex.exec(searchResultsResponse)) !== null) {

                if (match.index === URLRegex.lastIndex) {
                    URLRegex.lastIndex++;
                }

                const link = match[1];


                const episodeData = await fetch(`${baseurl}/${link}`)

                if (episodeData.ok != true) {
                    return ([])
                }

                const nameRegex = /<h1>([^"]*)<\/h1>/

                const name = nameRegex.exec(await episodeData.text())[1]

                const episodeurl = await fetch(`${baseurl}/${link.split('/')[2]}-episode-1.html`)

                if (episodeurl.ok != true) {
                    return ([])
                }

                const iframe_regex = /<iframe [^']* src="(\/\/pladrac[^"]*)/

                const iframe = iframe_regex.exec(await episodeurl.text())[1]

                const iframeData = await fetch(`https:${iframe}`)

                if (iframeData.ok != true) {
                    return ([])
                }

                const embedplusRegex = /https:\/\/pladrac.net\/embedplus\?[^']*/

                const embedplus = embedplusRegex.exec(await iframeData.text())[0]

                const finalURL = await pladaricResolver(new URL(`https${embedplus}`))

                if (finalURL != null) {
                    finalstreams.push({
                        name: "Stremify",
                        type: "url",
                        url: finalURL,
                        title: `DramaCool - ${name}`
                    })
                }
            }
        }

        } else {
            console.log(media)
            if (media == null) {
                if (id.includes('tt')) {
                    const tmdb = await convertImdbIdToTmdbId(id)
                    if (tmdb == null) {
                        return([])
                    }
                    media = await getShowMediaDetails(tmdb, season, episode)
                    if (media == null) {
                        return([])
                    }
                } else if (id.includes('tmdb')) {
                    media = await getShowMediaDetails(id, season, episode)
                } else {
                    return ([])
                }
            }
            const searchResults = await fetch(`https://dramacool.com.pa/search?type=movies&keyword=${encodeURIComponent(media.title)}`)
            if (searchResults.ok != true) {
                return ([])
            }

            const searchResultsResponse = await searchResults.text()

            const URLRegex = /<a[^>]*href="([^"]*)"[^>]*class="img">/g;
            let match
            while ((match = URLRegex.exec(searchResultsResponse)) !== null) {

                if (match.index === URLRegex.lastIndex) {
                    URLRegex.lastIndex++;
                }

                const link = match[1];


                const episodeData = await fetch(`${baseurl}/${link}`)

                if (episodeData.ok != true) {
                    return ([])
                }

                const nameRegex = /<h1>([^"]*)<\/h1>/

                const name = nameRegex.exec(await episodeData.text())[1]

                const episodeurl = await fetch(`${baseurl}/${link.split('/')[2]}-episode-${episode}.html`)

                if (episodeurl.ok != true) {
                    return ([])
                }

                const iframe_regex = /<iframe [^']* src="(\/\/pladrac[^"]*)/

                const iframe = iframe_regex.exec(await episodeurl.text())[1]

                const iframeData = await fetch(`https:${iframe}`)

                if (iframeData.ok != true) {
                    return ([])
                }

                const embedplusRegex = /https:\/\/pladrac.net\/embedplus\?[^']*/

                const embedplus = embedplusRegex.exec(await iframeData.text())[0]

                const finalURL = await pladaricResolver(new URL(`https${embedplus}`))

                if (finalURL != null) {
                    finalstreams.push({
                        name: "Stremify",
                        type: "url",
                        url: finalURL,
                        title: `DramaCool - ${name} S${season} E${episode}`,
                        behaviorHints: {
                            bingeGroup: `dramacool_${encodeURIComponent(name)}`
                        }
                    })
                }
            }
        }
        return (finalstreams)
    }
