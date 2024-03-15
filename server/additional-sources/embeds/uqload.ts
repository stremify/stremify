// uqload only works with a server connected to as it requires additonal headers

export async function uqloadResolve(link: URL) {
    try {
        const response = await fetch(link, { redirect: 'follow' });
        if (response.ok) {
            const embed = await response.text()
            const regex = /\b(https?:\/\/(?:www\.)?[^ \n]+\/)([^ \n]+\.mp4)\b/g;
            const matches = embed.match(regex);
            return matches ? matches[0] : null;
        }
    } catch (error) {
        return null;
    }
    return null; 
}

