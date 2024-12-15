const { performance } = require("perf_hooks");

exports.handler = async (event, context) => {
  const startTime = performance.now();

  // Add CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // Handle OPTIONS request for CORS
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  console.log("Request received:", {
    method: event.httpMethod,
    headers: event.headers,
    body: event.body,
  });

  // Validate HTTP method
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

  try {
    // Parse request body
    const body = JSON.parse(event.body);
    console.log("Parsed body:", body);

    // Handle both single value and array formats
    let values = Array.isArray(body.values)
      ? body.values
      : body.value !== undefined
      ? [body.value]
      : body;

    // Ensure values is an array
    if (!Array.isArray(values)) {
      values = Object.values(values);
    }

    console.log("Processed values:", values);

    // Validate values
    const validatedValues = values.map((value) => {
      const num = Number(value);
      if (isNaN(num)) {
        throw new Error(`Invalid number: ${value}`);
      }
      return num;
    });

    const endTime = performance.now();

    // Return success response
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
    console.error("Processing error:", error);

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
