const { performance } = require("perf_hooks");
const pusher = require("./pusher");

let latestValues = [35.1, 46.3, 78.7];
let lastCallTime = 0;
const DEBOUNCE_WAIT = 100; // ms

exports.handler = async (event, context) => {
  const startTime = performance.now();
  const currentTime = Date.now();

  // If this call came too soon after the last one, skip it
  if (currentTime - lastCallTime < DEBOUNCE_WAIT) {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        success: true,
        message: "Debounced",
      }),
    };
  }
  lastCallTime = currentTime;

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
    const timestamp = new Date().toISOString();
    const mode = body.mode || "light";

    if (body.no_boost && body.no_makedown && body.makedown) {
      const values = [
        Number(body.no_boost),
        Number(body.no_makedown),
        Number(body.makedown),
      ].map((value) => {
        if (isNaN(value)) throw new Error(`Invalid number: ${value}`);
        return Number(value.toFixed(1));
      });
      latestValues = values;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        source: body.type || "update",
        values: latestValues,
        mode,
        timestamp,
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
