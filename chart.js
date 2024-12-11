// Modified sections of chart.js
import { stateManager } from "./stateManager.js";

export class Chart {
  constructor(container) {
    this.container = container;
    this.chart = null;
    this.setupChart();
  }

  setupChart() {
    const theme = themeManager.getCurrentTheme();
    const data = stateManager.getState(); // Use state instead of URL
    const validatedData = dataManager
      .validateData(data.values)
      .map((value) => ({
        y: value,
        color: themeManager.getColorForValue(value),
      }));

    // Rest of setup remains the same
    // ...
  }

  // Test method to update values
  updateChartValues(newValues) {
    if (this.chart) {
      const state = stateManager.updateValues(newValues);
      const validatedData = dataManager
        .validateData(state.values)
        .map((value) => ({
          y: value,
          color: themeManager.getColorForValue(value),
        }));

      validatedData.forEach((point, i) => {
        const currentPoint = this.chart.series[0].points[i];
        if (
          currentPoint &&
          (currentPoint.y !== point.y || currentPoint.color !== point.color)
        ) {
          currentPoint.update(point, false, false);
        }
      });

      this.chart.series[0].isDirty = true;
      this.chart.series[0].isDirtyData = true;
      this.chart.redraw(false);
    }
  }
}
