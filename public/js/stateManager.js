export const stateManager = {
  currentState: {
    values: [],
    unit: "%",
    mode: "light",
  },

  updateValues(newValues) {
    this.currentState.values = newValues;
    return this.currentState;
  },

  updateMode(newMode) {
    if (newMode === "dark" || newMode === "light") {
      this.currentState.mode = newMode;
      window.chartInstance?.updateTheme(newMode);
      return this.currentState;
    }
    return false;
  },

  getState() {
    return this.currentState;
  },

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
      if (data.success) {
        if (data.values) this.updateValues(data.values);
        if (data.mode) this.updateMode(data.mode);
      }
    } catch (error) {
      console.error("Failed to initialize state:", error);
    }
  },
};
