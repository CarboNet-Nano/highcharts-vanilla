import { formatters } from "./formatters.js";
import { themeManager } from "./themeManager.js";

export const tooltipManager = {
  format(point) {
    const theme = themeManager.getCurrentTheme();
    return {
      backgroundColor: theme.tooltip,
      borderWidth: 0,
      style: {
        color: theme.text,
      },
      formatter: function () {
        return `<div>${formatters.number(
          this.y,
          this.series.userOptions.unit
        )}</div>`;
      },
    };
  },
};
