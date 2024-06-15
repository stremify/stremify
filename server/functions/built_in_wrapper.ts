import { EmbedOutput, SourcererOutput, getBuiltinSources, targets, makeProviders, makeStandardFetcher } from "@movie-web/providers"
import { makeWSFetcher } from "~/functions/fetch";

let sources = []

export async function scrapeBuiltIn(media, peerId?: string) {
    const streams = []

    let fetcher;
    if (peerId != null) {
        fetcher = makeWSFetcher(peerId)
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
            if (source.disabled != true) {
                sources.push(source.id)
            }
        }    
    }

    for (const source of sources) {
        if (source == "nsbx") { continue; }
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
                        continue;
                    }
                }
            }
        } catch(error) {
            continue;
        }
    }

    return streams;
}