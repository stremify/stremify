export async function voeResolve(link: URL): Promise<string> {
    try {
        const response = await fetch(link, { redirect: 'follow' });
        if (response.ok) {
            const embed = await response.text()
            const regex = /let nodeDetails = prompt\("Node", "(.*?)"\);/;
            const matches = embed.match(regex);
            return matches ? matches[1] : null;
        }
    } catch (error) {
        return null;
    }
    return null; 
}