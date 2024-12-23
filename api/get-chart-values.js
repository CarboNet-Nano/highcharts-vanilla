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

    if (body.json_column) {
      const parsed = JSON.parse(body.json_column);
      console.log("Parsed json_column:", parsed);

      const values = [
        Number(parsed.no_boost),
        Number(parsed.no_makedown),
        Number(parsed.makedown),
      ].map(value => Number(value.toFixed(1)));

      console.log("Processed values:", values);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          values,
          mode: parsed.mode || "light",
        }),
      };
    }

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Missing json_column data" }),
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