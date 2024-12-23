const { performance } = require("perf_hooks");
const pusher = require("./pusher");
const fetch = require("node-fetch");

const fetchGlideData = async (rowId) => {
  const response = await fetch(
    "https://api.glideapp.io/api/function/queryTables",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer 722b598d-1746-4575-bfe8-2fa4fe92a2ed",
      },
      body: JSON.stringify({
        appID: "OF5lh0TbgZdeYgCrSdG6",
        queries: [
          {
            tableName: "native-table-ud73I28iqSzVl5Nt8qLo5",
            rowID: rowId,
            utc: true,
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Glide API error: ${response.status}`);
  }

  return response.json();
};

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
    console.log("Received request:", body);

    let values;
    let mode = "light";
    const source = body.glide_source || "direct";
    const timestamp = new Date().toISOString();

    // Handle json_column data first
    if (body.json_column) {
      try {
        const parsed = JSON.parse(body.json_column);
        values = [
          Number(parsed.no_boost),
          Number(parsed.no_makedown),
          Number(parsed.makedown),
        ].map((value) => Number(value.toFixed(1)));
        mode = parsed.mode || mode;
      } catch (error) {
        console.error("Error parsing json_column:", error);
      }
    }

    // If no json_column data, try direct values
    if (!values && body.no_boost && body.no_makedown && body.makedown) {
      values = [
        Number(body.no_boost),
        Number(body.no_makedown),
        Number(body.makedown),
      ].map((value) => {
        if (isNaN(value)) throw new Error(`Invalid number in update: ${value}`);
        return Number(value.toFixed(1));
      });
      mode = body.mode || mode;

      // Only trigger Pusher for updates, not initial loads
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
