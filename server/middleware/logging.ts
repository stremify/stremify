import { eventHandler } from 'h3';
import { ServerResponse } from 'http';
import { IncomingMessage } from 'http';

export default eventHandler((event) => {
  const { req, res } = event;
  const startTime = Date.now();
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  const originalEnd: ServerResponse['end'] = res.end.bind(res);

  res.end = ((chunk?: any, encoding?: any, cb?: () => void): ServerResponse<IncomingMessage> => {
    if (typeof chunk === 'function') {
      cb = chunk;
      chunk = undefined;
    } else if (typeof encoding === 'function') {
      cb = encoding;
      encoding = undefined;
    }

    const durationInSeconds = (Date.now() - startTime) / 1000;
    console.log(`[${res.statusCode}] ${req.method} ${req.url} - ${ip} - ${durationInSeconds.toFixed(3)}s`);

    if (cb) {
      return originalEnd(chunk, encoding, cb);
    } else if (encoding) {
      return originalEnd(chunk, encoding);
    } else {
      return originalEnd(chunk);
    }
  }) as ServerResponse['end'];
});
