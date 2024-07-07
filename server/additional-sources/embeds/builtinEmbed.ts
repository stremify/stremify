import { targets, makeProviders, makeStandardFetcher } from "@movie-web/providers"
import { makeWSFetcher } from "~/functions/fetch";
import { convertResult } from "~/functions/stream_info_conversion";

export async function extractBuiltinEmbed(url, embed, clientId?) {    
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


    try {
        const embedOutput = await scraper.runEmbedScraper({
            id: embed,
            url,
        })
        if (embedOutput.stream) {    
            return(convertResult(embedOutput.stream))
        } else {
            console.log('a')
        }
    } catch(err) {
        console.log(err)
    }
}