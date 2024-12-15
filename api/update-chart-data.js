exports.handler = async (event) => {
  // Log incoming request
  console.log("Request body:", event.body);

  try {
    const { values } = JSON.parse(event.body);

    if (!values || !Array.isArray(values)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: "Values must be an array",
          received: event.body,
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        values: values,
      }),
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        success: false,
        error: error.message,
        received: event.body,
      }),
    };
  }
};
