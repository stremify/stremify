import { scrapeFrembed } from "./fr/frembed";
import { scrapeKinokiste } from "./de/kinokiste";
import { scrapeMeinecloud } from "./de/meinecloud";
import { scrapeEurostreaming } from "./it/eurostreaming";
import { scrapeGuardahd } from "./it/guardahd";
import { scrapeVerdahd } from './es/verhdlink'; 
import { scrapeCinehdplus } from './es/cinehdplus';
import { scrapeFrenchcloud } from "./fr/frenchcloud";
import { scrapeDramacool } from "./multilang/dramacool";
import { scrapeBuiltIn } from "~/functions/built_in_wrapper";
import { convertResult } from "~/functions/stream_info_conversion";
import { convertImdbIdToTmdbId, getMovieMediaDetails, getShowMediaDetails } from "../../functions/tmdb";

import 'dotenv/config'
const disabled_providers = process.env.disabled_custom_providers || '';
const scrape_custom_providers = process.env.scrape_custom_providers || 'true';
const scrape_built_in = process.env.scrape_built_in || 'false';

const movies: Map<string, (imdbid: string, media?: any) => Promise<any>> = new Map([
    ["frembed", async (imdbid: string) => await scrapeFrembed(imdbid, 0, 0)],
    ["meinecloud", async (imdbid: string) => await scrapeMeinecloud(imdbid)],
    ["guardahd", async (imdbid: string) => await scrapeGuardahd(imdbid)],
    ["verhdlink", async (imdbid: string) => await scrapeVerdahd(imdbid)],
    ["frenchcloud", async (imdbid: string) => await scrapeFrenchcloud(imdbid)],
    //["goquick", async (imdbid: string) => await scrapeGoquick(imdbid, 0, 0)],
]);

const series = new Map<string, (imdbid: string, season: string, episode: string, media?: any) => Promise<any>>([
    ["kinokiste", async (imdbid: string, season: string, episode: string) => await scrapeKinokiste(imdbid, season, episode)],
    ["cinehdplus", async (imdbid: string, season: string, episode: string) => await scrapeCinehdplus(imdbid, season, episode)],
    ["frembed", async (imdbid: string, season: string, episode: string) => await scrapeFrembed(imdbid, season, episode)],
    ["eurostreaming", async (imdbid: string, season: string, episode: string) => await scrapeEurostreaming(imdbid, season, episode)],
    ["dramacool", async (imdbid: string, season: string, episode: string, media?: any) => await scrapeDramacool(imdbid, season, episode, media)],
    //["goquick", async (imdbid: string, season: string, episode: string) => await scrapeGoquick(imdbid, season, episode)],
]);

const info = new Map<string, any>([
    ["frembed", {name: "FRembed", lang_emoji: "🇫🇷"}],
    ["frenchcloud", {name: "Frenchcloud", lang_emoji: "🇫🇷"}],
    ["meinecloud", {name: "Meinecloud", lang_emoji: "🇩🇪"}],
    ["kinokiste", {name: "Kinokiste", lang_emoji: "🇩🇪"}],
    ["cinehdplus", {name: "CineHDplus", lang_emoji: "🇪🇸🇲🇽"}],
    ["verhdlink", {name: "VerHDlink", lang_emoji: "🇪🇸🇲🇽"}],
    ["eurostreaming", {name: "EuroStreaming", lang_emoji: "🇮🇹"}],
    ["guardahd", {name: "GuardaHD", lang_emoji: "🇮🇹"}],
    ["dramacool", {name: "DramaCool", lang_emoji: "🎭"}],
    //["myfilestorage", {name: "Myfilestorage", lang_emoji: "🎥"}],
    //["goquick", {name: "GoQuick", lang_emoji: "🎥"}],
    //["moviesapi", {name: "MoviesAPI", lang_emoji: "🎥"}],
]);

export async function scrapeCustomProviders(list, id, season, episode, media?) {
    console.log(scrape_built_in)
    const output: any = {
        streams: []
    };
    let sourcelist: string[] = list.split(',')
    console.log(sourcelist)
    if (episode == 0 || episode == "0") {
        for (let source of sourcelist) {
            console.log(source)

            if (source == "built-in") {
                if (scrape_built_in == "false") { continue; }
                if (media == null) {
                    let tmdb
                    if (id.startsWith('tmdb') == true) {
                        tmdb = id.split(':')[1]
                    } else {
                        tmdb = await convertImdbIdToTmdbId(id)
                        if (tmdb == null) {
                            continue;
                        }
                    }
                    media = await getMovieMediaDetails(tmdb)  
                    if (media == null) {
                        continue;
                    }            
                }
                const builtinOutput = await scrapeBuiltIn(media)

                for (const result of builtinOutput) {
                    output.streams.push(await convertResult(result))
                }
            } else if (disabled_providers.includes(source) != true && scrape_custom_providers == "true"){
                console.log('custom')
                try {
                    const scrapingFunction = await movies.get(source);
                    if (typeof scrapingFunction === 'function') {
                        const mediaResults = await scrapingFunction(id);
                        if (mediaResults != null && Array.isArray(mediaResults)) {
                            for (let mediaResult of mediaResults) {
                                output.streams.push(mediaResult)
                            }
                        }
                    }
                } catch(error) {
                    console.log(error)
                }
            }
        }
    } else {
        for (let source of sourcelist) {
            if (source == "built-in" && scrape_built_in == "true") {
                let tmdb;
                if (media == null) {
                    if (id.startsWith('tmdb') == true) {
                        tmdb = id.split(':')[1]
                    } else {
                        tmdb = await convertImdbIdToTmdbId(id)
                        if (tmdb == null) {
                            continue;
                        }
                    }
                    try {
                        media = await getShowMediaDetails(tmdb, season, episode)
                        if (media == null) {
                            continue;
                        } 
                    } catch {
                        continue;
                    }
                }

                const builtinOutput = await scrapeBuiltIn(media)

                for (const result of builtinOutput) {
                    output.streams.push(await convertResult(result))
                }
            } else if (disabled_providers.includes(source) != true && scrape_custom_providers == "true"){
                try {
                    const scrapingFunction = await series.get(source)
                    if (typeof scrapingFunction === 'function') {
                        const mediaResults = await scrapingFunction(id, season, episode, media);
                        if (mediaResults != null && Array.isArray(mediaResults)) {
                            for (let mediaResult of mediaResults) {
                                output.streams.push(mediaResult)
                            }
                        }
                    }
                } catch(error) {
                    console.log(error)
                }
            }
        }
    }
    return(output)
}

export async function buildHTMLselectors() {
    let selector = ''
    if (scrape_built_in == "true") {
        selector = `${selector}       
            <input type="checkbox" id="built-in" name="built-in" value="built-in">
            <label for="built-in">🎥 Built-in Providers</label><br>`
    }
    info.forEach((value, key) => {
        if (disabled_providers.includes(key) != true && scrape_custom_providers == "true") {
            selector = `${selector}       
        <input type="checkbox" id="${key}" name="${key}" value="${key}">
        <label>${value.lang_emoji} ${value.name}</label><br>`
        }
    });
    return (`
        <h3>Configure</h3>
        <form id="language-form">
        ${selector}
    </form>`)
}