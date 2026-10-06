/**
 * Data loading and aggregation.
 *
 * A monthly record has the shape:
 *   {
 *     year: 2002,
 *     month: 2,              // 0 = January … 11 = December
 *     maxTemperature: 28,    // highest daily maximum in the month (°C)
 *     minTemperature: 14,    // lowest daily minimum in the month (°C)
 *     days: [{ day, maxTemperature, minTemperature }, ...]  // daily values, in date order
 *   }
 */

const parseDate = d3.timeParse("%Y-%m-%d");

/** Converts one CSV row into a daily record with numeric fields. */
function parseDailyRow(row) {
  const date = parseDate(row.date);
  return {
    year: date.getFullYear(),
    month: date.getMonth(),
    day: date.getDate(),
    maxTemperature: +row.max_temperature,
    minTemperature: +row.min_temperature,
  };
}

/** Loads the daily CSV and groups it into one record per (year, month). */
export async function loadMonthlyTemperatures(filePath) {
  const dailyRecords = await d3.csv(filePath, parseDailyRow);

  return d3
    .flatGroup(dailyRecords, (d) => d.year, (d) => d.month)
    .map(([year, month, days]) => ({
      year,
      month,
      maxTemperature: d3.max(days, (d) => d.maxTemperature),
      minTemperature: d3.min(days, (d) => d.minTemperature),
      days,
    }));
}

/** Keeps only the records from the most recent `yearCount` years in the data. */
export function filterRecentYears(monthlyRecords, yearCount) {
  const latestYear = d3.max(monthlyRecords, (d) => d.year);
  return monthlyRecords.filter((d) => d.year > latestYear - yearCount);
}
