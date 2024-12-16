const { WebSocketServer } = require("ws");

let wss;
const connections = new Map();

function initializeWebSocketServer(server) {
  wss = new WebSocketServer({
    server,
    path: "/api/ws",
  });

  wss.on("connection", (ws) => {
    console.log("Client connected");
    const id = Math.random().toString(36).substring(7);
    connections.set(id, ws);

    ws.on("message", (message) => {
      console.log("Received:", message.toString());
    });

    ws.on("close", () => {
      console.log("Client disconnected:", id);
      connections.delete(id);
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });

    // Send initial connection confirmation
    ws.send(JSON.stringify({ type: "connected", id }));
  });

  return wss;
}

module.exports = {
  initializeWebSocketServer,

  broadcast: (data) => {
    if (!wss) return;

    console.log("Broadcasting to", connections.size, "clients:", data);
    const message = JSON.stringify(data);

    connections.forEach((ws, id) => {
      if (ws.readyState === ws.OPEN) {
        ws.send(message);
      } else {
        connections.delete(id);
      }
    });
  },
};
