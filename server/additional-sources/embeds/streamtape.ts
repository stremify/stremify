/**
 * This file includes code derived from AnimeWorld-API by MainKronos
 * MainKronos/AnimeWorld-AP is licensed under the MIT License.
 * 
 * You can find the original source and license at:
 * MainKronos/AnimeWorld-AP
 * 
 * MIT License
 * 
 * Copyright (c) 2021 Kronos
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

import cheerio from 'cheerio';

export async function streamtapeResolve(link: URL) {
    try {
        const response = await fetch(link, { redirect: 'follow' });
        if (response.ok) {
            const htmlContent = await response.text();
            const $ = cheerio.load(htmlContent);
            let scriptContent = '';
            $('script').each((index, element) => {
                const scriptText = $(element).html();
                if (scriptText && scriptText.includes("document.getElementById('ideoolink').innerHTML")) {
                    scriptContent = scriptText;
                }
            });
            if (scriptContent) {
                const rawLinkMatch = scriptContent.match(/document\.getElementById\('ideoolink'\)\.innerHTML = (.*);/);
                if (rawLinkMatch) {
                    let rawLink = rawLinkMatch[1].replace(/["'+]/g, '');

                    const rawLinkPart2Match = rawLink.match(/\((.*?)\)/);
                    let rawLinkPart2 = '';
                    if (rawLinkPart2Match) {
                        rawLinkPart2 = rawLinkPart2Match[1].substring(4);
                    }

                    let rawLinkPart1 = rawLink.replace(/\(.*?\)/, '');
                    let mp4Link = `http:/${rawLinkPart1 + rawLinkPart2}`.replace(' ', '');
                    return mp4Link.replace(`  .substring(1).substring(2)`, ``);
                }
            }
        }
    } catch (error) {
        console.error('Error fetching MP4 link:', error);
        return null;
    }
    return null; 
}
