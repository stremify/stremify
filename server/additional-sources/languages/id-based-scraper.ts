import { scrapeFrembed } from "./fr/frembed";
import { scrapeKinokiste } from "./de/kinokiste";
import { scrapeMeinecloud } from "./de/meinecloud";
import { scrapeEurostreaming } from "./it/eurostreaming";
import { scrapeGuardahd } from "./it/guardahd";
import { scrapeVerdahd } from './es/verhdlink'; 
import { scrapeCinehdplus } from './es/cinehdplus';

import { convertImdbIdToTmdbId, getMovieMediaDetails, getShowMediaDetails } from "../../functions/tmdb";
import { getMedia } from "../../functions/providers";

const sources = ["showbox", "vidsrc", "vidsrcto"]

import 'dotenv/config'
const disabled_providers = process.env.disabled_foreign_providers || '';
const scrape_foreign_providers = process.env.scrape_foreign_providers || '';
const scrape_english = process.env.scrape_english || '';

const movies = new Map<string, (imdbid: string) => Promise<any>>([
    ["frembed", async (imdbid: string) => await scrapeFrembed(imdbid, 0, 0)],
    ["meinecloud", async (imdbid: string) => await scrapeMeinecloud(imdbid)],
    ["guardahd", async (imdbid: string) => await scrapeGuardahd(imdbid)],
    ["verhdlink", async (imdbid: string) => await scrapeVerdahd(imdbid)],
]);

const series = new Map<string, (imdbid: string, season: string, episode: string) => Promise<any>>([
    ["kinokiste", async (imdbid: string, season: string, episode: string) => await scrapeKinokiste(imdbid, season, episode)],
    ["cinehdplus", async (imdbid: string, season: string, episode: string) => await scrapeCinehdplus(imdbid, season, episode)],
    ["frembed", async (imdbid: string, season: string, episode: string) => await scrapeFrembed(imdbid, season, episode)],
    ["eurostreaming", async (imdbid: string, season: string, episode: string) => await scrapeEurostreaming(imdbid, season, episode)],
]);

const info = new Map<string, any>([
    ["frembed", {name: "FRembed", lang_emoji: "🇫🇷"}],
    ["meinecloud", {name: "Meinecloud", lang_emoji: "🇩🇪"}],
    ["kinokiste", {name: "Kinokiste", lang_emoji: "🇩🇪"}],
    ["cinehdplus", {name: "CineHDplus", lang_emoji: "🇪🇸🇲🇽"}],
    ["verhdlink", {name: "VerHDlink", lang_emoji: "🇪🇸🇲🇽"}],
    ["eurostreaming", {name: "EuroStreaming", lang_emoji: "🇮🇹"}],
    ["guardahd", {name: "GuardaHD", lang_emoji: "🇮🇹"}],
]);

export async function scrapeCustomProviders(list, imdb, season, episode) {
    const output: any = {
        streams: []
    };
    let sourcelist: string[] = list.split(',')
    if (episode == 0 || episode == "0") {
        for (let source of sourcelist) {
            if (source == "en" && scrape_english == "true") {
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
            } else if (disabled_providers.includes(source) != true && scrape_foreign_providers == "true"){
                const scrapingFunction = await movies.get(source);
                if (typeof scrapingFunction === 'function') {
                    const mediaResults = await scrapingFunction(imdb);
    
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
                const tmdb = await convertImdbIdToTmdbId(imdb)
                const media = await getShowMediaDetails(tmdb, season, episode)    
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
                const scrapingFunction = await series.get(source)

                if (typeof scrapingFunction === 'function') {
                    const mediaResults = await scrapingFunction(imdb, season, episode);
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