const peers = new Map();
const responseHandlers = new Map();

export default defineWebSocketHandler({
  message(peer, messageContent) {
    const message = JSON.parse(messageContent.text());

    switch (message.type) {
      case 'register':
        handleRegister(peer, message);
        break;
      case 'request':
        handleRequest(peer, message);
        break;
      case 'response':
        handleResponse(peer, message);
        break;
    }
  },

  close(peer, event) {
    const peerId = getPeerId(peer);
    peers.delete(peerId);
    for (const [requestId, handler] of responseHandlers.entries()) {
      if (handler.peerId === peerId) {
        handler.reject();
        responseHandlers.delete(requestId);
      }
    }
  },

  error(peer, error) {
    const peerId = getPeerId(peer);
    peers.delete(peerId);
    for (const [requestId, handler] of responseHandlers.entries()) {
      if (handler.peerId === peerId) {
        handler.reject();
        responseHandlers.delete(requestId);
      }
    }
  }
});

function handleRegister(peer, msg) {
  const peerId = msg.peerId;
  if (peers.has(peerId)) {
    peer.send(JSON.stringify({ type: 'error', message: 'ID already connected' }));
    peer.close()
  } else {
    peers.set(peerId, peer);
    peer.send(JSON.stringify({ type: 'registered', peerId }));
  }
}

function handleRequest(peer, msg) {
  fetch(msg.url, msg.options)
    .then(response => response.text().then(body => {
      const headers = {};
      response.headers.forEach((value, name) => {
        headers[name] = value;
      });

      const responseMessage = {
        type: 'response',
        id: msg.id,
        body: encodeURIComponent(body),
        status: response.status,
        statusText: response.statusText,
        headers: headers
      };

      peer.send(JSON.stringify(responseMessage));
    }))
    .catch(error => {
      peer.send(JSON.stringify({ type: 'response', id: msg.id, error: error.message }));
    });
}

function handleResponse(peer, msg) {
  const handler = responseHandlers.get(msg.id);
  if (handler) {
    responseHandlers.delete(msg.id);
    if (msg.error) {
      handler.reject();
    } else {
      const headers = new Headers(msg.headers);
      const responseInit = {
        status: msg.status,
        statusText: msg.statusText,
        headers: headers
      };
      const blob = new Blob([atob(msg.body)], { type: 'application/octet-stream' });
      handler.resolve(new Response(blob, responseInit));
    }
  }
}

export function sendRequestViaWebSocket(peerId, request) {
  return new Promise((resolve, reject) => {
    const peer = peers.get(peerId);
    if (!peer) {
      return reject(new Error());
    }

    const requestId = Math.random().toString(36).substr(2, 9);

    responseHandlers.set(requestId, { resolve, reject, peerId });

    const requestMessage = {
      type: 'request',
      id: requestId,
      ...request
    };
    peer.send(JSON.stringify(requestMessage));
  });
}

function getPeerId(peer) {
  return peer.id;
}