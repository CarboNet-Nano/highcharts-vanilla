import { Chart } from "./chart.js";
import { EventManager } from "./eventManager.js";

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("chart-container");
  const chart = new Chart(container);
  const events = new EventManager(chart);
});
