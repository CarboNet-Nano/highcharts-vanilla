import { themeManager } from "./themeManager.js";
import { dataManager } from "./dataManager.js";
import { DEFAULT_SETTINGS, ANIMATION_CONFIG } from "./constants.js";
import { tooltipManager } from "./tooltipManager.js";
import { annotationManager } from "./annotationManager.js";

export class Chart {
  constructor(container) {
    this.container = container;
    this.chart = null;
    this.setupChart();
  }

  setupChart() {
    const theme = themeManager.getCurrentTheme();
    const data = dataManager.parseURLParams();
    const validatedData = dataManager
      .validateData(data.values)
      .map((value) => ({
        y: value,
        color: themeManager.getColorForValue(value),
      }));

    this.chart = Highcharts.chart(this.container, {
      chart: {
        type: "column",
        animation: ANIMATION_CONFIG,
        backgroundColor: theme.background,
        ...DEFAULT_SETTINGS,
      },
      title: {
        text: null,
      },
      xAxis: {
        categories: ["Value 1", "Value 2", "Value 3"],
        labels: {
          style: {
            color: theme.text,
          },
        },
      },
      yAxis: {
        title: {
          text: null,
        },
        labels: {
          format: "{value}" + data.unit,
          style: {
            color: theme.text,
          },
        },
        gridLineWidth: 0,
      },
      tooltip: tooltipManager.format(),
      plotOptions: {
        column: {
          dataLabels: annotationManager.createLabels(),
        },
      },
      series: [
        {
          name: "Values",
          data: validatedData,
          unit: data.unit,
        },
      ],
      accessibility: {
        enabled: false,
      },
    });
  }

  validateAndUpdateData() {
    const data = dataManager.parseURLParams();
    return dataManager.validateData(data.values).map((value) => ({
      y: value,
      color: themeManager.getColorForValue(value),
    }));
  }

  update(newData) {
    if (this.chart) {
      this.chart.series[0].setData(newData, false);
      this.chart.redraw();
    }
  }
}
