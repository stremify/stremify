import { sendRequestViaWebSocket } from "~/routes/websocket";
interface FetchOptions extends RequestInit {
  peerId?: string;
}

export function makeWSFetcher(id: string) {
  return async (url: string, options: FetchOptions = {}) => {
    if (id) {
      options.peerId = id;
      try {
        const response = await sendRequestViaWebSocket(id, { type: 'request', url, options });
        return response;
      } catch (error) {
        return globalThis.fetch(url, options);
      }
    }
    return globalThis.fetch(url, options);
  };
}