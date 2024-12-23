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
    const body = JSON.parse(event.body);
    console.log("Received request body:", body);

    const data = body.json_column ? JSON.parse(body.json_column) : body;
    console.log("Final data:", data);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        values: [
          Number(data.no_boost),
          Number(data.no_makedown),
          Number(data.makedown),
        ].map((value) => Number(value.toFixed(1))),
        mode: data.mode || "light",
      }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
