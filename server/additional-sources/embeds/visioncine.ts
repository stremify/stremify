export async function visioncineResolve(link: URL) {
    const playerFetch = await fetch(link)

    if (playerFetch.ok != true) {
        return null;
    }

    const player = await playerFetch.text()

    const mediaRegex = /initializePlayer\('([^']*)/

    return(mediaRegex.exec(player)[1])
}