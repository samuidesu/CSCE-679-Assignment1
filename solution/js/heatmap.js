/**
 * Year/Month temperature heatmap, used by both Level 1 and Level 2.
 *
 * Columns are years, rows are months, and each cell's colour encodes the
 * month's max or min temperature (switchable). With `showDailyLines` enabled,
 * every cell also contains a mini line chart of the daily max/min temperatures.
 */
import {
  MONTH_NAMES,
  TEMPERATURE_MODES,
  DEFAULT_MODE,
  COLOR_SCALE,
  CELL,
  MINI_CHART,
  LEGEND,
  TOOLTIP_OFFSET,
  TRANSITION_DURATION_MS,
} from "./config.js";

/**
 * Draws a complete heatmap into `containerSelector`.
 * @param {string} containerSelector  CSS selector of an empty element
 * @param {object[]} monthlyRecords   records produced by data.js
 * @param {object} chartConfig        LEVEL1_CHART or LEVEL2_CHART from config.js
 */
export function drawTemperatureHeatmap(containerSelector, monthlyRecords, chartConfig) {
  const container = d3.select(containerSelector);
  const updateModeButtons = createModeToggle(container, (mode) => setMode(mode));
  const chart = createChartArea(container, chartConfig);

  // Scales
  const [firstYear, lastYear] = d3.extent(monthlyRecords, (d) => d.year);
  const xScale = d3
    .scaleBand()
    .domain(d3.range(firstYear, lastYear + 1))
    .range([0, chartConfig.width])
    .padding(CELL.padding);
  const yScale = d3
    .scaleBand()
    .domain(d3.range(MONTH_NAMES.length))
    .range([0, chartConfig.height])
    .padding(CELL.padding);
  const colorScale = d3.scaleQuantize().domain(COLOR_SCALE.domain).range(COLOR_SCALE.colors);

  // Chart elements
  drawAxes(chart, xScale, yScale);
  const cells = drawCells(chart, monthlyRecords, xScale, yScale);
  const legendHeight = drawColorLegend(chart, colorScale, chartConfig.width);
  if (chartConfig.showDailyLines) {
    drawDailyLines(cells, xScale.bandwidth(), yScale.bandwidth());
    drawLineKey(chart, chartConfig.width, legendHeight + LEGEND.lineKeyGap);
  }
  addTooltip(cells);

  // Max/min switching: via the buttons, or by clicking any cell
  let currentMode = DEFAULT_MODE;

  function setMode(mode, duration = TRANSITION_DURATION_MS) {
    currentMode = mode;
    colorCells(cells, colorScale, mode, duration);
    updateModeButtons(mode);
  }

  cells.on("click", () => setMode(getNextMode(currentMode)));
  setMode(DEFAULT_MODE, 0);
}

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

/** Appends a responsive SVG and returns the inner <g> shifted by the margins. */
function createChartArea(container, { width, height, margin }) {
  const totalWidth = width + margin.left + margin.right;
  const totalHeight = height + margin.top + margin.bottom;

  return container
    .append("svg")
    .attr("viewBox", [0, 0, totalWidth, totalHeight])
    .style("max-width", `${totalWidth}px`)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);
}

/** Years along the top, month names down the left side. */
function drawAxes(chart, xScale, yScale) {
  chart
    .append("g")
    .attr("class", "axis")
    .call(d3.axisTop(xScale).tickSizeOuter(0));

  chart
    .append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(yScale).tickFormat((month) => MONTH_NAMES[month]).tickSizeOuter(0));
}

/* ------------------------------------------------------------------ */
/* Cells                                                               */
/* ------------------------------------------------------------------ */

/** Creates one <g class="cell"> per month, holding its background rectangle. */
function drawCells(chart, monthlyRecords, xScale, yScale) {
  const cells = chart
    .append("g")
    .selectAll("g")
    .data(monthlyRecords)
    .join("g")
    .attr("class", "cell")
    .attr("transform", (d) => `translate(${xScale(d.year)}, ${yScale(d.month)})`);

  cells
    .append("rect")
    .attr("class", "cell-background")
    .attr("width", xScale.bandwidth())
    .attr("height", yScale.bandwidth())
    .attr("rx", CELL.cornerRadius);

  return cells;
}

/** Fills each cell with the colour of its max or min temperature. */
function colorCells(cells, colorScale, mode, duration) {
  const temperatureOf = TEMPERATURE_MODES[mode].accessor;

  cells
    .select(".cell-background")
    .transition()
    .duration(duration)
    .attr("fill", (d) => colorScale(temperatureOf(d)));
}

