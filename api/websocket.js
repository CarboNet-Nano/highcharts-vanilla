const { WebSocket, WebSocketServer } = require('ws');

// Store active connections
const connections = new Map();

// WebSocket handler function
exports.handler = async (event, context) => {
  // Log the incoming request
  console.log('WebSocket handler called:', {
    requestContext: event.requestContext
  });

  const headers = {
    'Sec-WebSocket-Protocol': event.headers['sec-websocket-protocol'] || ''
  };

  // Handle WebSocket lifecycle events
  switch (event.requestContext.routeKey) {
    case '$connect':
      console.log('Client connecting...');
      return { 
        statusCode: 200, 
        body: 'Connected',
        headers 
      };

    case '$disconnect':
      console.log('Client disconnected');
      const connectionId = event.requestContext.connectionId;
      connections.delete(connectionId);
      return { statusCode: 200, body: 'Disconnected' };

    case '$default':
    default:
      console.log('Received message:', event.body);
      return { statusCode: 200, body: 'Message received' };
  }
};

// Function to broadcast updates to all connected clients
exports.broadcast = async (data) => {
  console.log('Broadcasting to', connections.size, 'clients:', data);
  
  const message = JSON.stringify(data);
  const deadConnections = [];

  // Send to all connected clients
  for (const [connectionId, connection] of connections) {
    try {
      if (connection.readyState === WebSocket.OPEN) {
        await connection.send(message);
      } else {
        deadConnections.push(connectionId);
      }
    } catch (err) {
      console.error('Broadcast error:', err);
      deadConnections.push(connectionId);
    }
  }

  // Clean up dead connections
  deadConnections.forEach(id => connections.delete(id));
};

// Add a new connection
exports.addConnection = (connectionId, ws) => {
  connections.set(connectionId, ws);
  console.log('Added new connection:', connectionId);
};

// Remove a connection
exports.removeConnection = (connectionId) => {
  connections.delete(connectionId);
  console.log('Removed connection:', connectionId);
};
