const { performance } = require("perf_hooks");

exports.handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const { json_column } = JSON.parse(event.body);
    const parsed = JSON.parse(json_column);

    const values = [
      Number(parsed.no_boost),
      Number(parsed.no_makedown),
      Number(parsed.makedown),
    ].map((value) => Number(value.toFixed(1)));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        values,
        mode: parsed.mode || "light",
      }),
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