/** Draws the daily max/min lines inside every cell (Level 2). */
function drawDailyLines(cells, cellWidth, cellHeight) {
  const { dayDomain, temperatureDomain, innerPadding, strokeWidth, lines } = MINI_CHART;

  const dayScale = d3
    .scaleLinear()
    .domain(dayDomain)
    .range([innerPadding, cellWidth - innerPadding]);
  const temperatureScale = d3
    .scaleLinear()
    .domain(temperatureDomain)
    .range([cellHeight - innerPadding, innerPadding]);

  lines.forEach(({ field, color }) => {
    const lineGenerator = d3
      .line()
      .x((day) => dayScale(day.day))
      .y((day) => temperatureScale(day[field]));

    cells
      .append("path")
      .attr("class", "daily-line")
      .attr("stroke", color)
      .attr("stroke-width", strokeWidth)
      .attr("d", (month) => lineGenerator(month.days));
  });
}

/* ------------------------------------------------------------------ */
/* Legends                                                             */
/* ------------------------------------------------------------------ */

/**
 * Vertical stack of colour swatches (cold at the top, hot at the bottom),
 * labelled with the ends of the colour domain. Returns the legend height.
 */
function drawColorLegend(chart, colorScale, chartWidth) {
  const { offsetX, swatchSize, labelGap } = LEGEND;
  const colors = colorScale.range();
  const [lowestTemperature, highestTemperature] = colorScale.domain();
  const legendHeight = colors.length * swatchSize;

  const legend = chart
    .append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${chartWidth + offsetX}, 0)`);

  legend
    .selectAll("rect")
    .data(colors)
    .join("rect")
    .attr("y", (color, index) => index * swatchSize)
    .attr("width", swatchSize)
    .attr("height", swatchSize)
    .attr("fill", (color) => color);

  legend
    .append("text")
    .attr("x", swatchSize + labelGap)
    .attr("y", 0)
    .attr("dominant-baseline", "hanging")
    .text(`${lowestTemperature} °C`);

  legend
    .append("text")
    .attr("x", swatchSize + labelGap)
    .attr("y", legendHeight)
    .text(`${highestTemperature} °C`);

  return legendHeight;
}

/** Explains the colour of each mini line chart (Level 2), below the colour legend. */
function drawLineKey(chart, chartWidth, top) {
  const { offsetX, labelGap, lineKeyLength, lineKeyRowHeight } = LEGEND;

  const keyRows = chart
    .append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${chartWidth + offsetX}, ${top})`)
    .selectAll("g")
    .data(MINI_CHART.lines)
    .join("g")
    .attr("transform", (line, index) => `translate(0, ${index * lineKeyRowHeight})`);

  keyRows
    .append("line")
    .attr("x2", lineKeyLength)
    .attr("stroke", (line) => line.color)
    .attr("stroke-width", MINI_CHART.strokeWidth * 2);

  keyRows
    .append("text")
    .attr("x", lineKeyLength + labelGap)
    .attr("dominant-baseline", "middle")
    .text((line) => line.label);
}

/* ------------------------------------------------------------------ */
/* Interaction                                                         */
/* ------------------------------------------------------------------ */

/**
 * Adds one button per temperature mode above the chart.
 * Returns a function that marks the given mode's button as active.
 */
function createModeToggle(container, onSelect) {
  const toolbar = container.append("div").attr("class", "mode-toggle");

  const buttons = toolbar
    .selectAll("button")
    .data(Object.keys(TEMPERATURE_MODES))
    .join("button")
    .attr("type", "button")
    .text((mode) => TEMPERATURE_MODES[mode].buttonLabel)
    .on("click", (event, mode) => onSelect(mode));

  toolbar.append("span").attr("class", "hint").text("or click any cell to switch");

  return (activeMode) =>
    buttons
      .classed("active", (mode) => mode === activeMode)
      .attr("aria-pressed", (mode) => mode === activeMode);
}

/** Returns the mode after `mode`, wrapping around (max → min → max …). */
function getNextMode(mode) {
  const modes = Object.keys(TEMPERATURE_MODES);
  return modes[(modes.indexOf(mode) + 1) % modes.length];
}

/** Shows the month's date and temperatures while the pointer is over a cell. */
function addTooltip(cells) {
  const tooltip = d3.select("body").append("div").attr("class", "tooltip");

  cells
    .on("mouseenter", (event, record) => tooltip.html(formatTooltip(record)).classed("visible", true))
    .on("mousemove", (event) =>
      tooltip
        .style("left", `${event.pageX + TOOLTIP_OFFSET.x}px`)
        .style("top", `${event.pageY + TOOLTIP_OFFSET.y}px`)
    )
    .on("mouseleave", () => tooltip.classed("visible", false));
}

/** Tooltip HTML, e.g. "2002-03 / Max: 28 °C / Min: 14 °C". */
function formatTooltip(record) {
  const monthNumber = String(record.month + 1).padStart(2, "0");
  return `
    <div class="tooltip-date">Date: ${record.year}-${monthNumber}</div>
    <div>Max: ${record.maxTemperature} °C</div>
    <div>Min: ${record.minTemperature} °C</div>
  `;
}
