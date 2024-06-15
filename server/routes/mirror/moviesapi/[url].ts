import https from 'https';
import fetch from 'node-fetch';
import { exec } from 'child_process';

export default eventHandler(async (event) => {
    const path = getRouterParam(event, 'url')
    let m3u8url = decodeURIComponent(path);
    if (new URL(m3u8url).origin.includes(`zcdn.stream`) != true) {
      setResponseStatus(event, 403)
      return('wqeq')
    }
    try {
      const curlCommand = `curl '${m3u8url}'`;
      const fetchWithCurl = async(): Promise<string> => {
        return new Promise((resolve, reject) => {
          console.log(`curl '${m3u8url}'`)
          exec(`curl '${m3u8url}' -s`, (error, stdout, stderr) => {
            if (error) {
              return;
            }
            if (stderr) {
              return;
            }
            resolve(stdout);
          });
        });
      };

      const m3u8Content = await fetchWithCurl()
      console.log(`dassa ${m3u8Content}`)
      
      const parsedUrl = new URL(m3u8url);
      const baseUrl = parsedUrl.origin;
      const baseDirectoryUrl = `${baseUrl}${parsedUrl.pathname.substring(0, parsedUrl.pathname.lastIndexOf('/') + 1)}`;
      
      const modifiedM3U8Content = m3u8Content.split('\n').map(line => {
        if (line && !line.startsWith('#') && !line.includes('://')) {
          return new URL(line, baseDirectoryUrl).href;
        }
        return line;
      }).join('\n');
      setHeader(event, 'Content-Type', 'application/vnd.apple.mpegurl');
      console.log(modifiedM3U8Content)
      return modifiedM3U8Content;
    } catch (error) {
      console.error('Failed to mirror M3U8 playlist:', error);
      setHeader(event, 'Content-Type', 'text/plain');
      return { statusCode: 500};
    }
  });