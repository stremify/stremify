import { getMovieMediaDetails, convertImdbIdToTmdbId } from "../../../functions/tmdb";
import { getMedia } from "../../../functions/providers";
import { scrapeCustom } from "../../../additional-sources/languages/language-scraper";
import 'dotenv/config'
const scrape_english = process.env.scrape_english
const sources = ["showbox", "vidsrc", "vidsrcto"] // the other sources seemingly do not work - either with Stremio or as a whole, please open up a PR or an issue if you have any idea why as I was not able to figure it out


export default eventHandler(async (event) => {
    const output: any = {
        streams: []
    };

    const path = getRouterParam(event, 'imdb')
    const imdb = path.split('.')[0];

    if (scrape_english == "true") {
        const tmdb = await convertImdbIdToTmdbId(imdb)
        const media = await getMovieMediaDetails(tmdb)

        for (const source of sources) {
            const stream = await getMedia(media, source)
            for (const embed in stream) {
                const streams = stream[embed].stream;
                for (const streamItem of streams) {
                    if (streamItem.type === "file") {
                        for (const qualityKey in streamItem.qualities) {
                            const quality = streamItem.qualities[qualityKey];
                            output.streams.push({
                                name: "Stremify",
                                type: "url",
                                url: quality.url,
                                title: `${source} - ${qualityKey}p (${embed})`
                            });
                        }
                    } else if (streamItem.type == "hls") {
                        output.streams.push({
                            name: "Stremify",
                            type: "url",
                            url: streamItem.playlist,
                            title: `${source} - auto (${embed})`
                        })
                    }
                }
            }


        }
    }


    const foreignstreams = await scrapeCustom(imdb, 0, 0)

    for (const foreignstream of foreignstreams) {
        output.streams.push(foreignstream)
    }

    return output;
});