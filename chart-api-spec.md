# Highcharts API Specification v1

## Base URL

```
/.netlify/functions
```

## Authentication

- API Key required in headers
- Format: `X-API-Key: your-api-key`

## Endpoints

### 1. Initialize Chart

```
POST /chart/init
```

Creates new chart configuration or retrieves existing.

Request:

```json
{
  "appId": "glide-app-123",
  "chartId": "calc-revenue",
  "type": "calculator",
  "config": {
    "thresholds": {
      "values": [15, 45],
      "colors": ["#D32F2F", "#FFCA28", "#388E3C"]
    },
    "defaultUnit": "%",
    "variables": [
      {
        "name": "target",
        "type": "number",
        "default": 80
      }
    ]
  }
}
```

Response:

```json
{
  "success": true,
  "chartId": "calc-revenue",
  "config": {
    // Config as submitted or existing
  },
  "token": "chart-session-token"
}
```

### 2. Get User Data

```
GET /chart/data/{chartId}
```

Headers:

- `X-API-Key`: Required
- `X-User-Id`: Required

Query Parameters:

- `timestamp`: Optional, get data after timestamp

Response:

```json
{
  "success": true,
  "data": {
    "values": [35, 46, 82],
    "timestamp": 1702308000000,
    "metadata": {
      "variables": {
        "target": 80
      }
    }
  }
}
```

### 3. Update Data

```
POST /chart/data/{chartId}
```

Headers:

- `X-API-Key`: Required
- `X-User-Id`: Required

Request:

```json
{
  "values": [36, 46, 82],
  "metadata": {
    "variables": {
      "target": 85
    }
  }
}
```

Response:

```json
{
  "success": true,
  "timestamp": 1702308000000
}
```

### 4. Update Configuration

```
PATCH /chart/config/{chartId}
```

Request:

```json
{
  "config": {
    "thresholds": {
      "values": [20, 50],
      "colors": ["#ff0000", "#ffff00", "#00ff00"]
    }
  }
}
```

Response:

```json
{
  "success": true,
  "config": {
    // Updated configuration
  }
}
```

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

Common Error Codes:

- `AUTH_FAILED`: Invalid or missing API key
- `INVALID_REQUEST`: Malformed request data
- `NOT_FOUND`: Chart or data not found
- `VALIDATION_ERROR`: Data validation failed

## Rate Limits

- 100 requests per minute per API key
- 429 Too Many Requests response when exceeded

## Tracking

Each request logs:

- Timestamp
- API Key
- Chart ID
- User ID (when provided)
- Response time
- Error count

## Implementation Notes

### For Glide Integration:

1. Store API key in Glide environment
2. Use Glide user ID for X-User-Id header
3. Call update endpoint on:
   - Slider change
   - Button press
   - Input change
4. Handle errors by:
   - Showing error message
   - Reverting to previous value
   - Retrying failed requests

### Performance Considerations:

1. Cache configuration
2. Optimize for cold starts
3. Use conditional requests
4. Implement retry logic

### Future Dashboard Support:

- Endpoint structure supports additional chart types
- Metadata field extensible for dashboard needs
- Filter support built into data structure

## Testing Recommendations

1. Basic Flow:

```javascript
// 1. Initialize chart
POST / chart / init;
// 2. Get initial data
GET / chart / data / { chartId };
// 3. Update on user action
POST / chart / data / { chartId };
```

2. Test Cases:

- Single value update
- Multiple value updates
- Variable changes
- Error conditions
- Rate limiting
- Authentication failures

Would you like me to focus on any particular aspect of this spec or move on to implementation?
