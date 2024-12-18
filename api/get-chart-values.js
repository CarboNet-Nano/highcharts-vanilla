const { performance } = require("perf_hooks");
const pusher = require("./pusher");

// Store latest values globally
let latestValues = null;
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

    let values;
    let source = body.type || "update";
    const timestamp = new Date().toISOString();
    let shouldPushUpdate = false;

    // If this is a data update, process and store new values
    if (body.no_boost && body.no_makedown && body.makedown) {
      values = [
        Number(body.no_boost),
        Number(body.no_makedown),
        Number(body.makedown),
      ].map((value) => {
        if (isNaN(value)) {
          throw new Error(`Invalid number: ${value}`);
        }
        return Number(value.toFixed(1));
      });

      // Store latest values and trigger update
      latestValues = values;
      lastUpdateTime = timestamp;
      shouldPushUpdate = true;
    }
    // If this is a sync check or initial load, return latest known values
    else {
      values = latestValues || [35.1, 46.3, 78.7];
    }

    console.log("Processing values:", { values, source, timestamp });

    // Only send Pusher update for real value changes
    if (shouldPushUpdate) {
      let retries = 3;
      let lastError;

      while (retries > 0) {
        try {
          await pusher.trigger("chart-updates", "value-update", {
            type: "update",
            source,
            values,
            timestamp,
            lastUpdateTime,
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
        console.error(
          "Failed to send Pusher message after retries:",
          lastError
        );
        throw lastError;
      }
    }

    const endTime = performance.now();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        source,
        values,
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
