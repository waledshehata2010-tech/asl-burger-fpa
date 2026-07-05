# Asl Burger — Enterprise FP&A Platform

A production-architected Next.js 15 application for financial planning &
analysis at شركة أصل البرجر. The uploaded Excel workbook is the single
source of truth: every KPI, chart, financial statement, scenario, and DCF
valuation is recomputed live from it — nothing financial is hardcoded in a
component.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
hand-authored shadcn/ui components (Radix UI + CVA) · Recharts · AG Grid ·
Framer Motion · Zustand · TanStack React Query · SheetJS (`xlsx`)

## Architecture

```
src/
  app/                   Pages (App Router) — src/app/page.tsx, layout.tsx
  components/
    layouts/             AppShell — nav rail, top bar, module switcher
    modules/              ExecutiveOverview, FinancialStatements,
                          ScenarioPlanning, Benchmarking
    charts/               Recharts + AG Grid wrappers (LineChartPanel,
                          BarChartPanel, ag-grid-theme)
    kpi/                  KpiCard, Sparkline, Delta
    upload/               UploadWorkbookDialog
    ui/                   Hand-authored shadcn/ui primitives
  data/                  sampleModel.ts — bundled default dataset (audited
                          workbook numbers), used until a file is uploaded
  hooks/                 useFinancialModel — the one hook components call
  services/
    excel-cell-map.ts    Sheet/cell coordinates for the workbook template
                          (the ONLY file that knows raw cell addresses)
    excelParser.ts       SheetJS-based reader -> FinancialModel
    dataEngine.ts        Pure scenario engine, DCF, benchmark math
    erpService.ts        Stubbed future ERP/API integration seam
  store/                 financialModelStore.ts — Zustand state
  providers/             query-provider.tsx — React Query client
  types/                 financial.ts — the FinancialModel domain model
```

## Data flow

1. `excelParser.ts` reads an uploaded `.xlsx` (SheetJS, client-side) using
   the coordinates in `excel-cell-map.ts` and produces a typed
   `FinancialModel`.
2. The Zustand store (`financialModelStore.ts`) holds the current model
   (bundled sample or uploaded) plus the active scenario/overrides.
3. `dataEngine.ts` (pure functions, no React) recomputes the 2026-2030
   scenario, DCF valuation, and Asl Burger's own benchmark row from that
   model on every change.
4. `useFinancialModel()` composes store + engine into the single hook every
   component reads from — no component computes financial numbers itself.
5. Uploading a new workbook replaces the model and everything downstream
   recalculates automatically.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm run start   # production build
```

Use the "رفع ملف الإكسل" button in the top bar to load a real workbook, or
work with the bundled sample data (2018-2025 actuals + 2026-2030 forecast
from the audited Asl Burger model) out of the box.

## Extending to an ERP / API backend

`src/services/erpService.ts` is the seam for a future data source: implement
`fetchFromErp()` against the real system and wire it into a React Query hook
alongside `useFinancialModel()` — no component or Data Engine change needed.
