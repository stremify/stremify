export async function convertResult(result) {
    if (result.stream[0].type == "hls") {
        const streamElement = {
            name: "Stremify",
            type: "url",
            url: result.stream[0].playlist,
            title: `${result.source} - auto (${result.embed || result.source})`,
            behaviorHints: {
                bingeGroup: `en_${result.source}_${result.embed || result.source}`,
                proxyHeaders: {},
                notWebReady: false,
            }
        }

        const headers = result.stream[0].headers
        if (headers) {
            streamElement.behaviorHints.proxyHeaders = {
                "request": headers
            };
            streamElement.behaviorHints.notWebReady = true;
        }

        return (streamElement)

    } else if (result.stream[0].type == "file") {
        for (const qualities in result.stream[0].qualities) {
            const quality = result.stream[0].qualities[qualities];
            let streamElement = {
                name: "Stremify",
                type: "url",
                url: quality.url,
                title: `${result.source} - ${qualities} (${result.embed || result.source})`,
                behaviorHints: {
                    bingeGroup: `en_${result.source}_${result.embed}_${quality}`,
                    proxyHeaders: {},
                    notWebReady: false,
                }
            }

            const headers = result.stream[0].headers
            if (headers) {
                streamElement.behaviorHints.proxyHeaders = {
                    "request": headers
                };
                streamElement.behaviorHints.notWebReady = true;
            }

            return (streamElement);
        }
    }
}