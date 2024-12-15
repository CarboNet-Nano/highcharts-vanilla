const { performance } = require("perf_hooks");

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

    let values = Array.isArray(body.values)
      ? body.values
      : body.value !== undefined
      ? [body.value]
      : Array.isArray(body)
      ? body
      : null;

    if (!values) {
      throw new Error("No valid values provided");
    }

    console.log("Processing values:", values);

    const validatedValues = values.map((value) => {
      const num = Number(value);
      if (isNaN(num)) {
        throw new Error(`Invalid number: ${value}`);
      }
      return num;
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
