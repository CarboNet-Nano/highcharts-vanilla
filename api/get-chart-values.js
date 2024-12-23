const { performance } = require("perf_hooks");
const pusher = require("./pusher");

exports.handler = async (event, context) => {
  const startTime = performance.now();
  console.log("Handler called with event:", {
    method: event.httpMethod,
    headers: event.headers,
    body: event.body,
  });

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
  };

  if (event.httpMethod === "OPTIONS")
    return { statusCode: 200, headers, body: "" };

  try {
    const body = JSON.parse(event.body);
    const data = body.json_column ? JSON.parse(body.json_column) : body;
    console.log("Final data object:", data);

    const values = [
      Number(data.no_boost),
      Number(data.no_makedown),
      Number(data.makedown),
    ].map((value) => {
      if (isNaN(value)) throw new Error(`Invalid number: ${value}`);
      return Number(value.toFixed(1));
    });

    console.log("Sending to Pusher:", values);

    let retries = 3;
    let lastError;

    while (retries > 0) {
      try {
        await pusher.trigger("chart-updates", "value-update", {
          type: "initial",
          values,
          mode: data.mode || "light",
          timestamp: new Date().toISOString(),
        });
        break;
      } catch (error) {
        lastError = error;
        retries--;
        if (retries > 0)
          await new Promise((resolve) => setTimeout(resolve, 1000));
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
        mode: data.mode || "light",
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
