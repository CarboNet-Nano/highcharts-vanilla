const { performance } = require("perf_hooks");

// Data store for chart data
const chartDataStore = {};

// Input validation
function validateValues(values) {
  if (!Array.isArray(values)) {
    throw new Error("Values must be an array");
  }
  return values.map((value) => {
    const num = Number(value);
    if (isNaN(num)) {
      throw new Error(`Invalid number: ${value}`);
    }
    return num;
  });
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
    const body = JSON.parse(event.body);
    console.log("Parsed body:", body);

    if (!body.chartId) {
      throw new Error("Chart ID is required");
    }

    if (!body.values) {
      throw new Error("Values are required");
    }

    const validatedValues = validateValues(body.values);
    console.log("Validated values:", validatedValues);

    // Store in data store
    chartDataStore[body.chartId] = {
      values: validatedValues,
      lastUpdated: new Date().toISOString(),
    };

    const endTime = performance.now();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        chartId: body.chartId,
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
