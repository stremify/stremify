// movie only

// todo: add doodstream + mixdrop to be scraped for meinecloud, this provider n guardahd too

import { superivdeodroploadResolve } from "../../embeds/supervideo-dropload";
import { streamtapeResolve } from "../../embeds/streamtape";

const baseurl = "https://verhdlink.cam"

export async function scrapeVerdahd(imdbid) {
    const finalstreams = []
    const url = `${baseurl}/movie/${imdbid}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            return (null)
        }

        const text = await response.text();
        const languageidentifier = /<ul class="_player-mirrors\s+[^"]+\s+top_class [\s\S]*?<\/ul>/g;

        const matches = [...text.matchAll(languageidentifier)];
        let match;
        for (const content of matches) {

            const stringedcontent = content.toString();
            const droploadregex = /dropload\.io\/([^"]+)/g;
            const supervideoregex = /supervideo\.cc\/([^"]+)/g;
            const streamtaperegex = /https:\/\/streamtape\.com\/([^"]+)/g;
            let lang = ""

            if (stringedcontent.includes("latino")) {
                lang = "Latino"
            } else if (stringedcontent.includes("subtitulado")) {
                lang = "Subtitled"
            } else if (stringedcontent.includes("castellano")) {
                lang = "Castellano"
            }

            while ((match = droploadregex.exec(stringedcontent)) !== null) {
                const embedurl = `https://${match[0]}`
                const url = await superivdeodroploadResolve(new URL(embedurl))
                finalstreams.push({
                    name: `Stremify ES`,
                    type: "url",
                    url: url,
                    title: `Verhdlink ${lang} - auto (dropload.io)`
                })
            }

            while ((match = streamtaperegex.exec(stringedcontent)) !== null) {
                const initialurl: string = await streamtapeResolve(match[0])

                finalstreams.push({
                    name: "Stremify ES",
                    type: "url",
                    url: initialurl,
                    title: `Verhdlink ${lang} - auto (streamtape.com)`
                })
            }

            while ((match = supervideoregex.exec(stringedcontent)) !== null) {
                const embedurl = `https://${match[0]}`
                const url = await superivdeodroploadResolve(new URL(embedurl))
                finalstreams.push({
                    name: "Stremify ES",
                    type: "url",
                    url: url,
                    title: `Verhdlink ${lang} - auto (supervideo.cc)`
                })
            }

        }
        return (finalstreams)

    } catch (error) {
        console.log(error)
        return (null)
    }

}