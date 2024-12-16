const { performance } = require("perf_hooks");
const pusher = require("../pusher");

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
    console.log("Received initial data request:", body);

    // Check if we have the required data
    if (!body.no_boost || !body.no_makedown || !body.makedown) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          message: "Missing required values",
          receivedBody: event.body,
        }),
      };
    }

    const values = [
      Number(body.no_boost),
      Number(body.no_makedown),
      Number(body.makedown),
    ].map((value) => {
      if (isNaN(value)) {
        throw new Error(`Invalid number: ${value}`);
      }
      return Number(value.toFixed(1));
    });

    console.log("Processed values:", values);

    // Send to Pusher with retries
    let retries = 3;
    let lastError;

    while (retries > 0) {
      try {
        await pusher.trigger("chart-updates", "value-update", {
          type: "update",
          values,
          timestamp: new Date().toISOString(),
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
        values,
        timestamp: new Date().toISOString(),
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
