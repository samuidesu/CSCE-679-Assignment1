/**
 * Central configuration for the Hong Kong temperature heatmaps.
 *
 * Every size, colour and behaviour setting lives here, so the charts can be
 * adjusted without touching the drawing code in heatmap.js.
 * (`d3` is loaded globally from a <script> tag in index.html.)
 */

/** Daily temperature data, relative to index.html (the original file in the repository root). */
export const DATA_FILE = "../temperature_daily.csv";

/** Y-axis labels, indexed by JavaScript month number (0 = January). */
export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * The temperature values a user can colour the cells by.
 * `accessor` reads the value from a monthly record (see data.js).
 */
export const TEMPERATURE_MODES = {
  max: { buttonLabel: "Max temperature", accessor: (record) => record.maxTemperature },
  min: { buttonLabel: "Min temperature", accessor: (record) => record.minTemperature },
};
export const DEFAULT_MODE = "max";

/** Colour encoding shared by the cells and the colour legend. */
export const COLOR_SCALE = {
  // 11-step ColorBrewer Spectral, reversed so that cold = purple/blue and hot = red.
  colors: [...d3.schemeSpectral[11]].reverse(),
  // Temperature range (°C) split into 11 equal-width colour bins.
  // [0, 39] reproduces the cell colours of the reference images exactly.
  domain: [0, 39],
};

/** Per-level chart settings. `width`/`height` is the size of the cell grid. */
export const LEVEL1_CHART = {
  width: 860,
  height: 450,
  margin: { top: 30, right: 110, bottom: 10, left: 80 },
  showDailyLines: false,
};

export const LEVEL2_CHART = {
  width: 990,
  height: 880,
  margin: { top: 30, right: 110, bottom: 10, left: 80 },
  showDailyLines: true,
  recentYearCount: 10, // Level 2 only shows the most recent N years
};

/** Appearance of the month cells. */
export const CELL = {
  padding: 0.2, // gap between cells, as a fraction of one row/column step
  cornerRadius: 3,
};

/** Mini line charts drawn inside each cell (Level 2). */
export const MINI_CHART = {
  dayDomain: [1, 31], // x axis: day of month
  temperatureDomain: [0, 40], // y axis: °C, shared by every cell so they are comparable
  innerPadding: 4, // px between the lines and the cell border
  strokeWidth: 2,
  lines: [
    { field: "maxTemperature", label: "Daily max", color: "#31a354" },
    { field: "minTemperature", label: "Daily min", color: "#9ecae1" },
  ],
};

/** Legend placed to the right of the cell grid. */
export const LEGEND = {
  offsetX: 16, // px between the grid and the legend
  swatchSize: 22,
  labelGap: 6, // px between a swatch and its label
  lineKeyLength: 18, // length of the sample line in the Level 2 line key
  lineKeyGap: 28, // px between the colour legend and the line key
  lineKeyRowHeight: 18,
};

/** Tooltip position relative to the mouse pointer, in px. */
export const TOOLTIP_OFFSET = { x: 14, y: -12 };

/** Duration of the colour transition when switching max/min. */
export const TRANSITION_DURATION_MS = 400;
