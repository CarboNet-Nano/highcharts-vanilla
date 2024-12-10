import { themeManager } from "./themeManager.js";
import { dataManager } from "./dataManager.js";
import { DEFAULT_SETTINGS, ANIMATION_CONFIG } from "./constants.js";

export class Chart {
  constructor(container) {
    this.container = container;
    this.chart = null;
    this.setupChart();
  }

  setupChart() {
    const theme = themeManager.getCurrentTheme();
    const data = dataManager.parseURLParams();

    this.chart = Highcharts.chart(this.container, {
      chart: {
        type: "column",
        animation: ANIMATION_CONFIG,
        backgroundColor: theme.background,
        ...DEFAULT_SETTINGS,
      },
      // ... additional chart configuration
    });
  }

  update(newData) {
    if (this.chart) {
      this.chart.series[0].setData(newData, false);
      this.chart.redraw();
    }
  }
}
