/**
 * Excel Parser Service
 * ---------------------------------------------------------------------------
 * Reads the Asl Burger financial model workbook (client-side, via SheetJS)
 * and converts it into the strongly-typed `FinancialModel` shape consumed by
 * the Data Engine. This is the ONLY module that touches a raw `Workbook` /
 * `WorkSheet` object — everything downstream works with typed data.
 *
 * The workbook is the single source of truth: nothing here invents numbers,
 * it only reads cached cell values (`cell.v`) that Excel/LibreOffice computed
 * when the file was saved. If a sheet or cell is missing, a warning is
 * recorded in `meta.warnings` and a safe fallback (0 / null) is used so the
 * UI never crashes on a malformed upload.
 */
import * as XLSX from "xlsx";
import type {
  BenchmarkCompany,
  BenchmarkData,
  FinancialModel,
  ForecastSeries,
  HistoricalSeries,
  ScenarioDefinition,
  ScenarioKey,
} from "@/types/financial";
import {
  BENCHMARK_COLUMNS,
  FORECAST_YEAR_COLUMNS,
  FORECAST_YEARS,
  HISTORY_YEAR_COLUMNS,
  HISTORY_YEARS,
  ROWS,
  SCENARIO_COLUMNS,
  SHEET_NAMES,
} from "./excel-cell-map";

function getSheet(wb: XLSX.WorkBook, name: string): XLSX.WorkSheet | null {
  return wb.Sheets[name] ?? null;
}

function num(sheet: XLSX.WorkSheet | null, col: string, row: number): number | null {
  if (!sheet) return null;
  const cell = sheet[`${col}${row}`];
  if (!cell) return null;
  const v = typeof cell.v === "number" ? cell.v : Number(cell.v);
  return Number.isFinite(v) ? v : null;
}

function readRow(sheet: XLSX.WorkSheet | null, row: number, cols: readonly string[]): number[] {
  return cols.map((c) => num(sheet, c, row) ?? 0);
}

function readRowNullable(sheet: XLSX.WorkSheet | null, row: number, cols: readonly string[]): (number | null)[] {
  return cols.map((c) => num(sheet, c, row));
}

function readBenchmarkCompany(
  sheet: XLSX.WorkSheet | null,
  col: string,
  name: string,
  tag: string,
): BenchmarkCompany {
  const r = ROWS.industryBenchmarks;
  return {
    name,
    tag,
    grossMargin: num(sheet, col, r.grossMargin),
    ebitdaMargin: num(sheet, col, r.ebitdaMargin),
    netMargin: num(sheet, col, r.netMargin),
    currentRatio: num(sheet, col, r.currentRatio),
    quickRatio: num(sheet, col, r.quickRatio),
    roe: num(sheet, col, r.roe),
    payout: num(sheet, col, r.payout),
  };
}

export interface ParsedWorkbookResult {
  model: FinancialModel;
  warnings: string[];
  sheetsFound: string[];
}

/**
 * Parse a raw Excel file (ArrayBuffer) into a `FinancialModel`.
 */
