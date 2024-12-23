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
    const rawBody = event.body;
    console.log("Raw body:", rawBody);
    const body = JSON.parse(event.body);
    console.log("Parsed body:", body);

    const data = body.json_column ? JSON.parse(body.json_column) : body;
    console.log("Final data:", data);

    const values = [
      Number(data.no_boost),
      Number(data.no_makedown),
      Number(data.makedown),
    ].map((value) => Number(value.toFixed(1)));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        chartId: data.chartId,
        values,
        mode: data.mode || "light",
      }),
    };
  } catch (error) {
    console.error("Error processing request:", error);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
