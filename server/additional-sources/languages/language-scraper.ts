// custom providers wrapper

import 'dotenv/config'
const languages = process.env.languages?.split(',') || [];

import { scrapeFrembed } from "./fr/frembed";
import { scrapeKinokiste } from "./de/kinokiste";
import { scrapeMeinecloud } from "./de/meinecloud";
import { scrapeEurostreaming } from "./it/eurostreaming";
import { scrapeGuardahd } from "./it/guardahd";


export async function scrapeCustom(media) {
    let finalstreams = [];
    if (media.type == "movie") {
        console.log(languages)
        for (const language of languages) {
            if (language == "it") {
                const streams = await scrapeGuardahd(media.imdbId)
                if (streams != null) {
                    for (let i = 0; i < streams.length; i++) {
                        finalstreams.push(streams[i]);
                      }
                }

            } else if (language == "fr") {
                const streams = await scrapeFrembed(media.imdbId, 0, 0)
                if (streams != null) {
                    for (let i = 0; i < streams.length; i++) {
                        finalstreams.push(streams[i]);
                      }
                }
            } else if (language == "de") {
                const streams = await scrapeMeinecloud(media.imdbId)
                if (streams != null) {
                    for (let i = 0; i < streams.length; i++) {
                        finalstreams.push(streams[i]);
                      }
                }
            }
            
        }
    } else if (media.type == "show") {
        for (const language of languages) {
            if (language == "it") {
                const streams = await scrapeEurostreaming(media.imdbId, media.season.number, media.episode.number)
                if (streams != null) {
                    for (let i = 0; i < streams.length; i++) {
                        finalstreams.push(streams[i]);
                      }
                }
            } else if (language == "fr") {
                const streams = await scrapeFrembed(media.imdbId, media.season.number, media.season.episode)
                console.log(streams)
                if (streams != null) {
                    for (let i = 0; i < streams.length; i++) {
                        finalstreams.push(streams[i]);
                      }
                }
            } else if (language == "de") {
                const streams = await scrapeKinokiste(media.imdb, media.season.number, media.episode.number)
                if (streams != null) {
                    for (let i = 0; i < streams.length; i++) {
                        finalstreams.push(streams[i]);
                      }
                }
            }
            
        }
    }
    return(finalstreams)
}