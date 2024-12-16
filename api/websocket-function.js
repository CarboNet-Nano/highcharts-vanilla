const { WebSocket, WebSocketServer } = require('ws');

const connections = new Map();

exports.handler = async (event, context) => {
  if (event.headers.upgrade !== 'websocket') {
    return {
      statusCode: 400,
      body: 'WebSocket connections only'
    };
  }

  const wss = new WebSocketServer({ noServer: true });
  
  wss.on('connection', (ws) => {
    const id = Math.random().toString(36).substring(7);
    connections.set(id, ws);

    ws.on('close', () => {
      connections.delete(id);
    });
  });

  return {
    statusCode: 200,
    body: 'Connected'
  };
};

// Function to broadcast updates to all connected clients
exports.broadcast = (data) => {
  connections.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  });
};