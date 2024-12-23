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
    console.log("Received request:", {
      ...body,
      type: body.type || "update",
      source: body.glide_source || "direct",
      timestamp: new Date().toISOString()
    });
    
    const mode = body.mode || "light";
    let values;
    let source = body.type || "update";
    const timestamp = new Date().toISOString();

    // Initial load with json_column handling
    if (body.type === "initial-load") {
      if (body.json_column) {
        try {
          const parsed = JSON.parse(body.json_column);
          values = [
            Number(parsed.no_boost),
            Number(parsed.no_makedown),
            Number(parsed.makedown),
          ].map(value => {
            if (isNaN(value)) throw new Error(`Invalid number in json_column: ${value}`);
            return Number(value.toFixed(1));
          });
        } catch (error) {
          console.error("Error parsing json_column:", error);
          throw new Error("Invalid json_column format");
        }
      } else {
        // Return default values for initial load without json_column
        values = [0, 0, 0];
      }
    }

    // Handle value updates
    if (body.no_boost && body.no_makedown && body.makedown) {
      values = [
        Number(body.no_boost),
        Number(body.no_makedown),
        Number(body.makedown),
      ].map(value => {
        if (isNaN(value)) throw new Error(`Invalid number in update: ${value}`);
        return Number(value.toFixed(1));
      });

      let retries = 3;
      let lastError;

      while (retries > 0) {
        try {
          await pusher.trigger("chart-updates", "value-update", {
            type: "update",
            source,
            values,
            mode,
            timestamp,
          });
          break;
        } catch (error) {
          lastError = error;
          retries--;
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }

      if (retries === 0) {
        console.error("Failed to send Pusher message after retries:", lastError);
        throw new Error("Failed to update chart after multiple retries");
      }
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
