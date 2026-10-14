# KR-MD & TAA Dashboard — Jekyll / GitHub Pages

This project is a **static, browser-only port** of the supplied `1014_DASHBOARD_PUR_Dark_v8_rolling1y` Dash notebook. **No Python or Dash server is needed to host or run it.**

## Pages and functionality

- **Overview** — 5-year rolling vintage plot, revision-aware economic regime backgrounds, future observations in a gray zone, synchronized monthly slider, allocation bars, and precomputed trailing-12-month Sharpe / MDD / cumulative return.
- **KR-MD Explorer** — 13 macro groups and all variables from the original `df_cycle.pkl` plus variable metadata.
- **Regime Analysis** — Global or Grouped PCA, economic-label alignment, full-history timeline, vintage probability bars, transition matrices, and regime-characteristic heatmap.
- **TAA** — Global/Grouped, all four sizing cases and Naive / Ridge / Black–Litterman methods; historical cumulative return vs. the two SAA benchmarks, current and historical asset allocation, performance KPIs.
- **Methodology** — 5 sections of the supplied notebook, including equations and tables, rendered with MathJax.

## Deploy on GitHub Pages (Actions)

1. Create an empty GitHub repository and **upload all files in this folder to the repository root**. Keep the `.github/workflows/pages.yml` file and the `data` and `assets` folders. Do not upload the enclosing folder as a single directory.
2. Ensure the default branch is `main` and push.
3. Under repository **Settings → Pages → Build and deployment**, set **Source = GitHub Actions**.
4. Under **Actions**, check the deployment workflow. The published site should be `https://<USER>.github.io/<REPOSITORY>/`.

For a new repository from a terminal:

```bash
git init
git add .
git commit -m "Add static KR-MD TAA Jekyll dashboard"
git branch -M main
git remote add origin https://github.com/USERNAME/REPOSITORY.git
git push -u origin main
```

**You do not need to edit `_config.yml` for repository subpaths.** Every resource uses a path relative to the main `index.html` file, which works at `/` and at `/REPOSITORY/`.

## Preview locally

Opening the HTML with `file://` in a browser can block local JSON requests due to browser security restrictions. Use the VS Code **Live Server** extension, a local static web server, or GitHub Pages to preview. The actual dashboard never invokes Python.

## Layout

```text
index.html                Jekyll site entry point (with front matter)
_config.yml               Jekyll configuration
.github/workflows/pages.yml
assets/app.js             Interactive, browser-only Dash callback replacement
assets/static.css         Native web control styling
assets/*.css              Original PUR Dark styles
assets/plotly.min.js      Locally bundled Plotly (no CDN required)
assets/tex-svg.js         Locally bundled MathJax (no CDN required)
data/cycles.json          Converted df_cycle.pkl plus mapping metadata
data/regimes.json         Vintage histories, probabilities, matrices and heatmaps
data/taa.json             Original allocation series and evaluated performance
methodology.html          Original 5 methodology sections and equations
```

These JSON files are a **snapshot of the provided final data**, pre-exported during conversion. Adding future data requires updating the corresponding JSON; there is no server-side computation on a visitor's browser. TAA optimization and PCA / clustering are not re-estimated: their supplied final results are displayed as in the source dashboard.

## Vintage slider window fix (2026-10-14)

- The Overview plot is explicitly fixed to **selected vintage − 60 months** through **selected vintage + 15 months** (61 historical monthly regime slots and an unshaded future-data section).
- Plotly updates are serialized and rapid slider events are coalesced, so older transitions cannot replace a newer selection.
- The Overview plot disables Plotly's animated transition, and explicitly reapplies its X-axis range after render. Other tabs and datasets are unchanged.

## Data checks / methodological details

- Each Overview monthly regime history is read from the **vintage-specific** column of `revised_regimes`, not from the latest final series. The selected month is the last historical month with a regime background, and the future shaded region is independent of regime prediction.
- Global and Grouped raw-to-final mapping is applied separately.
- For the original four-class membership probabilities, missing crisis probability is recovered as `1 - sum(R1..R4)` without renormalization.
- TAA cumulative returns come from `monthly_returns_comparison.csv` (percentage units), and KPI metrics come from `performance_comparison.csv`; Overview trailing-12-month performance comes from `performance_vintage_1y_wide.csv`.
- Portfolio allocation charts use the supplied weight CSVs and the source dashboard's cash assumption of 20%.

Not investment advice.
