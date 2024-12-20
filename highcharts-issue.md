# Highcharts Theme Mode Issue Analysis

## Current Situation

1. **Initial Page Load Sequence**
   - Web View component in Glide uses template with mode parameter
   - URL format: `https://highchart-vanilla.netlify.app/test-api.html?mode=dark`
   - On load, chart appears briefly, disappears, then reloads after 5 seconds

2. **API Call Sequence**
   - First call: Initial load with mode: 'light' (source unknown)
   - Second call: chartId request with correct values and mode
   - Third call: Initial load with correct mode (dark)

3. **Glide Components**
   - AI Custom Component watching for mode changes
   - 5-second delay added before first mode check
   - Two watchers running:
     - json_column watcher (values + mode)
     - User mode watcher (every second)
   - Both trigger the same workflow (POST API call)

## Attempted Solutions

1. **URL Parameter Handling**
   - Added robust URL parsing
   - Validated mode before initialization
   - Result: Still getting unwanted initial light mode call

2. **API Call Control**
   - Added debouncing (100ms)
   - Added request tracking
   - Result: Didn't prevent multiple calls due to timing

3. **Theme Management**
   - Added localStorage for mode persistence
   - Added stricter mode validation
   - Result: Helped with consistency but didn't fix initial call

4. **Page Loading**
   - Added opacity transitions
   - Added loading states
   - Result: Improved visual experience but underlying issue remains

## What's Working

1. Subsequent mode changes work correctly
2. Chart values update properly
3. Pusher integration working for updates
4. Theme changes after initial load work correctly

## What's Not Working

1. Initial light mode call still occurs
2. Multiple initial-load calls happening
3. Chart flashes before proper initialization
4. Theme sometimes starts wrong and switches

## Next Steps

1. **Investigate Source of Light Mode Call**
   - Track all initialization points
   - Log complete request chain
   - Identify trigger for initial light mode

2. **Consider Structural Changes**
   - Move mode check earlier in initialization
   - Block any rendering until mode confirmed
   - Add request origin tracking

3. **Potential Solutions to Test**
   - Block all initial-load calls after first valid one
   - Move URL parsing to separate initialization phase
   - Add request chain validation
   - Implement stricter initialization sequence

4. **Code Updates Needed**
   - get-chart-values.js: Add request validation
   - test-api.html: Improve initialization sequence
   - update-chart-data.js: Add mode validation

## Current File Responsibilities

1. **get-chart-values.js**
   - Handles initial page load
   - Returns default values
   - Validates mode

2. **update-chart-data.js**
   - Handles value updates
   - Processes mode changes
   - Triggers Pusher updates

3. **test-api.html**
   - Manages chart initialization
   - Handles theme changes
   - Processes URL parameters
   - Manages chart updates

## Questions to Answer

1. Why is the initial light mode call happening?
2. What triggers multiple initial-load requests?
3. How to prevent rendering before mode is confirmed?
4. How to handle race conditions between Glide watchers?