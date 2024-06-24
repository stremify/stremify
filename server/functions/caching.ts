import 'dotenv/config'
import { CacheContainer } from 'node-ts-cache'
import { MemoryStorage } from 'node-ts-cache-storage-memory'


const cacheToggle = process.env.cache || 'true'
const cacheTime = parseInt(process.env.cache_time) || 10800

const cache = new CacheContainer(new MemoryStorage());

export async function getCache(provider: string, id: string | number, season?: string, episode?: string, ip?: number) {
    if (cacheToggle == "false") { return null; }

    return(await cache.getItem(`${provider}_${id}_${season}_${episode}_${ip}`))
}

export async function setCache(streams, provider: string, id: string | number, season?: string, episode?: string, ip?: number) {
    if (cacheToggle == "false") { return null; }

    await cache.setItem(`${provider}_${id}_${season}_${episode}_${ip}`, streams, {ttl: cacheTime})
}

