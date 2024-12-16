exports.handler = async (event, context) => {
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

    // Extract and validate the values
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

    console.log("Processed values:", values); // Debug log

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        values,
        timestamp: new Date().toISOString(),
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
