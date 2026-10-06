/**
 * Entry point: loads the data once and draws both levels of the assignment.
 */
import { DATA_FILE, LEVEL1_CHART, LEVEL2_CHART } from "./config.js";
import { loadMonthlyTemperatures, filterRecentYears } from "./data.js";
import { drawTemperatureHeatmap } from "./heatmap.js";

async function main() {
  try {
    const monthlyRecords = await loadMonthlyTemperatures(DATA_FILE);

    // Level 1: every year, colour only
    drawTemperatureHeatmap("#level1-chart", monthlyRecords, LEVEL1_CHART);

    // Level 2: recent years, with a daily mini line chart in each cell
    const recentRecords = filterRecentYears(monthlyRecords, LEVEL2_CHART.recentYearCount);
    drawTemperatureHeatmap("#level2-chart", recentRecords, LEVEL2_CHART);
  } catch (error) {
    // Most often caused by opening index.html directly instead of through a web server
    console.error(error);
    d3.select("main")
      .insert("p", ":first-child")
      .attr("class", "load-error")
      .text(`Could not load ${DATA_FILE}. Serve the repository root with a local web server (see solution/README.md).`);
  }
}

main();
