export const stateManager = {
  currentState: {
    values: [], // Empty initially, will be populated from API
    unit: "%",
    mode: "light",
  },

  // Method to update values only
  updateValues(newValues) {
    this.currentState.values = newValues;
    return this.currentState;
  },

  // Get current state
  getState() {
    return this.currentState;
  },

  // Initialize state from API
  async initializeFromAPI() {
    try {
      const response = await fetch("/.netlify/functions/get-chart-values", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chartId: "test-chart",
        }),
      });

      const data = await response.json();
      if (data.success && data.values) {
        this.updateValues(data.values);
      }
    } catch (error) {
      console.error("Failed to initialize state:", error);
    }
  },
};
