const WebSocket = require('ws');

function initSocket(server) {
  const wss = new WebSocket.Server({ server });

  wss.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.warn(
        `WebSocket server is disabled because the HTTP port is already in use: ${error.message}`,
      );
      return;
    }

    console.error('WebSocket server error:', error.message);
  });

  wss.on('connection', (ws) => {
    console.log('✅ Client connected via WebSocket');
    ws.send('Welcome to WebSocket server!');

    ws.on('message', (message) => {
      console.log(`📩 Message from client: ${message}`);
      ws.send(`Echo: ${message}`); // contoh balikan
    });

    ws.on('close', () => {
      console.log('❌ Client disconnected');
    });
  });

  return wss;
}

module.exports = initSocket;
