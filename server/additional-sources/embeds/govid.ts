export async function govvidResolve(url: URL) {
    const streams = [];

    const govidPage = await fetch(url, {
        headers: {
            "Referer": "https://wecima.show"
        }
    });
    const govidData = await govidPage.text();

    const urlRegex = /\b((https?:\/\/(?:www\.)?[^ \n]+\/)([^ \n]+\.mp4))\b/g

    let match;
    while ((match = urlRegex.exec(govidData)) != null) {
        console.log(match[1])
        streams.push(match[1])
    }

    return(streams)
}