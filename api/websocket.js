<function_calls>
<invoke name="artifacts">
<parameter name="id">websocket-debug</parameter>
<parameter name="type">application/vnd.ant.code</parameter>
<parameter name="command">create</parameter>
<parameter name="content">const { WebSocketServer } = require('ws');

let wss;
const connections = new Map();

exports.handler = async (event, context) => {
  // Log the incoming request
  console.log('WebSocket handler called:', {
    httpMethod: event.httpMethod,
    headers: event.headers
  });

  // Check for WebSocket upgrade
  if (event.requestContext.routeKey === '$connect') {
    console.log('WebSocket connection attempt');
    
    if (!wss) {
      wss = new WebSocketServer({ 
        clientTracking: true,
        noServer: true 
      });

      wss.on('connection', (ws) => {
        console.log('New client connected');
        const id = Math.random().toString(36).substring(7);
        connections.set(id, ws);

        ws.on('close', () => {
          console.log('Client disconnected:', id);
          connections.delete(id);
        });
      });
    }

    return {
      statusCode: 200,
      body: 'Connected'
    };
  }

  return {
    statusCode: 400,
    body: 'Invalid request'
  };
};

// Function to broadcast updates
exports.broadcast = (data) => {
  console.log('Broadcasting to', connections.size, 'clients:', data);
  connections.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  });
};</parameter>
<parameter name="language">javascript</parameter>
</invoke>​​​​​​​​​​​​​​​​