// custom providers wrapper

import 'dotenv/config'
const languages = process.env.foreign_provider_languages?.split(',') || [];

import { scrapeFrembed } from "./fr/frembed";
import { scrapeKinokiste } from "./de/kinokiste";
import { scrapeMeinecloud } from "./de/meinecloud";
import { scrapeEurostreaming } from "./it/eurostreaming";
import { scrapeGuardahd } from "./it/guardahd";
import { scrapeVerdahd } from './es/verhdlink'; 
import { scrapeCinehdplus } from './es/cinehdplus';


export async function scrapeCustom(imdbId, season, episode) {
    let finalstreams = [];
    if (episode == 0 || episode == "0") {
        for (const language of languages) {
            if (language.includes("it")) {
                const streams = await scrapeGuardahd(imdbId)
                if (streams != null) {
                    for (let i = 0; i < streams.length; i++) {
                        finalstreams.push(streams[i]);
                      }
                }

            } else if (language.includes("fr")) {
                const streams = await scrapeFrembed(imdbId, 0, 0)
                if (streams != null) {
                    for (let i = 0; i < streams.length; i++) {
                        finalstreams.push(streams[i]);
                      }
                }
            } else if (language.includes("de")) {
                const streams = await scrapeMeinecloud(imdbId)
                if (streams != null) {
                    for (let i = 0; i < streams.length; i++) {
                        finalstreams.push(streams[i]);
                      }
                }
            } else if (language.includes("es")) {
                const streams = await scrapeVerdahd(imdbId)
                if (streams != null) {
                    for (let i = 0; i < streams.length; i++) {
                        finalstreams.push(streams[i]);
                      }
                }
            }
            
        }
    } else {
        for (const language of languages) {
            if (language.includes("it")) {
                const streams = await scrapeEurostreaming(imdbId, season, episode)
                if (streams != null) {
                    for (let i = 0; i < streams.length; i++) {
                        finalstreams.push(streams[i]);
                      }
                }
            } else if (language.includes("fr")) {
                const streams = await scrapeFrembed(imdbId, season, episode)
                if (streams != null) {
                    for (let i = 0; i < streams.length; i++) {
                        finalstreams.push(streams[i]);
                      }
                }
            } else if (language.includes("de")) {
                const streams = await scrapeKinokiste(imdbId, season, episode)
                if (streams != null) {
                    for (let i = 0; i < streams.length; i++) {
                        finalstreams.push(streams[i]);
                      }
                }
            } else if (language.includes("es")) {
                const streams = await scrapeCinehdplus(imdbId, season, episode)
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