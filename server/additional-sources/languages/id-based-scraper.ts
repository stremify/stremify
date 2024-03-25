import { scrapeFrembed } from "./fr/frembed";
import { scrapeKinokiste } from "./de/kinokiste";
import { scrapeMeinecloud } from "./de/meinecloud";
import { scrapeEurostreaming } from "./it/eurostreaming";
import { scrapeGuardahd } from "./it/guardahd";
import { scrapeVerdahd } from './es/verhdlink'; 
import { scrapeCinehdplus } from './es/cinehdplus';
import { scrapeFrenchcloud } from "./fr/frenchcloud";

import { convertImdbIdToTmdbId, getMovieMediaDetails, getShowMediaDetails } from "../../functions/tmdb";
import { getMedia } from "../../functions/providers";

const sources = ["showbox", "vidsrc", "vidsrcto"]

import 'dotenv/config'
import { scrapeDramacool } from "./multilang/dramacool";
const disabled_providers = process.env.disabled_foreign_providers || '';
const scrape_foreign_providers = process.env.scrape_foreign_providers || '';
const scrape_english = process.env.scrape_english || '';

const movies: Map<string, (imdbid: string, media?: any) => Promise<any>> = new Map([
    ["frembed", async (imdbid: string) => await scrapeFrembed(imdbid, 0, 0)],
    ["meinecloud", async (imdbid: string) => await scrapeMeinecloud(imdbid)],
    ["guardahd", async (imdbid: string) => await scrapeGuardahd(imdbid)],
    ["verhdlink", async (imdbid: string) => await scrapeVerdahd(imdbid)],
    ["frenchcloud", async (imdbid: string) => await scrapeFrenchcloud(imdbid)],
    ["dramacool", async (imdbid: string, media?: any) => scrapeDramacool(imdbid, 0, 0, media)]
]);

const series = new Map<string, (imdbid: string, season: string, episode: string, media?: any) => Promise<any>>([
    ["kinokiste", async (imdbid: string, season: string, episode: string) => await scrapeKinokiste(imdbid, season, episode)],
    ["cinehdplus", async (imdbid: string, season: string, episode: string) => await scrapeCinehdplus(imdbid, season, episode)],
    ["frembed", async (imdbid: string, season: string, episode: string) => await scrapeFrembed(imdbid, season, episode)],
    ["eurostreaming", async (imdbid: string, season: string, episode: string) => await scrapeEurostreaming(imdbid, season, episode)],
    ["dramacool", async (imdbid: string, season: string, episode: string, media?: any) => scrapeDramacool(imdbid, season, episode, media)]
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
    ["dramacool", {name: "DramaCool", lang_emoji: "🇰🇷🇯🇵🇨🇳🇹🇭🇹🇼"}],
]);

export async function scrapeCustomProviders(list, id, season, episode, media?) {
    const output: any = {
        streams: []
    };
    let sourcelist: string[] = list.split(',')
    if (episode == 0 || episode == "0") {
        for (let source of sourcelist) {
            if (source == "en" && scrape_english == "true") {
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
            } else if (disabled_providers.includes(source) != true && scrape_foreign_providers == "true"){
                const scrapingFunction = await movies.get(source);
                if (typeof scrapingFunction === 'function') {
                    const mediaResults = await scrapingFunction(id);
    
                    if (mediaResults != null && Array.isArray(mediaResults)) {
                        for (let mediaResult of mediaResults) {
                            output.streams.push(mediaResult)
                        }
                    }
                }
            }
        }
    } else {
        for (let source of sourcelist) {

            if (source == "en" && scrape_english == "true") {
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
                    console.log(tmdb, season, episode)
                    try {
                        media = await getShowMediaDetails(tmdb, season, episode)
                        if (media == null) {
                            continue;
                        } 
                    } catch {
                        continue;
                    }
                }
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
                                            title: `${source} - ${qualityKey}p (${embed})`,
                                            behaviorHints: {
                                                bingeGroup: `en_${source}_${embed}_${qualityKey}`
                                            }
                                        });
                                    }
                                } else if (streamItem.type == "hls") {
                                    output.streams.push({
                                        name: "Stremify",
                                        type: "url",
                                        url: streamItem.playlist,
                                        title: `${source} - auto (${embed})`,
                                        behaviorHints: {
                                            bingeGroup: `en_${source}_${embed}`
                                        }
                                    })
                                }
                            }
                    }
                        
                    
                }
            } else if (disabled_providers.includes(source) != true && scrape_foreign_providers == "true"){
                const scrapingFunction = await series.get(source)
                if (typeof scrapingFunction === 'function') {
                    const mediaResults = await scrapingFunction(id, season, episode, media);
                    if (mediaResults != null && Array.isArray(mediaResults)) {
                        for (let mediaResult of mediaResults) {
                            output.streams.push(mediaResult)
                        }
                    }
                }
            }
        }
    }

    return(output)
}

export async function buildHTMLselectors() {
    let selector = ''
    if (scrape_english == "true") {
        selector = `${selector}       
            <input type="checkbox" id="en" name="en" value="en">
            <label for="en">🇬🇧 Built-in English Providers</label><br>`
    }
    info.forEach((value, key) => {
        if (disabled_providers.includes(key) != true && scrape_foreign_providers == "true") {
            selector = `${selector}       
        <input type="checkbox" id="${key}" name="${key}" value="${key}">
        <label for="en">${value.lang_emoji} ${value.name}</label><br>`
        }
    });
    return (`
        <h3>Configure</h3>
        <form id="language-form">
        ${selector}
    </form>`)
}