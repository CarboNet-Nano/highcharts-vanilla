import { Chart } from "./chart.js";
import { EventManager } from "./eventManager.js";
import { stateManager } from "./stateManager.js";

async function initializeApp() {
  const container = document.getElementById("chart-container");

  // Initialize state from API
  await stateManager.initializeFromAPI();

  // Create chart with initialized state
  window.chartInstance = new Chart(container);
  const events = new EventManager(chartInstance);
}

// Initialize when page loads
document.addEventListener("DOMContentLoaded", initializeApp);
