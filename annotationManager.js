import { themeManager } from "./themeManager.js";
import { formatters } from "./formatters.js";

export const annotationManager = {
  createLabels(value) {
    return {
      enabled: true,
      formatter: function () {
        return formatters.number(this.y, this.series.userOptions.unit);
      },
      style: {
        color: themeManager.getCurrentTheme().text,
      },
    };
  },
};
