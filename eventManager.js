export class EventManager {
  constructor(chart) {
    this.chart = chart.chart; // Highcharts instance
    this.chartWrapper = chart; // Chart class instance
    this.setupResizeObserver(chart.container);
  }

  setupResizeObserver(container) {
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (this.chart) {
          this.chart.setSize(
            entry.contentRect.width,
            entry.contentRect.height,
            false
          );
        }
      }
    });

    observer.observe(container);
  }
}