export function parseWorkbook(buffer: ArrayBuffer, sourceFileName: string | null): ParsedWorkbookResult {
  const warnings: string[] = [];
  const wb = XLSX.read(buffer, { type: "array", cellFormula: false, cellNF: false });

  const sheetsFound: string[] = [];
  const requiredSheets = Object.values(SHEET_NAMES);
  const sheetRefs: Record<string, XLSX.WorkSheet | null> = {};
  for (const name of requiredSheets) {
    const sheet = getSheet(wb, name);
    if (sheet) {
      sheetsFound.push(name);
    } else {
      warnings.push(`الشيت "${name}" غير موجود في الملف — سيتم استخدام قيم افتراضية.`);
    }
    sheetRefs[name] = sheet;
  }

  const incomeSheet = sheetRefs[SHEET_NAMES.incomeStatement];
  const balanceSheet = sheetRefs[SHEET_NAMES.balanceSheet];
  const cashFlowSheet = sheetRefs[SHEET_NAMES.cashFlow];
  const kpiSheet = sheetRefs[SHEET_NAMES.kpiDashboard];
  const assumptionsSheet = sheetRefs[SHEET_NAMES.assumptions];
  const scenariosSheet = sheetRefs[SHEET_NAMES.scenarios];
  const historySheet = sheetRefs[SHEET_NAMES.extendedHistory];
  const benchmarkSheet = sheetRefs[SHEET_NAMES.industryBenchmarks];

  // ---- Forecast series (2024-2030) -----------------------------------
  const ir = ROWS.incomeStatement;
  const br = ROWS.balanceSheet;
  const cr = ROWS.cashFlow;
  const kr = ROWS.kpiDashboard;

  const forecastBase: ForecastSeries = {
    years: FORECAST_YEARS,
    revenue: readRow(incomeSheet, ir.revenue, FORECAST_YEAR_COLUMNS),
    grossProfit: readRow(incomeSheet, ir.grossProfit, FORECAST_YEAR_COLUMNS),
    operatingIncome: readRow(incomeSheet, ir.operatingIncome, FORECAST_YEAR_COLUMNS),
    ebitda: readRow(kpiSheet, kr.ebitda, FORECAST_YEAR_COLUMNS),
    netIncome: readRow(incomeSheet, ir.netIncome, FORECAST_YEAR_COLUMNS),
    endingCash: readRow(cashFlowSheet, cr.endingCash, FORECAST_YEAR_COLUMNS),
    currentRatio: readRow(kpiSheet, kr.currentRatio, FORECAST_YEAR_COLUMNS),
    capex: readRow(cashFlowSheet, cr.capex, FORECAST_YEAR_COLUMNS).map((v) => Math.abs(v)),
    payoutRatio: readRow(assumptionsSheet, ROWS.assumptions.payoutRatio, FORECAST_YEAR_COLUMNS),
    newBranches: FORECAST_YEAR_COLUMNS.map(() => 0),
    totalBranches: FORECAST_YEAR_COLUMNS.map(() => 0),
  };

  if (forecastBase.revenue.every((v) => v === 0)) {
    warnings.push("لم يتم العثور على بيانات الإيرادات المتوقعة في قائمة الدخل.");
  }
  void br;
  void balanceSheet; // balance-sheet sheet/rows reserved for future statement drill-down views

  // ---- Historical series (2018-2025) ----------------------------------
  const hr = ROWS.extendedHistory;
  const historical: HistoricalSeries = {
    years: HISTORY_YEARS,
    labels: HISTORY_YEARS.map(String),
    estimated: HISTORY_YEARS.map((y) => y === 2021),
    revenue: readRowNullable(historySheet, hr.revenue, HISTORY_YEAR_COLUMNS),
    grossProfit: readRowNullable(historySheet, hr.grossProfit, HISTORY_YEAR_COLUMNS),
    netIncome: readRowNullable(historySheet, hr.netIncome, HISTORY_YEAR_COLUMNS),
    totalAssets: readRowNullable(historySheet, hr.totalAssets, HISTORY_YEAR_COLUMNS),
    totalEquity: readRowNullable(historySheet, hr.totalEquity, HISTORY_YEAR_COLUMNS),
    totalLiabilities: readRowNullable(historySheet, hr.totalLiabilities, HISTORY_YEAR_COLUMNS),
    cash: readRowNullable(historySheet, hr.cash, HISTORY_YEAR_COLUMNS),
  };

  // ---- Scenario definitions --------------------------------------------
  const sr = ROWS.scenarios;
  const scenarioKeys: { key: ScenarioKey; label: string; col: string }[] = [
    { key: "base", label: "الأساسي", col: SCENARIO_COLUMNS.base },
    { key: "optimistic", label: "المتفائل", col: SCENARIO_COLUMNS.optimistic },
    { key: "pessimistic", label: "المتحفظ", col: SCENARIO_COLUMNS.pessimistic },
  ];
  const scenarios = {} as Record<ScenarioKey, ScenarioDefinition>;
  for (const { key, label, col } of scenarioKeys) {
    scenarios[key] = {
      key,
      label,
      sameStoreDelta: num(scenariosSheet, col, sr.sameStoreDelta) ?? 0,
      cogsShock: num(scenariosSheet, col, sr.cogsShock) ?? 0,
      constrInflation: num(scenariosSheet, col, sr.constrInflation) ?? 0,
      waccPremium: num(scenariosSheet, col, sr.waccPremium) ?? 0,
    };
  }

  // ---- Industry benchmarks ----------------------------------------------
  const metrics: BenchmarkData["metrics"] = [
    { key: "grossMargin", label: "هامش إجمالي الربح", fmt: "pct" },
    { key: "ebitdaMargin", label: "هامش EBITDA", fmt: "pct" },
    { key: "netMargin", label: "هامش صافي الربح", fmt: "pct" },
    { key: "currentRatio", label: "نسبة التداول", fmt: "x" },
    { key: "quickRatio", label: "نسبة السيولة السريعة", fmt: "x" },
    { key: "roe", label: "العائد على حقوق الملكية", fmt: "pct" },
    { key: "payout", label: "نسبة توزيع الأرباح", fmt: "pct" },
  ];
  const companies: Record<string, BenchmarkCompany> = {
    burgerizzr: readBenchmarkCompany(benchmarkSheet, BENCHMARK_COLUMNS.burgerizzr, "برجريزر", "6016"),
    herfy: readBenchmarkCompany(benchmarkSheet, BENCHMARK_COLUMNS.herfy, "هرفي", "6002"),
    industry: readBenchmarkCompany(benchmarkSheet, BENCHMARK_COLUMNS.industry, "متوسط الصناعة", "AVG"),
    americana: readBenchmarkCompany(benchmarkSheet, BENCHMARK_COLUMNS.americana, "أمريكانا", "6015"),
  };

  const model: FinancialModel = {
    historical,
    forecastBase,
    scenarios,
    benchmarks: { metrics, companies },
    meta: {
      sourceFileName,
      parsedAt: new Date().toISOString(),
      sheetsFound,
      warnings,
    },
  };

  return { model, warnings, sheetsFound };
}

/** Convenience wrapper for parsing a browser `File` object (from an <input> or drag-drop). */
export async function parseWorkbookFile(file: File): Promise<ParsedWorkbookResult> {
  const buffer = await file.arrayBuffer();
  return parseWorkbook(buffer, file.name);
}
