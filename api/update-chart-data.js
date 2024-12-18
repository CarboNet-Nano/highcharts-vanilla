const { performance } = require("perf_hooks");
const pusher = require("./pusher");

// Store latest values globally
let lastValues = null;
let lastUpdateTime = null;

exports.handler = async (event, context) => {
  const startTime = performance.now();

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
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
    console.log("Received update request:", body);

    const values = [
      Number(body.no_boost),
      Number(body.no_makedown),
      Number(body.makedown),
    ];

    const validatedValues = values.map((value) => {
      if (isNaN(value)) {
        throw new Error(`Invalid number: ${value}`);
      }
      return Number(value.toFixed(1));
    });

    // Store latest values
    lastValues = validatedValues;
    lastUpdateTime = new Date().toISOString();

    console.log("Sending to Pusher from update-chart-data:", validatedValues);

    // Try Pusher trigger with retries
    let retries = 3;
    let lastError;

    while (retries > 0) {
      try {
        await pusher.trigger("chart-updates", "value-update", {
          type: "update",
          source: "update-workflow",
          values: validatedValues,
          timestamp: lastUpdateTime,
          rawBody: body,
        });
        break;
      } catch (error) {
        lastError = error;
        retries--;
        if (retries > 0) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }

    if (retries === 0) {
      console.error("Failed to send Pusher message after retries:", lastError);
      throw lastError;
    }

    const endTime = performance.now();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        source: "update-workflow",
        values: validatedValues,
        timestamp: lastUpdateTime,
        processingTime: endTime - startTime,
        rawBody: body,
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
