const { performance } = require("perf_hooks");
const pusher = require("./pusher");
const fetch = require("node-fetch");

let lastKnownRowId = null;

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
            tableName: "native-table-ud73I28iqShdMdbNB9Gj",
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
    console.log("Received request:", {
      ...body,
      type: body.type || "update",
      source: body.glide_source || "direct",
      timestamp: new Date().toISOString(),
    });

    let values;
    let source = body.type || "update";
    const timestamp = new Date().toISOString();

    // Store Row ID from json_column
    if (body.json_column) {
      try {
        const parsed = JSON.parse(body.json_column);
        if (parsed["Row ID"]) {
          lastKnownRowId = parsed["Row ID"];
        }
      } catch (error) {
        console.error("Error parsing json_column:", error);
      }
    }

    // Initial load - fetch from Glide API using Row ID
    if (body.type === "initial-load") {
      try {
        if (!lastKnownRowId) {
          throw new Error("No Row ID available");
        }
        const glideData = await fetchGlideData(lastKnownRowId);
        console.log("Glide API response:", JSON.stringify(glideData, null, 2));

        if (glideData.rows && glideData.rows.length > 0) {
          const row = glideData.rows[0];
          values = [
            Number(row.no_boost),
            Number(row.no_makedown),
            Number(row.makedown),
          ].map((value) => Number(value.toFixed(1)));
        }
      } catch (error) {
        console.error("Glide API fetch error:", error);
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
        mode: "dark",
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
        mode: "dark",
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
