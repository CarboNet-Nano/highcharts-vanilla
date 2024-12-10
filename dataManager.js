import { formatters } from "./formatters.js";

export const dataManager = {
  parseURLParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      values: this.parseValues(params.get("values")),
      unit: params.get("unit") || "%",
      mode: params.get("mode") || "light",
    };
  },

  parseValues(valueString) {
    if (!valueString) return [];
    return valueString.split(",").map((v) => parseFloat(v));
  },

  validateData(data) {
    return data.filter((value) => !isNaN(value) && isFinite(value));
  },
};
