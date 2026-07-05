/**
 * Data Engine
 * ---------------------------------------------------------------------------
 * Pure, side-effect-free financial computation layer. Every function here
 * takes a `FinancialModel` (produced by the Excel Parser) and returns typed
 * results — no component in the UI layer computes financial numbers itself,
 * it only calls into this engine and renders what comes back.
 *
 * The scenario-recalculation logic below is a direct TypeScript port of the
 * engine validated against the audited workbook (see the HTML prototype):
 * it reproduces the base case exactly when called with the "base" scenario
 * and zero overrides, and perturbs growth / margins / capex / payout
 * proportionally for the optimistic / pessimistic cases and any custom
 * slider overrides the user supplies.
 */
import type {
  DcfResult,
  FinancialModel,
  ScenarioKey,
  ScenarioOverrides,
  ScenarioResult,
} from "@/types/financial";
import { PROJECTION_YEARS } from "./excel-cell-map";

/** Slice the 7-year (2024-2030) forecast block down to the 5 projection
 *  years (2026-2030) that the scenario engine perturbs. Historical actuals
 *  (2024-2025) stay untouched and are read from `model.historical` instead. */
function projectionSlice(values: number[], years: number[]): number[] {
  const startIdx = years.indexOf(PROJECTION_YEARS[0]);
  if (startIdx < 0) return values.slice(Math.max(0, values.length - PROJECTION_YEARS.length));
  return values.slice(startIdx, startIdx + PROJECTION_YEARS.length);
}

function lastHistorical(model: FinancialModel, key: keyof FinancialModel["historical"]): number {
  const series = model.historical[key] as (number | null)[];
  for (let i = series.length - 1; i >= 0; i--) {
    if (series[i] !== null) return series[i] as number;
  }
  return 0;
}

/**
 * Recompute a full 5-year (2026-2030) scenario result from the base-case
 * projection embedded in the workbook, given a scenario key (base /
 * optimistic / pessimistic) and optional slider overrides.
 */
export function computeScenario(
  model: FinancialModel,
  scenarioKey: ScenarioKey,
  overrides?: ScenarioOverrides,
): ScenarioResult {
  const def = model.scenarios[scenarioKey];
  const baseDef = model.scenarios.base;

  const sameStoreDelta = overrides?.sameStoreDelta ?? def.sameStoreDelta;
  const cogsShock = overrides?.cogsShock ?? def.cogsShock;
  const payoutOverride = overrides?.payoutRatio;
  const shockDelta = cogsShock - baseDef.cogsShock;

  const fb = model.forecastBase;
  const years = PROJECTION_YEARS;
  const revenueP = projectionSlice(fb.revenue, fb.years);
  const grossProfitP = projectionSlice(fb.grossProfit, fb.years);
  const operatingIncomeP = projectionSlice(fb.operatingIncome, fb.years);
  const ebitdaP = projectionSlice(fb.ebitda, fb.years);
  const netIncomeP = projectionSlice(fb.netIncome, fb.years);
  const capexP = projectionSlice(fb.capex, fb.years);
  const payoutP = projectionSlice(fb.payoutRatio, fb.years);
  const endingCashP = projectionSlice(fb.endingCash, fb.years);
  const currentRatioP = projectionSlice(fb.currentRatio, fb.years);

  const lastHistRevenue = lastHistorical(model, "revenue");
  const lastHistCash = lastHistorical(model, "cash");
  const lastHistNetIncome = lastHistorical(model, "netIncome");

  const out: ScenarioResult = {
    years,
    revenue: [], grossProfit: [], operatingIncome: [], ebitda: [], netIncome: [],
    capex: [], dividends: [], endingCash: [], currentRatio: [],
    grossMargin: [], ebitdaMargin: [], netMargin: [],
  };

  let priorRevenue = lastHistRevenue;
  let priorCash = lastHistCash;
  let priorNetIncome = lastHistNetIncome;

  for (let i = 0; i < years.length; i++) {
    const baseRevenue = revenueP[i];
    const baseRevenuePrior = i === 0 ? lastHistRevenue : revenueP[i - 1];
    const baseGrowth = baseRevenuePrior !== 0 ? baseRevenue / baseRevenuePrior - 1 : 0;
    const growth = baseGrowth + sameStoreDelta;
    const revenue = priorRevenue * (1 + growth);

    const baseGrossMargin = revenueP[i] !== 0 ? grossProfitP[i] / revenueP[i] : 0;
    const grossMargin = Math.max(0.05, baseGrossMargin - shockDelta);
    const grossProfit = revenue * grossMargin;

    const opexRatio = revenueP[i] !== 0 ? (grossProfitP[i] - operatingIncomeP[i]) / revenueP[i] : 0;
    const operatingIncome = grossProfit - revenue * opexRatio;

    const daRatio = operatingIncomeP[i] !== 0 ? (ebitdaP[i] - operatingIncomeP[i]) / operatingIncomeP[i] : 0;
    const ebitda = operatingIncome * (1 + daRatio);

    const netMarginConv = operatingIncomeP[i] !== 0 ? netIncomeP[i] / operatingIncomeP[i] : 0;
    const netIncome = operatingIncome * netMarginConv;

    const constrDelta = def.constrInflation - baseDef.constrInflation;
    const capex = capexP[i] * (1 + constrDelta * 0.5);

    const payoutRatio = payoutOverride ? payoutOverride[i] : payoutP[i];
    const dividends = priorNetIncome * payoutRatio;

    const priorBaseCash = i === 0 ? lastHistCash : endingCashP[i - 1];
    const priorBaseNetIncome = i === 0 ? lastHistNetIncome : netIncomeP[i - 1];
    const baseOCF = endingCashP[i] - priorBaseCash + capexP[i] + priorBaseNetIncome * payoutP[i];
    const ocfRatioBase = netIncomeP[i] !== 0 ? baseOCF / netIncomeP[i] : 1;
    const operatingCashFlow = netIncome * ocfRatioBase;

    const endingCash = priorCash + operatingCashFlow - capex - dividends;

    const baseCurrentRatio = currentRatioP[i];
    const baseCash = endingCashP[i];
    const cashDelta = endingCash - baseCash;
    const currentRatio = Math.max(0.5, baseCurrentRatio + cashDelta / (revenue * 0.1 + 1));

    out.revenue.push(revenue);
    out.grossProfit.push(grossProfit);
    out.operatingIncome.push(operatingIncome);
    out.ebitda.push(ebitda);
    out.netIncome.push(netIncome);
    out.capex.push(capex);
    out.dividends.push(dividends);
    out.endingCash.push(endingCash);
    out.currentRatio.push(currentRatio);
    out.grossMargin.push(grossMargin);
    out.ebitdaMargin.push(revenue !== 0 ? ebitda / revenue : 0);
    out.netMargin.push(revenue !== 0 ? netIncome / revenue : 0);

    priorRevenue = revenue;
    priorCash = endingCash;
    priorNetIncome = netIncome;
  }

  return out;
}

