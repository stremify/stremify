// this file basically routes all config based requests

import { defineEventHandler, sendRedirect } from 'h3';
import { scrapeCustomProviders } from '../additional-sources/languages/id-based-scraper';
import { getMovieMediaDetails, getShowMediaDetails } from '../functions/tmdb';

export default defineEventHandler(async (event) => {
  const url = new URL(event.req.url, `http://${event.req.headers.host}`);
  console.log(url.href)
  if (url.toString().includes("config")) {
    return sendRedirect(event, '/');
  }
  const manifestMatch = url.pathname.match(/^\/([^\/]+)\/manifest\.json$/);
  if (manifestMatch) {
    return sendRedirect(event, '/manifest.json');
  }

  const streamMatch = url.pathname.match(/^\/([^\/]+)\/stream\/([^\/]+)\/([^\/]+)\.json$/);
  if (streamMatch) {
    const [, config, type, idPath] = streamMatch;
    const decodedConfig = Buffer.from(config, 'base64').toString('utf-8');
    if (type == "movie") {
        if (idPath.includes('tmdb')) {
          const media = await getMovieMediaDetails(idPath.split(':')[1])
          const mediaData = await scrapeCustomProviders(decodedConfig, media.imdbId, 0, 0, media)
          event.res.end(JSON.stringify(mediaData))
        } else {
          const id = idPath
          const mediaData = await scrapeCustomProviders(decodedConfig, id, 0, 0)
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
        } else {
          mediaInfo = {
            imdbid: id.split(':')[0],
            season: id.split(':')[1],
            episode: id.split(':')[2]
          }
          const mediaData = await scrapeCustomProviders(decodedConfig, mediaInfo.imdbid, mediaInfo.season, mediaInfo.episode)
          event.res.end(JSON.stringify(mediaData))
        }
    }
    return;
  }
});