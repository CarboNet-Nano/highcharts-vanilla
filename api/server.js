const express = require("express");
const http = require("http");
const websocket = require("./websocket");

const app = express();
const server = http.createServer(app);

// Initialize WebSocket server
websocket.initializeWebSocketServer(server);

// Add express middleware if needed
app.use(express.json());

module.exports = { app, server };
