exports.handler = async (event, context) => {
  try {
    const body = JSON.parse(event.body);

    // Detailed request logging
    console.log("=== Request Details ===");
    console.log("Timestamp:", new Date().toISOString());
    console.log("Source:", body.source || "unspecified");
    console.log("Request Type:", body.type || "unspecified");
    console.log("Glide Source:", body.glide_source || "not from glide");
    console.log("Full Request:", body);
    console.log("===================");

    const { no_boost, no_makedown, makedown, mode, glide_source } = JSON.parse(
      body.json_column
    );

    const values = [
      Number(no_boost),
      Number(no_makedown),
      Number(makedown),
    ].map((value) => Number(value.toFixed(1)));

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        success: true,
        source: body.source || body.type || "update",
        values,
        mode,
        request_source: glide_source || body.source || "unknown",
      }),
    };
  } catch (error) {
    console.error("=== Error Processing Request ===");
    console.error("Error:", error.message);
    console.error("Raw request body:", event.body);
    console.error("===================");
    return {
      statusCode: 400,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        success: false,
        message: error.message,
        receivedBody: event.body,
      }),
    };
  }
};
