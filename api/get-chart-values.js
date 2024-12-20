const { performance } = require("perf_hooks");
const pusher = require("./pusher");

let latestValues = [35.1, 46.3, 78.7]; // Default values
let lastUpdateTime = null;

exports.handler = async (event, context) => {
  const startTime = performance.now();

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, message: "Method not allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body);
    console.log("Received request:", body);

    let source = body.type || "update";
    const timestamp = new Date().toISOString();

    const mode = body.mode || "light";

    if (body.type === "initial-load") {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          source,
          values: latestValues,
          mode,
          timestamp,
          lastUpdateTime,
        }),
      };
    }

    if (body.no_boost && body.no_makedown && body.makedown) {
      latestValues = [
        Number(body.no_boost),
        Number(body.no_makedown),
        Number(body.makedown),
      ].map((value) => {
        if (isNaN(value)) {
          throw new Error(`Invalid number: ${value}`);
        }
        return Number(value.toFixed(1));
      });
      lastUpdateTime = timestamp;
    }

    const endTime = performance.now();
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        source,
        values: latestValues,
        mode,
        timestamp,
        lastUpdateTime,
        processingTime: endTime - startTime,
      }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        success: false,
        message: error.message,
        receivedBody: event.body,
      }),
    };
  }
};
