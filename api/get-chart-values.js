// get-chart-values.js
exports.handler = async (event, context) => {
  console.log("Handler called with event:", {
    method: event.httpMethod,
    headers: event.headers,
    body: event.body,
  });

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    console.log("Handling OPTIONS request");
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const rawBody = event.body;
    console.log("Raw request body:", rawBody);

    const body = JSON.parse(event.body);
    console.log("Parsed request body:", body);

    const data = body.json_column ? JSON.parse(body.json_column) : body;
    console.log("Final data object:", data);

    const values = [
      Number(data.no_boost),
      Number(data.no_makedown),
      Number(data.makedown),
    ].map((value) => {
      const processed = Number(value.toFixed(1));
      console.log(`Processed value: ${value} -> ${processed}`);
      return processed;
    });

    console.log("Final values array:", values);

    const response = {
      values,
      mode: data.mode || "light",
    };
    console.log("Sending response:", response);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error("Error processing request:", error);
    console.error("Stack trace:", error.stack);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        error: error.message,
        stack: error.stack,
        receivedBody: event.body,
      }),
    };
  }
};
