import { COLOR_SCHEMES, VALUE_COLORS } from "./constants.js";

export const themeManager = {
  currentMode: "light",

  getColorForValue(value) {
    if (value <= 15) return VALUE_COLORS.low;
    if (value <= 45) return VALUE_COLORS.medium;
    return VALUE_COLORS.high;
  },

  setMode(mode) {
    this.currentMode = mode;
    return COLOR_SCHEMES[mode];
  },

  getCurrentTheme() {
    return COLOR_SCHEMES[this.currentMode];
  },
};
