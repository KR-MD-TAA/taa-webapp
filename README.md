# KR-MD & TAA Dashboard — Jekyll / GitHub Pages

This is a self-contained **static** port of the uploaded October 14, 2026 Dash dashboard. It uses **Jekyll for site generation** and JavaScript + Plotly for interaction. The deployed website does not run Python or Dash. Python was used once to transform source datasets and calculated Plotly figures into JSON.

## GitHub Pages deployment

1. Create a GitHub repository (a new empty repository is fine).
2. Upload the **contents of this ZIP to the repository root**, including the hidden `.github/workflows/pages.yml` file. Do not upload the ZIP itself or place everything in another nested folder.
3. Go to **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Commit on the `main` branch. Select the successful **Deploy Jekyll dashboard to GitHub Pages** workflow under Actions.
5. Visit the URL shown on the Pages deployment. Project pages (`username.github.io/repository/`) and user pages (`username.github.io/`) are both supported through Jekyll's `relative_url` filter.

All four interactive analysis tabs work in the browser using local JSON files; the Methodology tab renders the original math and tables using MathJax. Plotly and MathJax are loaded from public CDNs and require network access. The saved charts and rolling 12-month performance are taken from the submitted source data (not recomputed in a GitHub-hosted Python environment).

### Local preview

```bash
bundle install
bundle exec jekyll serve
```

Open the local URL printed by Jekyll. Do not double-click `index.html`: its Liquid paths require a Jekyll build. **No Python is needed** for preview or deployment.

### Troubleshooting

- If the Action fails in `bundle install`, review the GitHub workflow log for network or dependency errors.
- If the action succeeds but the site is empty, check Pages **Source: GitHub Actions** and that all `json/` files exist on GitHub.
- If graphs remain blank but the rest of the page works, check your browser's developer console and CDN connectivity (Plotly).
- The original `.ipynb`, Python dependencies, and binary pickles were intentionally excluded. Only runtime-required static data and assets were retained.


## Build issue fixed (2026-10-14)
- Removed `.nojekyll`; no longer mixes Jekyll Liquid placeholders with disabled Jekyll processing.
- Asset and JSON links are relative, so both `https://USER.github.io/REPO/` and a custom domain work.
- Bundled Plotly locally to avoid external CDN failures.
- The workflow installs Jekyll explicitly (no missing `Gemfile` or Bundler dependency).
- In **Settings → Pages**, select **GitHub Actions** and upload the *contents* of this folder to your repository root.
- **Do not** open `index.html` directly as `file://`; its JSON files require serving over HTTP(S).
