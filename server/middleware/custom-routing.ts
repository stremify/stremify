// this file basically routes all config based requests

import { defineEventHandler, sendRedirect } from 'h3';
import { scrapeCustomProviders } from '../additional-sources/languages/id-based-scraper';

export default defineEventHandler(async (event) => {
  const url = new URL(event.req.url, `http://${event.req.headers.host}`);

  const manifestMatch = url.pathname.match(/^\/([^\/]+)\/manifest\.json$/);
  if (manifestMatch) {
    return sendRedirect(event, '/manifest.json');
  }

  const streamMatch = url.pathname.match(/^\/([^\/]+)\/stream\/([^\/]+)\/([^\/]+)\.json$/);
  if (streamMatch) {
    const [, config, type, id] = streamMatch;
    const decodedConfig = Buffer.from(config, 'base64').toString('utf-8');
    if (type == "movie") {
        const mediaData = await scrapeCustomProviders(decodedConfig, id, 0, 0)
        event.res.end(JSON.stringify(mediaData))
    } else if (type == "series") {
        const decodedId = decodeURIComponent(id)
        const imdb = decodedId.split('.')[0];
        const mediaInfo = {
            imdbid: imdb.split(':')[0],
            season: imdb.split(':')[1],
            episode: imdb.split(':')[2],
        }
        const mediaData = await scrapeCustomProviders(decodedConfig, mediaInfo.imdbid, mediaInfo.season, mediaInfo.episode)
        event.res.end(JSON.stringify(mediaData))
    }
    return;
  }
});