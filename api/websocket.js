const WebSocket = require("ws");

// Store connections in memory
const connections = new Map();

// Handler for WebSocket connections
exports.handler = async (event, context) => {
  const { routeKey } = event.requestContext || {};

  console.log(`WebSocket ${routeKey} event received`);

  switch (routeKey) {
    case "$connect":
      return {
        statusCode: 200,
        body: "Connected",
      };

    case "$disconnect":
      connections.delete(event.requestContext.connectionId);
      return {
        statusCode: 200,
        body: "Disconnected",
      };

    case "$default":
    default:
      try {
        // Handle incoming messages
        const message = event.body ? JSON.parse(event.body) : {};
        console.log("Message received:", message);

        return {
          statusCode: 200,
          body: JSON.stringify({
            message: "Message received",
            data: message,
          }),
        };
      } catch (error) {
        console.error("Error processing message:", error);
        return {
          statusCode: 500,
          body: JSON.stringify({ error: "Failed to process message" }),
        };
      }
  }
};

// Function to send message to a connection
async function sendMessage(connectionId, message) {
  try {
    const connection = connections.get(connectionId);
    if (connection) {
      await connection.send(JSON.stringify(message));
    }
  } catch (error) {
    console.error(`Failed to send message to ${connectionId}:`, error);
  }
}

// Function to broadcast to all connections
exports.broadcast = async (message) => {
  const payload = JSON.stringify(message);
  const staleConnections = [];

  for (const [connectionId, connection] of connections) {
    try {
      if (connection.readyState === WebSocket.OPEN) {
        await connection.send(payload);
      } else {
        staleConnections.push(connectionId);
      }
    } catch (error) {
      console.error(`Failed to broadcast to ${connectionId}:`, error);
      staleConnections.push(connectionId);
    }
  }

  // Clean up stale connections
  staleConnections.forEach((id) => connections.delete(id));
};

// Export for other functions to use
module.exports.connections = connections;
