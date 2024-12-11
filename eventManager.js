export class EventManager {
  constructor(chart) {
    this.chart = chart.chart; // Highcharts instance
    this.chartWrapper = chart; // Chart class instance
    this.lastValues =
      new URLSearchParams(window.location.search).get("values") || "";

    this.setupResizeObserver(chart.container);
    this.setupURLListener();
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
    // Listen for popstate events (browser back/forward)
    window.addEventListener("popstate", () => this.handleURLChange());

    // Create MutationObserver for URL changes
    const observer = new MutationObserver(() => {
      const currentValues =
        new URLSearchParams(window.location.search).get("values") || "";
      if (currentValues !== this.lastValues) {
        this.handleURLChange();
        this.lastValues = currentValues;
      }
    });

    // Observe URL changes
    observer.observe(document.querySelector("body"), {
      childList: true,
      subtree: true,
    });
  }

  handleURLChange() {
    const params = new URLSearchParams(window.location.search);
    const values = params.get("values");

    if (values && values !== this.lastValues) {
      const validatedData = this.chartWrapper.validateAndUpdateData();
      // Only update if we have valid data and values actually changed
      if (validatedData && validatedData.length > 0) {
        const currentData = this.chart.series[0].data.map((point) => point.y);
        const newData = validatedData.map((point) => point.y);

        if (JSON.stringify(currentData) !== JSON.stringify(newData)) {
          this.chartWrapper.update(validatedData);
        }
      }
      this.lastValues = values;
    }
  }
}
