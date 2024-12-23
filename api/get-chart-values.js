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
    const values = [
      Number(body.no_boost),
      Number(body.no_makedown),
      Number(body.makedown)
    ].map(value => Number(value.toFixed(1)));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        values,
        mode: body.mode || 'light'
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