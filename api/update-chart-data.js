const { performance } = require('perf_hooks');
const websocket = require('./websocket');

exports.handler = async (event, context) => {
  const startTime = performance.now();
  
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { 
      statusCode: 200, 
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        success: false,
        message: 'Method not allowed'
      })
    };
  }

  try {
    // Parse and validate request body
    const body = JSON.parse(event.body);
    console.log('Request body:', body);

    // Validate required fields
    if (!body.values || !Array.isArray(body.values)) {
      throw new Error('Values array is required');
    }

    // Validate each value is a number
    const validatedValues = body.values.map(value => {
      const num = Number(value);
      if (isNaN(num)) {
        throw new Error(`Invalid number: ${value}`);
      }
      return num;
    });

    // Broadcast update through WebSocket
    await websocket.broadcast({
      values: validatedValues,
      timestamp: new Date().toISOString()
    });

    const endTime = performance.now();

    // Return success response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        values: validatedValues,
        timestamp: new Date().toISOString(),
        processingTime: endTime - startTime
      })
    };

  } catch (error) {
    console.error('Error processing request:', error);

    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        success: false,
        message: error.message,
        receivedBody: event.body
      })
    };
  }
};
