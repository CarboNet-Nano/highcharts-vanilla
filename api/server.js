const express = require("express");
const { createServer } = require("http");
const { WebSocketServer } = require("ws");
const path = require("path");

const app = express();
app.use(express.static(path.join(__dirname, "public")));

const server = createServer(app);

// Initialize WebSocket Server with explicit port
const wss = new WebSocketServer({
  server,
  path: "/api/ws",
});

// WebSocket connection handling
wss.on("connection", function connection(ws) {
  console.log("New client connected");

  ws.on("message", function incoming(message) {
    console.log("received: %s", message);
  });

  ws.on("error", function error(err) {
    console.error("WebSocket error:", err);
  });

  ws.on("close", function close() {
    console.log("Client disconnected");
  });

  // Send initial connection confirmation
  ws.send(
    JSON.stringify({
      type: "connection",
      status: "connected",
      timestamp: new Date().toISOString(),
    })
  );
});

const PORT = process.env.PORT || 8888;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = { app, server, wss };
