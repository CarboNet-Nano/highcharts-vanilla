const { WebSocketServer } = require("ws");

let wss;
const connections = new Map();

exports.handler = async (event, context) => {
  // Log incoming request
  console.log("WebSocket handler called:", event.requestContext);

  const headers = {
    "Sec-WebSocket-Protocol": event.headers["sec-websocket-protocol"] || "",
    Connection: "upgrade",
    Upgrade: "websocket",
  };

  // Handle WebSocket lifecycle events
  switch (event.requestContext?.routeKey) {
    case "$connect":
      console.log("Client connecting...");
      // Initialize WSS if not already done
      if (!wss) {
        wss = new WebSocketServer({
          noServer: true,
          clientTracking: true,
        });

        wss.on("connection", (ws) => {
          const id = Math.random().toString(36).substring(7);
          connections.set(id, ws);
          console.log("Client connected:", id);

          ws.on("message", (message) => {
            console.log("Received:", message.toString());
          });

          ws.on("close", () => {
            console.log("Client disconnected:", id);
            connections.delete(id);
          });

          // Send connection confirmation
          ws.send(
            JSON.stringify({
              type: "connected",
              id,
              timestamp: new Date().toISOString(),
            })
          );
        });
      }
      return {
        statusCode: 200,
        body: "Connected",
        headers,
      };

    case "$disconnect":
      console.log("Client disconnected");
      return { statusCode: 200, body: "Disconnected" };

    default:
      if (event.body) {
        console.log("Message received:", event.body);
        // Broadcast to all connections
        broadcast(JSON.parse(event.body));
      }
      return { statusCode: 200, body: "Message received" };
  }
};

function broadcast(data) {
  if (!wss) return;

  const message = JSON.stringify(data);
  connections.forEach((ws, id) => {
    try {
      if (ws.readyState === 1) {
        // WebSocket.OPEN
        ws.send(message);
      } else {
        connections.delete(id);
      }
    } catch (error) {
      console.error(`Error sending to ${id}:`, error);
      connections.delete(id);
    }
  });
}

exports.broadcast = broadcast;
