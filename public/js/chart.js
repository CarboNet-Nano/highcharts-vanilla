import { themeManager } from "./themeManager.js";
import { dataManager } from "./dataManager.js";
import { DEFAULT_SETTINGS, ANIMATION_CONFIG } from "./constants.js";
import { tooltipManager } from "./tooltipManager.js";
import { annotationManager } from "./annotationManager.js";
import { stateManager } from "./stateManager.js";

export class Chart {
  constructor(container) {
    this.container = container;
    this.chart = null;
    this.setupChart();
  }

  setupChart() {
    const theme = themeManager.getCurrentTheme();
    const data = dataManager.getData(); // Using state instead of URL
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
        animation: false,
        events: {
          afterSetExtremes: function () {
            return false;
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
        animation: false,
        events: {
          afterSetExtremes: function () {
            return false;
          },
        },
      },
      tooltip: tooltipManager.format(),
      plotOptions: {
        column: {
          dataLabels: annotationManager.createLabels(),
          animation: false,
        },
        series: {
          animation: false,
          states: {
            hover: {
              animation: false,
            },
          },
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
