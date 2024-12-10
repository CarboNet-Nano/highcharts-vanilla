export class EventManager {
  constructor(chart) {
    this.chart = chart.chart; // Get the Highcharts instance
    this.setupResizeObserver(chart.container); // Pass the container element
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

  setupURLListener() {
    // Setup URL change detection if needed
  }
}
