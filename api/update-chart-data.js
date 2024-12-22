const { performance } = require("perf_hooks");
const pusher = require("./pusher");

exports.handler = async (event, context) => {
  const startTime = performance.now();
  const timestamp = new Date().toISOString();

  try {
    const body = JSON.parse(event.body);

    // Detailed request logging
    console.log("=== Update Request Details ===");
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
        if (isNaN(value)) {
          throw new Error(`Invalid number: ${value}`);
        }
        return Number(value.toFixed(1));
      });

      console.log("Sending to Pusher from update-chart-data:", values);

      let retries = 3;
      let lastError;

      while (retries > 0) {
        try {
          await pusher.trigger("chart-updates", "value-update", {
            type: "update",
            source: "update-workflow",
            values,
            mode: body.mode || "light",
            timestamp,
            request_source: body.glide_source || body.source || "unknown",
          });
          break;
        } catch (error) {
          lastError = error;
          retries--;
          if (retries > 0) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
      }

      if (retries === 0) {
        console.error(
          "Failed to send Pusher message after retries:",
          lastError
        );
        throw lastError;
      }

      const endTime = performance.now();
      console.log(`Function execution time: ${endTime - startTime}ms`);

      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          success: true,
          source: "update-workflow",
          values,
          mode: body.mode || "light",
          timestamp,
          request_source: body.glide_source || body.source || "unknown",
          processingTime: endTime - startTime,
        }),
      };
    }

    console.log("No values received in update request");
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
    console.error("=== Error Processing Update Request ===");
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
