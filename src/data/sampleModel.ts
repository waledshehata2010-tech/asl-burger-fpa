/**
 * Bundled default sample dataset.
 * ---------------------------------------------------------------------------
 * These are the actual audited/validated numbers from the delivered Asl
 * Burger workbook ("الموديل المالي - شركة أصل البرجر (محدث يوليو 2026).xlsx"),
 * recalculated and balance-checked (7/7 checks passing). This file exists so
 * the platform has something real to render before a user uploads their own
 * workbook — it is a *data* fixture in the data layer, not a value baked into
 * any component. Once a workbook is uploaded, `excelParser.ts` produces a
 * fresh `FinancialModel` that fully replaces this one.
 */
import type { FinancialModel } from "@/types/financial";

export const SAMPLE_MODEL: FinancialModel = {
  historical: {
    years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
    labels: ["2018", "2019", "2020", "2021e", "2022", "2023", "2024", "2025"],
    estimated: [false, false, false, true, false, false, false, false],
    revenue: [11026760, 14719598, 21832164, 27042000, 33484502, 52092219, 81426360, 122242571],
    grossProfit: [4058628, 3216750, 3645749, null, 4046661, 9595539, 25140511, 50336364],
    netIncome: [1001721, 3431741, 5952473, 4600000, 2246160, 3998586, 7463574, 11317222],
    totalAssets: [2814002, 4875737, 10103467, null, 14000030, 21132165, 26174524, 28845581],
    totalEquity: [1451721, 3731741, 7683221, null, 4033442, 8032028, 12886173, 16739821],
    totalLiabilities: [1362281, 1143996, 2420246, null, 9966588, 13100137, 13288351, 12105760],
    cash: [663463, 1917399, 4058144, null, 1410901, 3198356, 5932048, 1754745],
  },
  forecastBase: {
    years: [2024, 2025, 2026, 2027, 2028, 2029, 2030],
    revenue: [81426360, 122242571, 179934105.23, 223007515.75, 268158192.17, 318870847.54, 370451806.87],
    grossProfit: [25140511, 50336364, 74237761.61, 92684365.41, 113275377.15, 137029133.52, 161105338.15],
    operatingIncome: [7473322, 11581546, 26350464.49, 36152844.72, 47522984.18, 60701528.21, 73997001.52],
    ebitda: [8580660, 13189072, 28274845.3, 40014238.55, 52698447.93, 67221163.37, 82092120.4],
    netIncome: [7463574, 11317222, 25968754.97, 35526075.7, 46611961.67, 59461042.1, 72424128.58],
    endingCash: [5932048, 1754745, 5138042.72, 17119658.35, 33271047.77, 49062450.4, 67567103.16],
    currentRatio: [1.3953, 1.6737, 1.7968, 2.3445, 2.8663, 3.2062, 3.5339],
    capex: [4268140, 3701778, 17609209.26, 11946090.19, 12219740.11, 14322579.32, 14519518.07],
    payoutRatio: [0, 0, 0.45, 0.55, 0.65, 0.75, 0.8],
    newBranches: [0, 0, 10, 6, 6, 7, 7],
    totalBranches: [14, 20, 26, 32, 38, 45, 52],
  },
  scenarios: {
    base: { key: "base", label: "الأساسي", sameStoreDelta: 0, cogsShock: 0.015, constrInflation: 0.03, waccPremium: 0 },
    optimistic: { key: "optimistic", label: "المتفائل", sameStoreDelta: 0.03, cogsShock: -0.005, constrInflation: -0.01, waccPremium: -0.01 },
    pessimistic: { key: "pessimistic", label: "المتحفظ", sameStoreDelta: -0.05, cogsShock: 0.045, constrInflation: 0.08, waccPremium: 0.03 },
  },
  benchmarks: {
    metrics: [
      { key: "grossMargin", label: "هامش إجمالي الربح", fmt: "pct" },
      { key: "ebitdaMargin", label: "هامش EBITDA", fmt: "pct" },
      { key: "netMargin", label: "هامش صافي الربح", fmt: "pct" },
      { key: "currentRatio", label: "نسبة التداول", fmt: "x" },
      { key: "quickRatio", label: "نسبة السيولة السريعة", fmt: "x" },
      { key: "roe", label: "العائد على حقوق الملكية", fmt: "pct" },
      { key: "payout", label: "نسبة توزيع الأرباح", fmt: "pct" },
    ],
    companies: {
      burgerizzr: { name: "برجريزر", tag: "6016 / Nomu", grossMargin: 0.323, ebitdaMargin: null, netMargin: 0.0297, currentRatio: 1.11, quickRatio: 0.64, roe: 0.1907, payout: 0.513 },
      herfy: { name: "هرفي", tag: "6002 / Tadawul", grossMargin: 0.248, ebitdaMargin: null, netMargin: -0.059, currentRatio: 1.11, quickRatio: 0.52, roe: -0.0717, payout: 0 },
      industry: { name: "متوسط الصناعة", tag: "Sector benchmark", grossMargin: 0.3041, ebitdaMargin: null, netMargin: -0.052, currentRatio: 1.3, quickRatio: 1.23, roe: 0.0135, payout: 0.4846 },
      americana: { name: "أمريكانا", tag: "6015 / AMR", grossMargin: null, ebitdaMargin: 0.22, netMargin: 0.0723, currentRatio: null, quickRatio: null, roe: null, payout: 0.7998 },
    },
  },
  meta: {
    sourceFileName: "الموديل المالي - شركة أصل البرجر (محدث يوليو 2026).xlsx",
    parsedAt: null,
    sheetsFound: [
      "جدول الايرادات", "قائمة الدخل", "قائمة المركز المالي", "قائمة التدفقات النقدية",
      "لوحة المؤشرات", "الافتراضات", "السيناريوهات", "الأداء التاريخي الموسع", "معايير الصناعة",
    ],
    warnings: [],
  },
};
