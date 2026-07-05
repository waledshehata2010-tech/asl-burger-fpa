/**
 * Cell-map configuration for the Asl Burger financial model workbook.
 *
 * This is the ONLY place that knows about specific sheet names / cell
 * coordinates. If the workbook layout changes, update this file only —
 * the parser, data engine and UI never reference raw cell addresses.
 */
export const SHEET_NAMES = {
  revenue: "جدول الايرادات",
  incomeStatement: "قائمة الدخل",
  balanceSheet: "قائمة المركز المالي",
  cashFlow: "قائمة التدفقات النقدية",
  kpiDashboard: "لوحة المؤشرات",
  assumptions: "الافتراضات",
  scenarios: "السيناريوهات",
  extendedHistory: "الأداء التاريخي الموسع",
  industryBenchmarks: "معايير الصناعة",
  checks: "الفحوصات",
} as const;

// Forecast-block sheets use columns B..H for years 2024..2030
export const FORECAST_YEAR_COLUMNS = ["B", "C", "D", "E", "F", "G", "H"] as const;
export const FORECAST_YEARS = [2024, 2025, 2026, 2027, 2028, 2029, 2030];
// Only the projection years (2026-2030) that scenario sliders act on
export const PROJECTION_YEAR_COLUMNS = ["D", "E", "F", "G", "H"] as const;
export const PROJECTION_YEARS = [2026, 2027, 2028, 2029, 2030];

// Extended history sheet uses columns B..I for years 2018..2025
export const HISTORY_YEAR_COLUMNS = ["B", "C", "D", "E", "F", "G", "H", "I"] as const;
export const HISTORY_YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

export const ROWS = {
  incomeStatement: { revenue: 7, cogs: 8, grossProfit: 9, sellingExpense: 10, adminExpense: 11, operatingIncome: 12, netIncomeBeforeZakat: 16, netIncome: 18 },
  balanceSheet: { cash: 7, totalCurrentAssets: 11, totalAssets: 15, totalCurrentLiabilities: 20, totalLiabilities: 24, totalEquity: 29 },
  cashFlow: { capex: 25, endingCash: 36 },
  kpiDashboard: { grossProfit: 9, grossMargin: 10, ebitda: 14, ebitdaMargin: 15, netIncome: 16, netMargin: 17, currentRatio: 20, quickRatio: 21, roe: 22 },
  assumptions: { payoutRatio: 63 },
  scenarios: { sameStoreDelta: 7, cogsShock: 8, constrInflation: 9, waccPremium: 10 },
  extendedHistory: { revenue: 7, grossProfit: 10, netIncome: 12, totalAssets: 14, totalEquity: 15, totalLiabilities: 16, cash: 17 },
  industryBenchmarks: { grossMargin: 6, ebitdaMargin: 7, netMargin: 8, currentRatio: 9, quickRatio: 10, roe: 11, payout: 12 },
} as const;

// Scenario columns on the السيناريوهات sheet
export const SCENARIO_COLUMNS = { base: "B", optimistic: "C", pessimistic: "D" } as const;

// Industry benchmark columns on معايير الصناعة sheet
export const BENCHMARK_COLUMNS = {
  burgerizzr: "B",
  herfy: "C",
  industry: "D",
  americana: "E",
} as const;