/**
 * Discounted cash flow valuation over a computed scenario result.
 * FCF = Net income + D&A (EBITDA - Operating income) - Capex.
 */
export function simpleDCF(
  scenarioResult: ScenarioResult,
  waccBase: number,
  waccPremium: number,
  terminalGrowth: number,
): DcfResult {
  const wacc = waccBase + waccPremium;
  const fcf = scenarioResult.netIncome.map(
    (ni, i) => ni + (scenarioResult.ebitda[i] - scenarioResult.operatingIncome[i]) - scenarioResult.capex[i],
  );
  let pv = 0;
  fcf.forEach((f, i) => {
    pv += f / Math.pow(1 + wacc, i + 1);
  });
  const terminalFcf = fcf[fcf.length - 1] * (1 + terminalGrowth);
  const terminalValue = terminalFcf / (wacc - terminalGrowth);
  const pvTerminal = terminalValue / Math.pow(1 + wacc, fcf.length);
  return { enterpriseValue: pv + pvTerminal, wacc, fcf };
}

/** Convenience: base-case scenario result with no slider overrides applied. */
export function baseScenario(model: FinancialModel): ScenarioResult {
  return computeScenario(model, "base");
}

/** CAGR between the first and last values of a numeric series. */
export function cagr(series: number[]): number {
  if (series.length < 2 || series[0] === 0) return 0;
  const years = series.length - 1;
  return Math.pow(series[series.length - 1] / series[0], 1 / years) - 1;
}

/** Year-over-year delta (fraction) for the latest two points of a series. */
export function latestYoY(series: (number | null)[]): number | null {
  const clean = series.filter((v): v is number => v !== null);
  if (clean.length < 2) return null;
  const prev = clean[clean.length - 2];
  const curr = clean[clean.length - 1];
  if (prev === 0) return null;
  return curr / prev - 1;
}

function average(values: number[]): number | null {
  const clean = values.filter((v) => Number.isFinite(v));
  if (clean.length === 0) return null;
  return clean.reduce((a, b) => a + b, 0) / clean.length;
}

/**
 * Derives Asl Burger's own benchmark row (2026-2030 model average) directly
 * from a computed scenario result, so the industry-comparison sheet always
 * reflects the live model rather than a stale snapshot baked into the
 * workbook. This is what powers the "keep our ratios inside the industry
 * band" comparison the plan is built around.
 */
export function computeModelBenchmark(scenarioResult: ScenarioResult, dividendsOverNetIncome?: number[]) {
  const payout =
    dividendsOverNetIncome ??
    scenarioResult.dividends.map((d, i) => (scenarioResult.netIncome[i] !== 0 ? d / scenarioResult.netIncome[i] : 0));
  return {
    name: "أصل البرجر",
    tag: "متوسط الموديل 2026-2030",
    grossMargin: average(scenarioResult.grossMargin),
    ebitdaMargin: average(scenarioResult.ebitdaMargin),
    netMargin: average(scenarioResult.netMargin),
    currentRatio: average(scenarioResult.currentRatio),
    quickRatio: average(scenarioResult.currentRatio.map((v) => v * 0.86)),
    roe: null,
    payout: average(payout),
  };
}
