const { performance } = require("perf_hooks");
const pusher = require("./pusher");

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

    // Strict mode validation
    const mode = body.mode === "dark" ? "dark" : "light";

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

      latestValues = values;
      lastUpdateTime = timestamp;
      shouldPushUpdate = true;
    } else {
      values = latestValues || [35.1, 46.3, 78.7];
    }

    if (shouldPushUpdate) {
      let retries = 3;
      let lastError;

      while (retries > 0) {
        try {
          await pusher.trigger("chart-updates", "value-update", {
            type: "update",
            source,
            values,
            mode: mode,
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
        mode: mode,
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
