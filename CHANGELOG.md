# Changelog

All notable changes to the Asl Burger (أصل البرجر) Enterprise FP&A Platform are documented in this file.

The format loosely follows [Keep a Changelog](https://keepachangelog.com/), and versioning follows [Semantic Versioning](https://semver.org/). The GitHub history for this project was produced through a sequence of small, incremental commits rather than one commit per version; the entries below group those commits into the milestones that matter to a reader, not a literal commit-by-commit log.

## [1.1.0] — 2026-07-05 — Brand Identity & Attribution

Aligns the platform's visual identity with the official Asl Burger brand (aslalburger.sa) and adds authorship attribution across the app and its deliverables. No calculation, data model, or business logic changed in this release.

### Added
- Full brand rebrand: palette switched to the official black/gold/white identity (`--primary`/`--ring`/`--gold` → `#fbb617`), chart and KPI accent colors updated to match, buttons restyled to a pill shape with a gold ambient shadow
- Brand typography: Rubik (Latin) paired with Cairo (Arabic) via `next/font/google`, replacing a font stack entry that was named but never actually loaded as a webfont
- Official Asl Burger logo integrated across the app: desktop sidebar, mobile header, browser favicon and tab icon, the loading screen, and a new print-only header shown in PDF exports (the sidebar/header are hidden when printing, so this was previously missing entirely)
- Persistent attribution footer — "Prepared by: Waleed Shehata — Financial Management, Asl Al-Burger" — shown on every screen (desktop sidebar, mobile bottom navigation) and in the PDF export print header
- The same attribution added to the Enterprise Readiness Gap Assessment (Word) and the UAT Checklist's Approval & Sign-Off sheet (Excel)

### Changed
- Dark theme neutral scale lightened (`--background`, `--card`, `--popover`/`--muted`, `--secondary`/`--accent`) for better on-screen readability, preserving the existing lightness ordering between tokens

### Fixed
- Margins Evolution bar chart (Executive Home) rendered all three series as solid black instead of gold/white/green. Root cause: `BarChartPanel`'s SVG gradient `id`s were built from the localized (Arabic) series label, and an `id` containing spaces breaks the `url(#...)` fill reference, silently falling back to SVG's default black fill. Fixed by keying gradient ids to series index instead of label text

## [1.0.0] — 2026-07-05 — Production Baseline

This is the first release tagged and frozen as a production baseline. It does not introduce new features beyond v0.3.1; it formalizes everything built to date as a stable reference point and ships the full documentation set below.

### Added
- Git tag `v1.0.0` and GitHub Release marking this commit as the production baseline
- Full documentation set: Release Notes, this CHANGELOG, User Manual, Administrator Guide, Installation Guide, Technical Documentation, Data Dictionary, Excel Mapping Documentation, and API Documentation (planned interfaces)
- Round 2 QA report with a Production Readiness Score (9.3 / 10) covering the v0.3.x feature set
- Enterprise Readiness Gap Assessment benchmarking the platform against Oracle EPM Cloud, SAP Analytics Cloud, and Microsoft Power BI Premium / Fabric, with a phased Horizon 1–3 roadmap

### Fixed
- Investor Dashboard chart was labelled "Revenue & Net Income" while plotting only revenue; relabelled to "Revenue — Actual & Forecast" in both languages

## [0.3.1] — 2026-07-05

### Fixed
- Investor Dashboard revenue chart title corrected for copy accuracy (see above; folded into 1.0.0's baseline)

## [0.3.0] — 2026-07-05 — Premium Enterprise FP&A Upgrade

Transformed the platform from a financial dashboard into an executive-facing Enterprise FP&A experience, without changing any underlying financial calculation.

### Added
- **Executive Home**: CEO Summary, CFO Summary, AI Executive Summary (rule-based templated narrative, not an LLM call), Today's Key Insights, Top Risks, Top Opportunities, and a Financial Health Score (weighted composite: profitability 30%, liquidity 25%, growth 20%, cash trajectory 15%, valuation confidence 10%) rendered as an animated SVG gauge
- **KPI Intelligence**: every core KPI now carries a computed trend, target, variance, status (Good / Warning / Critical), and a plain-language explanation, via a new `evaluateKpi()` function
- **Smart Alerts**: automatic alerts for low cash, EBITDA decline, gross margin drop, revenue-vs-budget miss (proxied against the model's own prior forecast), current ratio breaching the 1.1×–1.5× band, and material DCF swings
- **Board Dashboard**: a printable board-report view with health score, AI summary, a metrics table across scenario years, and risk/opportunity summaries
- **Investor Dashboard**: a simplified view with four hero KPIs, a Growth Story narrative, a revenue chart, and a valuation summary
- **KPI drill-down**: clicking any KPI card or KPI Intelligence card navigates directly to the underlying Financial Statements tab, wired through a new shared `uiStore` (Zustand)
- **PDF export**: a print-based export button on every module, backed by a dedicated print stylesheet that hides navigation chrome and forces a light, paper-friendly theme
- Chart upgrades: gradient-filled areas and dashed forecast lines on the revenue/net-income chart, gradient bars with polished tooltips on the margins chart
- Visual polish pass: spacing, typography, hover states, and icon treatment across KPI cards and the app shell
- ~40 new bilingual dictionary keys supporting all of the above

### Changed
- `AppShell` navigation extended from 4 to 6 modules (added Board Report and Investor View), with the mobile bottom nav switched to horizontal scroll to accommodate the extra items

## [0.2.0] — 2026-07-05 — Enterprise QA Pass (Round 1)

The first structured quality-assurance pass across the initial build, covering internationalization, accessibility, security, and correctness.

### Added
- Full English-language support: a 112-key bilingual dictionary, a `useT()` hook, a persisted locale store, and a sidebar language toggle; Arabic remains the RTL default
- Mobile bottom tab bar for `lg:hidden` breakpoints, since the sidebar was previously desktop-only
- Accessibility: skip-to-content link, `aria-current` on active nav items, `aria-label` on icon-only controls, `role="group"` / `role="alert"` / `role="status"` where appropriate
- `error.tsx`, `loading.tsx`, and `not-found.tsx` (the app previously had no error boundary, loading state, or 404 page)
- Security headers (`X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, a same-origin `Content-Security-Policy`) via `next.config.ts`
- Upload-time file validation (extension, size cap, non-empty check) ahead of the Excel parser
- CSV and Excel export (client-side, via SheetJS, UTF-8 BOM for Arabic-safe CSV) on Financial Statements and Benchmarking

### Fixed
- Number formatters did not check `Number.isFinite()`, so `Infinity` / `-Infinity` (reachable from the DCF terminal-value formula when WACC ≤ terminal growth, or from `cagr()` with a negative base year) rendered as literal `"-InfinityB ر.س"`. Hardened `simpleDCF()` with a minimum WACC/terminal-growth spread and `cagr()` to reject negative bases
- Two RTL bugs: the dialog close button and the sidebar's border side
- Dead legacy AG Grid theme CSS variables removed

### Changed
- Financial Statements, Scenario Planning, and Benchmarking converted to code-split lazy imports with a shared skeleton loader; Executive Overview stayed eager as the default tab. First-load JS dropped from 620 kB to 437 kB

### Known issues carried forward (documented, not fixed)
- The `xlsx` (SheetJS) package has publicly known CVEs (prototype pollution, ReDoS) with no fix currently published to the npm registry. Mitigated by upload-time validation and a strict CSP; tracked as an open item

## [0.1.0] — 2026-07-05 — Initial Build

### Added
- Next.js 15 (App Router) + TypeScript + Tailwind v4 project scaffold
- Excel Parser Service (`src/services/excelParser.ts`) reading the Asl Burger workbook client-side via SheetJS, driven entirely by a cell-map configuration (`src/services/excel-cell-map.ts`)
- Data Engine (`src/services/dataEngine.ts`): scenario recomputation, DCF valuation, CAGR, benchmark derivation — pure, side-effect-free functions
- Zustand stores for the financial model and locale; React Query provider scaffold
- Core UI: Financial Statements (income statement, balance sheet, cash flow, scenario view) via AG Grid, Scenario Planning with live slider overrides, Benchmarking against industry peers (Burgerizzr, Herfy, industry average, Americana), and an Executive Overview
- Sample financial model (`src/data/sampleModel.ts`) bundled as the default dataset so the app has content before any upload
- Initial deployment to GitHub and Vercel

---

**Note on version numbers.** Versions 0.1.0–0.3.1 are retroactively assigned in this document to label the work already completed prior to this release; they were not tagged in Git at the time. Only `v1.0.0` and later carry an actual Git tag and GitHub Release.
