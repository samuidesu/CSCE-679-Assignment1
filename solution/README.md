# Solution: HK Temperature Heatmap (Level 1 & 2)

## How to run

The page loads `../temperature_daily.csv` with `fetch`, so it must be served over HTTP
(opening `index.html` directly will not work). Start the server from the **repository root**:

```bash
python -m http.server 8000
# then open http://localhost:8000/solution/
```

## Project structure

| File | Responsibility |
| --- | --- |
| `index.html` | Page layout; loads D3 v7 and `js/main.js` |
| `css/style.css` | Page, chart, toggle and tooltip styles |
| `js/config.js` | All settings: sizes, colours, year range, mini-chart options |
| `js/data.js` | Loads the daily CSV and aggregates it per year/month |
| `js/heatmap.js` | Draws one heatmap (axes, cells, legend, tooltip, max/min toggle, optional daily lines) |
| `js/main.js` | Entry point: draws Level 1 (all years) and Level 2 (last 10 years with daily lines) |

## Interactions

- Hover a cell to see its date and the month's max/min temperature.
- Use the buttons (or click any cell) to colour the cells by monthly max or min temperature.
