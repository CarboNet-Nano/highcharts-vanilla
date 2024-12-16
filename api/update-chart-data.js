const { performance } = require("perf_hooks");
const websocket = require("./websocket");

// Data store for chart data
const chartDataStore = {};

// Input validation
function validateValues(input) {
  // If it's already an array, validate it
  if (Array.isArray(input)) {
    return input.map((value) => {
      const num = Number(value);
      if (isNaN(num)) {
        throw new Error(`Invalid number: ${value}`);
      }
      return num;
    });
  }

  // If it's an object, extract values
  if (typeof input === "object" && input !== null) {
    // Extract everything except chartId
    const values = Object.entries(input)
      .filter(([key]) => key !== "chartId")
      .map(([_, value]) => {
        const num = Number(value);
        if (isNaN(num)) {
          throw new Error(`Invalid number: ${value}`);
        }
        return num;
      });
    return values;
  }

  throw new Error("Values must be an array or object");
}

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
      body: JSON.stringify({
        success: false,
        message: "Method not allowed",
      }),
    };
  }

  console.log("Request received:", {
    method: event.httpMethod,
    headers: event.headers,
    body: event.body,
  });

  try {
    let body = JSON.parse(event.body);
    console.log("Parsed body:", body);

    // Extract chartId - either from body directly or from values object
    const chartId = body.chartId || (body.values && body.values.chartId);
    if (!chartId) {
      throw new Error("Chart ID is required");
    }

    // Get values - either from values array or from the body object itself
    const rawValues = body.values || body;
    const validatedValues = validateValues(rawValues);
    console.log("Validated values:", validatedValues);

    if (validatedValues.length === 0) {
      throw new Error("No valid values provided");
    }

    // Store in data store
    chartDataStore[chartId] = {
      values: validatedValues,
      lastUpdated: new Date().toISOString(),
    };

    // Broadcast update through WebSocket
    websocket.broadcast({
      chartId: chartId,
      values: validatedValues,
      timestamp: new Date().toISOString(),
    });

    const endTime = performance.now();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        chartId: chartId,
        values: validatedValues,
        timestamp: new Date().toISOString(),
        processingTime: endTime - startTime,
      }),
    };
  } catch (error) {
    console.error("Processing error:", error);
    console.log("Raw body received:", event.body);

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
