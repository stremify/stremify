/**
 * This file includes code derived from @movie-web/providers by movie-web.
 * @movie-web/providers is licensed under the MIT License.
 * 
 * You can find the original source and license at:
 * https://github.com/movie-web/providers
 * 
 * MIT License
 * 
 * Copyright (c) 2023 movie-web
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import {makeProviders, makeStandardFetcher, targets, SourcererOutput, NotFoundError} from '@movie-web/providers';

const providers = makeProviders({
    fetcher: makeStandardFetcher(fetch),
    target: targets.NATIVE, // check out https://movie-web.github.io/providers/essentials/targets
})

export async function getMedia(media, source) {
    let output: SourcererOutput;
    try {
        output = await providers.runSourceScraper({
            id: source,
            media: media,
        })
    } catch (err) {
        if (err instanceof NotFoundError) {
            return({})
        } else {
            return({})
        }
    }

    const embeds = output.embeds

    if (embeds) {
        const scrapePromises = embeds.map(embed => 
            providers.runEmbedScraper({
                id: embed.embedId,
                url: embed.url,
            }).then(result => ({ [embed.embedId]: result }))
        );
    
        try {
            const results = await Promise.all(scrapePromises);
            const combinedResults = Object.assign({}, ...results);
            return(combinedResults)
        } catch (error) {
            return({})
        }
    } else {
        console.log({});
    }
}

