const WebSocket = require("ws");

// Keep track of all connections
const connections = new Set();

// Create WebSocket server
const wss = new WebSocket.Server({
  port: 3001,
  path: "/api/ws",
});

function heartbeat() {
  this.isAlive = true;
}

// Connection handling
wss.on("connection", (ws) => {
  console.log("Client connected");
  ws.isAlive = true;
  connections.add(ws);

  // Set up heartbeat
  ws.on("pong", heartbeat);

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
    try {
      const data = JSON.parse(message.toString());
      console.log("Received:", data);

      // Echo back the message
      ws.send(
        JSON.stringify({
          type: "echo",
          data: data,
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

// Heartbeat interval
const interval = setInterval(function ping() {
  for (const ws of connections) {
    if (ws.isAlive === false) {
      console.log("Connection terminated due to inactivity");
      connections.delete(ws);
      return ws.terminate();
    }

    ws.isAlive = false;
    ws.ping(() => {});
  }
}, 30000);

// Clean up on server close
wss.on("close", function close() {
  clearInterval(interval);
});

// Function to broadcast updates to all clients
function broadcast(data) {
  const message = JSON.stringify({
    type: "update",
    ...data,
    timestamp: new Date().toISOString(),
  });

  for (const client of connections) {
    if (client.readyState === WebSocket.OPEN) {
      try {
        client.send(message);
      } catch (error) {
        console.error("Error sending message:", error);
        connections.delete(client);
      }
    }
  }
}

module.exports = { wss, broadcast };

// If this file is run directly (not imported as a module)
if (require.main === module) {
  console.log("WebSocket server started on port 3001");
}
