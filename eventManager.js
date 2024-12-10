export class EventManager {
  constructor(chart) {
    this.chart = chart;
    this.setupResizeObserver();
    this.setupURLListener();
  }

  setupResizeObserver() {
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

    observer.observe(this.chart.container);
  }

  setupURLListener() {
    // Setup URL change detection if needed
  }
}
