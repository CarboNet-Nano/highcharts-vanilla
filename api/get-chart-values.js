const { performance } = require("perf_hooks");
const pusher = require("./pusher");
const glide = require("@glideapps/tables");

const calculationModelsTable = glide.table({
  token: "722b598d-1746-4575-bfe8-2fa4fe92a2ed",
  app: "OF5lh0TbgZdeYgCrSdG6",
  table: "native-table-ud73I28iqShdMdbNB9Gj",
  columns: {
    mode: { type: "string", name: "Cen5T" },
    rowOwnerUserEmail: { type: "email-address", name: "78J2c" },
    formCurrentUser1: { type: "email-address", name: "iAfZv" },
    enteredUnitsSoldKg: { type: "number", name: "E1KLz" },
  },
});

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
      timestamp: new Date().toISOString(),
    });

    const mode = body.mode || "light";
    let values;
    let source = body.type || "update";
    const timestamp = new Date().toISOString();

    // Initial load - fetch from Glide
    if (body.type === "initial-load") {
      try {
        const rows = await calculationModelsTable.get();
        console.log("Glide Data:", rows);
        const latestRow = rows[rows.length - 1];

        if (latestRow) {
          values = [35.1, 33.9, 74.4]; // Hardcoded for testing
        } else {
          throw new Error("No data available from Glide");
        }
      } catch (error) {
        console.error("Glide API error:", error);
        throw new Error("Failed to fetch data from Glide");
      }
    }

    // Handle value updates
    if (body.no_boost && body.no_makedown && body.makedown) {
      values = [
        Number(body.no_boost),
        Number(body.no_makedown),
        Number(body.makedown),
      ].map((value) => {
        if (isNaN(value)) throw new Error(`Invalid number in update: ${value}`);
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
      statusCode: error.message.includes("Glide") ? 503 : 400,
      headers,
      body: JSON.stringify({
        success: false,
        message: error.message,
        receivedBody: event.body,
      }),
    };
  }
};
