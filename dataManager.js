import { formatters } from "./formatters.js";
import { stateManager } from "./stateManager.js";

export const dataManager = {
  // Get data from state instead of URL
  getData() {
    return stateManager.getState();
  },

  validateData(data) {
    return data.filter((value) => !isNaN(value) && isFinite(value));
  },
};
