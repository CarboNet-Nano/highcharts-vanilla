const { performance } = require("perf_hooks");
const pusher = require("../pusher");

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

    // Extract values from the body
    const values = [
      Number(body.no_boost),
      Number(body.no_makedown),
      Number(body.makedown),
    ];

    // Validate values
    const validatedValues = values.map((value) => {
      if (isNaN(value)) {
        throw new Error(`Invalid number: ${value}`);
      }
      return Number(value.toFixed(1));
    });

    // Send update via Pusher
    await pusher.trigger("chart-updates", "value-update", {
      type: "update",
      values: validatedValues,
      timestamp: new Date().toISOString(),
    });

    const endTime = performance.now();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        values: validatedValues,
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
