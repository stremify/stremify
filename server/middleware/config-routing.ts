// this file basically routes all config based requests, so any paths that have config data in them

import { defineEventHandler, sendRedirect } from 'h3';
import { scrapeCustomProviders } from '../additional-sources/languages/custom-wrapper';
import { getMovieMediaDetails, getShowMediaDetails } from '../functions/tmdb';
import { buildManifest, handleSearch, handleMeta } from '../additional-sources/languages/custom-wrapper';

export const manifest = {
	"id": "com.stremify",
	"version": "2.7.0",
	"catalogs": [],
	"resources": [
		"stream"
	],
	"types": [
		"movie",
		"series"
	],
	"name": "Stremify",
	"description": "A multi-server streaming addon.",
	"idPrefixes": [
		"tmdb:", "tt"
	],
	"logo": "https://i.ibb.co/GWB1pwy/160156210.png",
	"behaviorHints":{
		"configurable":true,
		"configurationRequired":false
	}
}

manifest.idPrefixes.push('kitsu:')

export default defineEventHandler(async (event) => {
  const url = new URL(event.req.url, `http://${event.req.headers.host}`);

  if (url.toString().includes("config")) {
    return sendRedirect(event, '/');
  }
  const manifestMatch = url.pathname.match(/^\/([^\/]+)\/manifest\.json$/);
  if (manifestMatch) {
    event.res.setHeader('access-control-allow-origin', '*')
    
    

    return await buildManifest(JSON.stringify(manifest), atob(manifestMatch[1]));
  }

  const catalogMatch = url.pathname.match(/^\/([^\/]+)\/catalog\/([^/]*)\/([^/]*)\/search=([^.]*).json/)
  if (catalogMatch) {
    event.res.setHeader('access-control-allow-origin', '*')
    const searchData = await handleSearch(decodeURIComponent(catalogMatch[4]), catalogMatch[3], catalogMatch[2])
    event.res.end(JSON.stringify(searchData))
  }

  const metaMatch = url.pathname.match(/^\/([^\/]+)\/meta\/([^/]*)\/([^/]*).json/)
  if (metaMatch) {
    event.res.setHeader('access-control-allow-origin', '*')
    const metaData = await handleMeta(decodeURIComponent(metaMatch[3]), metaMatch[2])
    event.res.end(JSON.stringify(metaData))
  }

  const streamMatch = url.pathname.match(/^\/([^\/]+)\/stream\/([^\/]+)\/([^\/]+)\.json$/);
  if (streamMatch) {
    event.res.setHeader('access-control-allow-origin', '*')

    const [, config, type, idPath] = streamMatch;
    const decodedConfig = Buffer.from(config, 'base64').toString('utf-8');
    if (type == "movie") {
        if (idPath.includes('tmdb')) {
          const media = await getMovieMediaDetails(idPath.split(':')[1])
          const mediaData = await scrapeCustomProviders(decodedConfig, media.imdbId, 0, 0, media)
          event.res.end(JSON.stringify(mediaData))
        } else {
          const id = idPath
          const mediaData = await scrapeCustomProviders(decodedConfig, decodeURIComponent(id), 0, 0)
          event.res.end(JSON.stringify(mediaData))
        }
    } else if (type == "series") {
        const decodedId = decodeURIComponent(idPath)
        const id = decodedId.split('.')[0];
        let mediaInfo = {imdbid: '', season:'', episode:''}

        if (id.includes('tmdb')) {
          const media = await getShowMediaDetails(id.split(':')[1], id.split(':')[2], id.split(':')[3])
          mediaInfo = {
            imdbid: media.imdbId,
            season: id.split(':')[2],
            episode: id.split(':')[3]
          }
          const mediaData = await scrapeCustomProviders(decodedConfig, mediaInfo.imdbid, mediaInfo.season, mediaInfo.episode, media)
          event.res.end(JSON.stringify(mediaData))
        } else if (id.includes('kitsu')) {
          const mediaData = await scrapeCustomProviders(decodedConfig, `kitsu:${id.split(':')[1]}`, null, id.split(':')[2])
          event.res.end(JSON.stringify(mediaData))
        } else if (id.startsWith('tt')) {
          mediaInfo = {
            imdbid: id.split(':')[0],
            season: id.split(':')[1],
            episode: id.split(':')[2]
          }
          const mediaData = await scrapeCustomProviders(decodedConfig, mediaInfo.imdbid, mediaInfo.season, mediaInfo.episode)
          event.res.end(JSON.stringify(mediaData))
        } else {
          const mediaData = await scrapeCustomProviders(decodedConfig, decodeURIComponent(id), null, null)
          event.res.end(JSON.stringify(mediaData))
        }
    }
    return;
  }
});
