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
    const state = dataManager.getData();
    themeManager.setMode(state.mode);
    const theme = themeManager.getCurrentTheme();

    const validatedData = dataManager
      .validateData(state.values)
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
        style: {
          fontFamily: "inherit",
          color: theme.text,
        },
      },
      title: {
        text: null,
      },
      xAxis: {
        categories: ["No Boost", "No Makedown", "Makedown"],
        labels: {
          style: { color: theme.text },
        },
        lineColor: theme.text,
        tickColor: theme.text,
        gridLineWidth: 0,
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
          format: "{value}" + state.unit,
          style: { color: theme.text },
        },
        gridLineColor: theme.text,
        lineColor: theme.text,
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
          dataLabels: {
            ...annotationManager.createLabels(),
            style: { color: theme.text },
          },
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
          unit: state.unit,
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

  updateTheme(mode) {
    if (this.chart) {
      themeManager.setMode(mode);
      const theme = themeManager.getCurrentTheme();

      this.chart.update(
        {
          chart: {
            backgroundColor: theme.background,
            style: { color: theme.text },
          },
          xAxis: {
            labels: { style: { color: theme.text } },
            lineColor: theme.text,
            tickColor: theme.text,
            gridLineWidth: 0,
          },
          yAxis: {
            labels: { style: { color: theme.text } },
            gridLineColor: theme.text,
            lineColor: theme.text,
            gridLineWidth: 0,
          },
        },
        false
      );

      this.chart.redraw();
    }
  }
}