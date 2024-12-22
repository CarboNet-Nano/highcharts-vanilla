const { performance } = require("perf_hooks");

exports.handler = async (event, context) => {
  const startTime = performance.now();
  const timestamp = new Date().toISOString();

  try {
    const body = JSON.parse(event.body);

    // Detailed request logging
    console.log("=== Request Details ===");
    console.log("Timestamp:", timestamp);
    console.log("Source:", body.source || "unspecified");
    console.log("Request Type:", body.type || "unspecified");
    console.log("Mode:", body.mode || "unspecified");
    console.log("Glide Source:", body.glide_source || "not from glide");
    console.log("Full Request:", body);
    console.log("===================");

    if (body.no_boost && body.no_makedown && body.makedown) {
      const values = [
        Number(body.no_boost),
        Number(body.no_makedown),
        Number(body.makedown),
      ].map((value) => {
        if (isNaN(value)) throw new Error(`Invalid number: ${value}`);
        return Number(value.toFixed(1));
      });

      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          success: true,
          source: body.source || body.type || "update",
          values: values,
          mode: body.mode || "light",
          timestamp,
          request_source: body.glide_source || body.source || "unknown",
        }),
      };
    }

    console.log("No values received in request");
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        success: true,
        message: "No values to process",
        request_source: body.glide_source || body.source || "unknown",
      }),
    };
  } catch (error) {
    console.error("=== Error Processing Request ===");
    console.error("Error:", error.message);
    console.error("Raw request body:", event.body);
    console.error("===================");

    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        success: false,
        message: error.message,
        receivedBody: event.body,
      }),
    };
  }
};
