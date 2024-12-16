const WebSocket = require("ws");

// Keep track of all connections
const connections = new Set();

// Create WebSocket server
const wss = new WebSocket.Server({
  port: 3001,
  path: "/api/ws",
});

// Connection handling
wss.on("connection", (ws) => {
  console.log("Client connected");
  connections.add(ws);

  // Send welcome message
  ws.send(
    JSON.stringify({
      type: "welcome",
      message: "Connected to WebSocket server",
      timestamp: new Date().toISOString(),
    })
  );

  // Handle incoming messages
  ws.on("message", (message) => {
    console.log("Received:", message.toString());
    try {
      // Echo back the message
      ws.send(
        JSON.stringify({
          type: "echo",
          data: JSON.parse(message.toString()),
          timestamp: new Date().toISOString(),
        })
      );
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });

  // Handle client disconnection
  ws.on("close", () => {
    console.log("Client disconnected");
    connections.delete(ws);
  });

  // Handle errors
  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
    connections.delete(ws);
  });
});

// Function to broadcast updates to all clients
function broadcast(data) {
  const message = JSON.stringify(data);
  for (const client of connections) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

module.exports = {
  wss,
  broadcast,
};

// If this file is run directly (not imported as a module)
if (require.main === module) {
  console.log("WebSocket server started on port 3001");
}
