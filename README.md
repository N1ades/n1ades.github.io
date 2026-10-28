# n1ades.github.io

All my sites in one repository:

| Path | What it is |
|------|------------|
| `/` and `/2026/` | Current 2026 site — the landing page served at [nyades.dev](https://nyades.dev/), mirrored here |
| `/2025/` | 2025 version of the site (source in `2025-src/`, built by CI) |
| `/2024/` | 2024 version of the site (source in `2024-src/`, built by CI) |
| `/2018/` | Snapshot of ksimin.ru from the Wayback Machine (2018-02-25) |

## How it works

GitHub Actions (`.github/workflows/web.yml`) on every push to `master`:

1. Builds `2024-src` and `2025-src` (Vue/Vite projects) with `--base=/2024/` and `--base=/2025/`
   so that assets resolve inside their subdirectories.
2. Assembles `_site/`: the `2026/` files go to the root (and to `/2026/`), `2018/` is copied as is.
3. Deploys `_site/` to GitHub Pages.

## History

The original repositories were consolidated here and then removed.
Their commit histories (all commits, dates and authors) are preserved in branches:

- `archive/nyadesdev` — full history of `N1ades/nyadesdev` (2025–2026)
- the 2024 site history is the early history of this very repository (`2024-src/` was moved there)
