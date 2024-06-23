import { SourcererOutput, getBuiltinSources, targets, makeProviders, makeStandardFetcher } from "@movie-web/providers"
import { makeWSFetcher } from "~/functions/fetch";

let sources = []
const disabled_sources = ["nsbx", "smashystream"]

import 'dotenv/config'
const timeoutTime = parseInt(process.env.provider_timeout) || 30000;


export async function scrapeBuiltIn(media, clientId?: string) {
    const streams = []
    let fetcher;
    if (clientId != null) {
        fetcher = makeWSFetcher(clientId)
    } else {
        fetcher = globalThis.fetch;
    }
    const scraper = makeProviders({
        fetcher: makeStandardFetcher(fetcher),
        target: targets.NATIVE
    })

    if (sources.length === 0) {
        const builtInsSourceList = await getBuiltinSources()

        for (const source of builtInsSourceList) {
            if (source.disabled != true && disabled_sources[source.id] == null) {
                sources.push(source.id)
            }
        }    
    }

    const promises = sources.map((source) => {
        try {
            return Promise.race([
                (async () => {
                    try {
                        const sourceOutput: SourcererOutput = await scraper.runSourceScraper({
                            id: source,
                            media,
                        })
            
                        if (sourceOutput.stream) {
                            streams.push({
                                source,
                                stream: sourceOutput.stream,
                            })
                        } 
                        
                        if (sourceOutput.embeds) {
                            for (const embed of sourceOutput.embeds) {
                                try {
                                    const embedOutput = await scraper.runEmbedScraper({
                                        id: embed.embedId,
                                        url: embed.url,
                                    })
                                
                                    if (embedOutput.stream) {
                                        streams.push({
                                            source,
                                            embed: embed.embedId,
                                            stream: embedOutput.stream,
                                        })
                                    }
                                } catch(error) {
                                    return null;
                                }
                            }
                        }
                    } catch(error) {
                        return null;
                    }
                })(),
                timeout(timeoutTime)
            ])
        } catch {
            return null;
        }

    })

    await Promise.all(promises)

    return streams;
}

export function timeout(ms) {
    return new Promise((reject) => {
        setTimeout(() => {
            reject(new Error("timed out"));
        }, ms);
    });
}
