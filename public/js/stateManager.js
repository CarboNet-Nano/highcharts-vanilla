// stateManager.js
export const stateManager = {
  currentState: {
    values: [35, 46, 82],
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
};
