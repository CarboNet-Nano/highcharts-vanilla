const { performance } = require("perf_hooks");
const pusher = require("./pusher");

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
    const mode = body.mode || "light";
    let values;
    let source = body.type || "update";
    const timestamp = new Date().toISOString();

    // Initial load should use existing values from json_column
    if (body.type === "initial-load" && body.json_column) {
      const parsed = JSON.parse(body.json_column);
      values = [
        Number(parsed.no_boost),
        Number(parsed.no_makedown),
        Number(parsed.makedown),
      ].map((value) => {
        if (isNaN(value)) throw new Error(`Invalid number: ${value}`);
        return Number(value.toFixed(1));
      });
    }

    // Handle value updates
    if (body.no_boost && body.no_makedown && body.makedown) {
      values = [
        Number(body.no_boost),
        Number(body.no_makedown),
        Number(body.makedown),
      ].map((value) => {
        if (isNaN(value)) throw new Error(`Invalid number: ${value}`);
        return Number(value.toFixed(1));
      });

      await pusher.trigger("chart-updates", "value-update", {
        type: "update",
        source,
        values,
        mode,
        timestamp,
      });
    }

    const endTime = performance.now();
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        source,
        values,
        mode,
        timestamp,
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
