import { Chart } from "./chart.js";
import { EventManager } from "./eventManager.js";

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("chart-container");
  window.chartInstance = new Chart(container); // Made global for testing
  const events = new EventManager(chartInstance);
});
