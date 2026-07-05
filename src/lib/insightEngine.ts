/**
 * Insight Engine
 * ---------------------------------------------------------------------------
 * Deterministic, rule-based narrative + alerting layer on top of the Data
 * Engine's numeric output. Nothing here changes a single financial number —
 * it only *reads* `scenarioResult` / `dcf` / `model` (already computed by
 * dataEngine.ts) and turns them into board-readable language: executive
 * summaries, a financial health score, ranked risks/opportunities, KPI
 * status/variance/explanations, and smart alert rules.
 *
 * There is no external AI/LLM call here — "AI Executive Summary" is a
 * templated narrative generator over live model output, which keeps it fast,
 * free, deterministic, and reproducible for an audited financial model.
 * Thresholds below are explicit management assumptions (documented inline),
 * not sourced from the workbook, since the workbook has no formal budget/
 * target sheet beyond the industry-benchmark comparison.
 */
import type { BenchmarkCompany, DcfResult, FinancialModel, ScenarioResult } from "@/types/financial";
import { cagr } from "@/services/dataEngine";

export type Locale = "ar" | "en";
export type Severity = "critical" | "warning" | "info" | "good";
export type KpiStatus = "good" | "warning" | "critical";

export function L(locale: Locale, ar: string, en: string): string {
  return locale === "ar" ? ar : en;
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

function avg(values: number[]): number {
  const clean = values.filter((v) => Number.isFinite(v));
  if (clean.length === 0) return 0;
  return clean.reduce((a, b) => a + b, 0) / clean.length;
}

function lastHistorical(model: FinancialModel, key: keyof FinancialModel["historical"]): number {
  const series = model.historical[key] as (number | null)[];
  for (let i = series.length - 1; i >= 0; i--) {
    if (series[i] !== null) return series[i] as number;
  }
  return 0;
}

// Liquidity band used consistently across the platform (matches the note
// already shown on Executive Overview): 1.1x-1.5x is the industry-normal
// current-ratio range for this QSR peer set.
export const CURRENT_RATIO_BAND: [number, number] = [1.1, 1.5];
// Management assumption: a healthy multi-year top-line CAGR target for a
// growing QSR chain in this market. Used only to color-code the growth KPI.
const REVENUE_CAGR_TARGET = 0.08;

/* ------------------------------------------------------------------------ */
/* Financial Health Score                                                    */
/* ------------------------------------------------------------------------ */

export interface HealthScoreDriver {
  label: string;
  score: number; // 0-100
  weight: number; // 0-1
}

export interface HealthScoreResult {
  score: number; // 0-100
  band: "excellent" | "good" | "fair" | "weak";
  bandLabel: string;
  drivers: HealthScoreDriver[];
}

export function computeHealthScore(
  model: FinancialModel,
  scenarioResult: ScenarioResult,
  dcf: DcfResult,
  benchmarkCompanies: Record<string, BenchmarkCompany>,
  locale: Locale,
): HealthScoreResult {
  const industry = benchmarkCompanies.industry;
  const lastHistRevenue = lastHistorical(model, "revenue");

  // 1) Profitability — net margin vs. industry average.
  const netMarginAvg = avg(scenarioResult.netMargin);
  const industryNetMargin = industry?.netMargin ?? 0.05;
  const profitabilityScore = clamp(50 + (netMarginAvg - industryNetMargin) * 500, 0, 100);

  // 2) Liquidity — current ratio inside the 1.1x-1.5x industry band scores
  //    highest; too low (default risk) or far too high (idle cash) both
  //    pull the score down, mirroring standard treasury guidance.
  const crAvg = avg(scenarioResult.currentRatio);
  const liquidityScore =
    crAvg < 1.0 ? 20 :
    crAvg < CURRENT_RATIO_BAND[0] ? 60 :
    crAvg <= CURRENT_RATIO_BAND[1] ? 100 :
    clamp(100 - (crAvg - CURRENT_RATIO_BAND[1]) * 25, 45, 100);

  // 3) Growth — revenue CAGR from last actual through the forecast horizon.
  const revCagr = cagr([lastHistRevenue, ...scenarioResult.revenue]);
  const growthScore = clamp(50 + (revCagr - REVENUE_CAGR_TARGET) * 300, 0, 100);

  // 4) Cash trajectory — is ending cash growing or shrinking across the plan?
  const cashCagrSeries = scenarioResult.endingCash;
  const cashTrendScore = cashCagrSeries[cashCagrSeries.length - 1] >= cashCagrSeries[0] ? 85 : 35;

  // 5) Valuation confidence — DCF stays sane (positive EV, WACC comfortably
  //    above terminal growth) rather than sitting on the mathematical floor.
  const valuationScore = dcf.enterpriseValue > 0 ? (dcf.wacc > 0.09 ? 90 : 70) : 20;

  const drivers: HealthScoreDriver[] = [
    { label: L(locale, "الربحية مقابل الصناعة", "Profitability vs. industry"), score: profitabilityScore, weight: 0.3 },
    { label: L(locale, "السيولة (نسبة التداول)", "Liquidity (current ratio)"), score: liquidityScore, weight: 0.25 },
    { label: L(locale, "نمو الإيرادات", "Revenue growth"), score: growthScore, weight: 0.2 },
    { label: L(locale, "اتجاه النقدية", "Cash trajectory"), score: cashTrendScore, weight: 0.15 },
    { label: L(locale, "ثقة التقييم", "Valuation confidence"), score: valuationScore, weight: 0.1 },
  ];

  const weighted = drivers.reduce((sum, d) => sum + d.score * d.weight, 0);
  const score = Math.round(clamp(weighted, 0, 100));
  const band = score >= 85 ? "excellent" : score >= 70 ? "good" : score >= 50 ? "fair" : "weak";
  const bandLabel = L(
    locale,
    band === "excellent" ? "ممتاز" : band === "good" ? "جيد" : band === "fair" ? "مقبول" : "ضعيف",
    band === "excellent" ? "Excellent" : band === "good" ? "Good" : band === "fair" ? "Fair" : "Weak",
  );

  return { score, band, bandLabel, drivers };
}

/* ------------------------------------------------------------------------ */
/* Executive narratives                                                      */
/* ------------------------------------------------------------------------ */

export interface ExecutiveContext {
  model: FinancialModel;
  scenarioResult: ScenarioResult;
  dcf: DcfResult;
  benchmarkCompanies: Record<string, BenchmarkCompany>;
  health: HealthScoreResult;
  fmtSar: (v: number) => string;
  fmtPct: (v: number) => string;
  fmtX: (v: number) => string;
  lastForecastYear: number;
}

export function generateCeoSummary(ctx: ExecutiveContext, locale: Locale): string {
  const { model, scenarioResult, health, fmtSar, fmtPct, lastForecastYear } = ctx;
  const lastActualRevenue = lastHistorical(model, "revenue");
  const revCagr = cagr([lastActualRevenue, ...scenarioResult.revenue]);
  const revenueEnd = scenarioResult.revenue[scenarioResult.revenue.length - 1];
  const netMarginEnd = scenarioResult.netMargin[scenarioResult.netMargin.length - 1];

  return L(
    locale,
    `تتجه أصل البرجر نحو إيرادات ${fmtSar(revenueEnd)} بحلول ${lastForecastYear}، بمعدل نمو سنوي مركب ${fmtPct(revCagr)}، وهامش صافي ربح ${fmtPct(netMarginEnd)} في السنة الأخيرة من الخطة. المؤشر العام لصحة الشركة المالية ${health.score}/100 (${health.bandLabel})، ما يعكس نموذج أعمال قادر على التوسع مع الحفاظ على انضباط السيولة والربحية.`,
    `Asl Burger is on track for ${fmtSar(revenueEnd)} in revenue by ${lastForecastYear}, a ${fmtPct(revCagr)} compound annual growth rate, and a ${fmtPct(netMarginEnd)} net margin in the final plan year. The platform's overall Financial Health Score is ${health.score}/100 (${health.bandLabel}), reflecting a business model that can keep scaling while holding liquidity and profitability discipline.`,
  );
}

export function generateCfoSummary(ctx: ExecutiveContext, locale: Locale): string {
  const { scenarioResult, dcf, benchmarkCompanies, fmtSar, fmtPct, fmtX, lastForecastYear } = ctx;
  const crEnd = scenarioResult.currentRatio[scenarioResult.currentRatio.length - 1];
  const grossMarginEnd = scenarioResult.grossMargin[scenarioResult.grossMargin.length - 1];
  const industryGm = benchmarkCompanies.industry?.grossMargin ?? null;
  const cashEnd = scenarioResult.endingCash[scenarioResult.endingCash.length - 1];

  const gmComparison =
    industryGm !== null
      ? L(
          locale,
          `مقابل متوسط الصناعة ${fmtPct(industryGm)}`,
          `versus the ${fmtPct(industryGm)} industry average`,
        )
      : "";

  return L(
    locale,
    `النقدية المتوقعة بنهاية ${lastForecastYear} تبلغ ${fmtSar(cashEnd)}، ونسبة التداول ${fmtX(crEnd)} (نطاق الصناعة ${CURRENT_RATIO_BAND[0]}x–${CURRENT_RATIO_BAND[1]}x). هامش الربح الإجمالي ${fmtPct(grossMarginEnd)} ${gmComparison}. القيمة المؤسسية المقدرة بأسلوب التدفقات النقدية المخصومة ${fmtSar(dcf.enterpriseValue)} بمعدل خصم مرجح ${fmtPct(dcf.wacc)}.`,
    `Projected ending cash for ${lastForecastYear} is ${fmtSar(cashEnd)}, with a current ratio of ${fmtX(crEnd)} (industry band ${CURRENT_RATIO_BAND[0]}x-${CURRENT_RATIO_BAND[1]}x). Gross margin runs at ${fmtPct(grossMarginEnd)} ${gmComparison}. The DCF-derived enterprise value is ${fmtSar(dcf.enterpriseValue)} at a ${fmtPct(dcf.wacc)} WACC.`,
  );
}

export function generateAiExecutiveSummary(ctx: ExecutiveContext, locale: Locale): string {
  const ceo = generateCeoSummary(ctx, locale);
  const cfo = generateCfoSummary(ctx, locale);
  const risks = getTopRisks(ctx, locale);
  const opportunities = getTopOpportunities(ctx, locale);

  const riskLine =
    risks.length > 0
      ? L(locale, `أبرز نقطة تستدعي المتابعة: ${risks[0].title}.`, `Top watch item: ${risks[0].title}.`)
      : L(locale, "لا توجد مخاطر جوهرية مكتشفة في الوضع الحالي.", "No material risks detected in the current plan.");

  const oppLine =
    opportunities.length > 0
      ? L(locale, `أبرز فرصة قابلة للتنفيذ: ${opportunities[0].title}.`, `Top actionable opportunity: ${opportunities[0].title}.`)
      : "";

  return [ceo, cfo, riskLine, oppLine].filter(Boolean).join(" ");
}

/* ------------------------------------------------------------------------ */
/* Risks & Opportunities                                                     */
/* ------------------------------------------------------------------------ */

export interface RiskOrOpportunity {
  id: string;
  title: string;
  detail: string;
  severity: Severity;
}

export function getTopRisks(ctx: ExecutiveContext, locale: Locale): RiskOrOpportunity[] {
  const { scenarioResult, benchmarkCompanies, fmtPct, fmtX } = ctx;
  const out: RiskOrOpportunity[] = [];
  const crAvg = avg(scenarioResult.currentRatio);
  const industry = benchmarkCompanies.industry;

  if (crAvg < CURRENT_RATIO_BAND[0]) {
    out.push({
      id: "liquidity-low",
      title: L(locale, "سيولة أقل من نطاق الصناعة", "Liquidity below industry band"),
      detail: L(
        locale,
        `متوسط نسبة التداول المتوقعة ${fmtX(crAvg)} أقل من الحد الأدنى للصناعة ${CURRENT_RATIO_BAND[0]}x.`,
        `Average projected current ratio of ${fmtX(crAvg)} sits below the industry floor of ${CURRENT_RATIO_BAND[0]}x.`,
      ),
      severity: crAvg < 1.0 ? "critical" : "warning",
    });
  }

  const gmStart = scenarioResult.grossMargin[0];
  const gmEnd = scenarioResult.grossMargin[scenarioResult.grossMargin.length - 1];
  if (gmEnd < gmStart - 0.01) {
    out.push({
      id: "margin-compression",
      title: L(locale, "انضغاط في هامش الربح الإجمالي", "Gross margin compression"),
      detail: L(
        locale,
        `هامش الربح الإجمالي ينخفض من ${fmtPct(gmStart)} إلى ${fmtPct(gmEnd)} خلال فترة الخطة.`,
        `Gross margin declines from ${fmtPct(gmStart)} to ${fmtPct(gmEnd)} across the plan horizon.`,
      ),
      severity: gmStart - gmEnd > 0.03 ? "critical" : "warning",
    });
  }

  const netMarginAvg = avg(scenarioResult.netMargin);
  if (industry && industry.netMargin !== null && netMarginAvg < industry.netMargin) {
    const industryNetMargin = industry.netMargin;
    out.push({
      id: "net-margin-trails",
      title: L(locale, "هامش صافي الربح أقل من الصناعة", "Net margin trails industry"),
      detail: L(
        locale,
        `متوسط هامش صافي الربح ${fmtPct(netMarginAvg)} مقابل ${fmtPct(industryNetMargin)} لمتوسط الصناعة.`,
        `Average net margin of ${fmtPct(netMarginAvg)} versus the ${fmtPct(industryNetMargin)} industry average.`,
      ),
      severity: "warning",
    });
  }

  const ebitdaStart = scenarioResult.ebitda[0];
  const ebitdaEnd = scenarioResult.ebitda[scenarioResult.ebitda.length - 1];
  for (let i = 1; i < scenarioResult.ebitda.length; i++) {
    if (scenarioResult.ebitda[i] < scenarioResult.ebitda[i - 1]) {
      out.push({
        id: "ebitda-dip",
        title: L(locale, "تراجع مؤقت في الأرباح قبل الفوائد والضرائب والإهلاك", "Temporary EBITDA dip"),
        detail: L(
          locale,
          `الأرباح قبل الفوائد والضرائب والإهلاك تنخفض في السنة ${scenarioResult.years[i]} مقارنة بالسنة السابقة قبل استئناف النمو.`,
          `EBITDA dips in ${scenarioResult.years[i]} versus the prior year before growth resumes.`,
        ),
        severity: "warning",
      });
      break;
    }
  }
  void ebitdaStart; void ebitdaEnd;

  return out.sort((a, b) => severityRank(b.severity) - severityRank(a.severity)).slice(0, 3);
}

export function getTopOpportunities(ctx: ExecutiveContext, locale: Locale): RiskOrOpportunity[] {
  const { scenarioResult, benchmarkCompanies, fmtPct, fmtX } = ctx;
  const out: RiskOrOpportunity[] = [];
  const crAvg = avg(scenarioResult.currentRatio);
  const industry = benchmarkCompanies.industry;

  if (crAvg > CURRENT_RATIO_BAND[1]) {
    out.push({
      id: "excess-liquidity",
      title: L(locale, "سيولة فائضة قابلة للتوظيف", "Deployable excess liquidity"),
      detail: L(
        locale,
        `نسبة التداول ${fmtX(crAvg)} أعلى من نطاق الصناعة — فرصة لرفع التوزيعات، تسريع التوسع، أو إعادة شراء أسهم.`,
        `Current ratio of ${fmtX(crAvg)} sits above the industry band — room to raise payouts, accelerate expansion, or buy back shares.`,
      ),
      severity: "good",
    });
  }

  if (industry && industry.grossMargin !== null && avg(scenarioResult.grossMargin) > industry.grossMargin) {
    const industryGrossMargin = industry.grossMargin;
    out.push({
      id: "gross-margin-premium",
      title: L(locale, "هامش ربح إجمالي أعلى من الصناعة", "Gross margin premium vs. industry"),
      detail: L(
        locale,
        `هامش الربح الإجمالي ${fmtPct(avg(scenarioResult.grossMargin))} أعلى من متوسط الصناعة ${fmtPct(industryGrossMargin)}.`,
        `Gross margin of ${fmtPct(avg(scenarioResult.grossMargin))} beats the ${fmtPct(industryGrossMargin)} industry average.`,
      ),
      severity: "good",
    });
  }

  const ebitdaMarginStart = scenarioResult.ebitdaMargin[0];
  const ebitdaMarginEnd = scenarioResult.ebitdaMargin[scenarioResult.ebitdaMargin.length - 1];
  if (ebitdaMarginEnd > ebitdaMarginStart) {
    out.push({
      id: "ebitda-margin-expansion",
      title: L(locale, "توسع في هامش الأرباح التشغيلية", "Expanding EBITDA margin"),
      detail: L(
        locale,
        `هامش EBITDA يتحسن من ${fmtPct(ebitdaMarginStart)} إلى ${fmtPct(ebitdaMarginEnd)} مع نضج التوسع التشغيلي.`,
        `EBITDA margin improves from ${fmtPct(ebitdaMarginStart)} to ${fmtPct(ebitdaMarginEnd)} as operating leverage kicks in.`,
      ),
      severity: "good",
    });
  }

  const lastRevenue = scenarioResult.revenue[0];
  const firstRevenue = scenarioResult.revenue[scenarioResult.revenue.length - 1];
  void lastRevenue; void firstRevenue;

  return out.slice(0, 3);
}

function severityRank(s: Severity): number {
  return s === "critical" ? 3 : s === "warning" ? 2 : s === "info" ? 1 : 0;
}

/* ------------------------------------------------------------------------ */
/* Today's Key Insights                                                       */
/* ------------------------------------------------------------------------ */

export function getTodayInsights(ctx: ExecutiveContext, locale: Locale): string[] {
  const { model, scenarioResult, dcf, benchmarkCompanies, fmtSar, fmtPct, fmtX, lastForecastYear } = ctx;
  const lastActualRevenue = lastHistorical(model, "revenue");
  const revCagr = cagr([lastActualRevenue, ...scenarioResult.revenue]);
  const crEnd = scenarioResult.currentRatio[scenarioResult.currentRatio.length - 1];
  const industry = benchmarkCompanies.industry;
  const ebitdaMarginEnd = scenarioResult.ebitdaMargin[scenarioResult.ebitdaMargin.length - 1];

  const crStatus =
    crEnd < CURRENT_RATIO_BAND[0]
      ? L(locale, "أقل من نطاق الصناعة", "below the industry band")
      : crEnd > CURRENT_RATIO_BAND[1]
        ? L(locale, "أعلى من نطاق الصناعة", "above the industry band")
        : L(locale, "ضمن نطاق الصناعة", "within the industry band");

  return [
    L(
      locale,
      `الإيرادات تنمو بمعدل سنوي مركب ${fmtPct(revCagr)} حتى ${lastForecastYear}.`,
      `Revenue is compounding at ${fmtPct(revCagr)} annually through ${lastForecastYear}.`,
    ),
    L(
      locale,
      `نسبة التداول المتوقعة ${fmtX(crEnd)} — ${crStatus} (${CURRENT_RATIO_BAND[0]}x–${CURRENT_RATIO_BAND[1]}x).`,
      `Projected current ratio of ${fmtX(crEnd)} is ${crStatus} (${CURRENT_RATIO_BAND[0]}x-${CURRENT_RATIO_BAND[1]}x).`,
    ),
    industry
      ? L(
          locale,
          `هامش EBITDA ${fmtPct(ebitdaMarginEnd)} مقابل ${fmtPct(industry.ebitdaMargin ?? 0)} لمتوسط الصناعة.`,
          `EBITDA margin of ${fmtPct(ebitdaMarginEnd)} versus the ${fmtPct(industry.ebitdaMargin ?? 0)} industry average.`,
        )
      : L(locale, `هامش EBITDA للسنة الأخيرة ${fmtPct(ebitdaMarginEnd)}.`, `Final-year EBITDA margin of ${fmtPct(ebitdaMarginEnd)}.`),
    L(
      locale,
      `القيمة المؤسسية المقدرة ${fmtSar(dcf.enterpriseValue)} بمعدل خصم ${fmtPct(dcf.wacc)}.`,
      `Estimated enterprise value of ${fmtSar(dcf.enterpriseValue)} at a ${fmtPct(dcf.wacc)} discount rate.`,
    ),
  ];
}

/* ------------------------------------------------------------------------ */
/* Smart Alerts                                                              */
/* ------------------------------------------------------------------------ */

export interface SmartAlert {
  id: string;
  severity: Severity;
  title: string;
  message: string;
}

export function getSmartAlerts(
  model: FinancialModel,
  scenarioResult: ScenarioResult,
  dcf: DcfResult,
  baseDcf: DcfResult,
  locale: Locale,
  fmtSar: (v: number) => string,
  fmtPct: (v: number) => string,
  fmtX: (v: number) => string,
): SmartAlert[] {
  const alerts: SmartAlert[] = [];

  // 1) Cash becomes low.
  const minCash = Math.min(...scenarioResult.endingCash);
  if (minCash <= 0) {
    alerts.push({
      id: "cash-low",
      severity: "critical",
      title: L(locale, "النقدية منخفضة", "Cash runs low"),
      message: L(
        locale,
        `النقدية المتوقعة تصل إلى ${fmtSar(minCash)} في إحدى سنوات الخطة — يلزم إجراء فوري.`,
        `Projected cash reaches ${fmtSar(minCash)} in at least one plan year — immediate action required.`,
      ),
    });
  } else {
    let decliningStreak = 0;
    for (let i = 1; i < scenarioResult.endingCash.length; i++) {
      if (scenarioResult.endingCash[i] < scenarioResult.endingCash[i - 1]) decliningStreak++;
      else decliningStreak = 0;
      if (decliningStreak >= 2) {
        alerts.push({
          id: "cash-declining",
          severity: "warning",
          title: L(locale, "النقدية في تراجع متتالٍ", "Cash declining for two+ years"),
          message: L(
            locale,
            `النقدية تنخفض لعامين متتاليين حتى ${scenarioResult.years[i]} — راقب التدفقات التشغيلية وخطة التوزيعات.`,
            `Cash has declined for two consecutive years through ${scenarioResult.years[i]} — watch operating cash flow and the payout plan.`,
          ),
        });
        break;
      }
    }
  }

  // 2) EBITDA decreases.
  for (let i = 1; i < scenarioResult.ebitda.length; i++) {
    if (scenarioResult.ebitda[i] < scenarioResult.ebitda[i - 1]) {
      alerts.push({
        id: "ebitda-decrease",
        severity: "warning",
        title: L(locale, "انخفاض في EBITDA", "EBITDA decreases"),
        message: L(
          locale,
          `EBITDA تنخفض في ${scenarioResult.years[i]} مقارنة بـ ${scenarioResult.years[i - 1]}.`,
          `EBITDA falls in ${scenarioResult.years[i]} versus ${scenarioResult.years[i - 1]}.`,
        ),
      });
      break;
    }
  }

  // 3) Gross margin drops.
  for (let i = 1; i < scenarioResult.grossMargin.length; i++) {
    const drop = scenarioResult.grossMargin[i - 1] - scenarioResult.grossMargin[i];
    if (drop > 0.005) {
      alerts.push({
        id: "gross-margin-drop",
        severity: drop > 0.02 ? "critical" : "warning",
        title: L(locale, "انخفاض هامش الربح الإجمالي", "Gross margin drops"),
        message: L(
          locale,
          `هامش الربح الإجمالي ينخفض ${fmtPct(drop)} في ${scenarioResult.years[i]}.`,
          `Gross margin drops ${fmtPct(drop)} in ${scenarioResult.years[i]}.`,
        ),
      });
      break;
    }
  }

  // 4) Revenue misses "budget" — the workbook's own original forecast for
  //    the overlapping historical years (2024/2025) stands in for budget,
  //    since there is no separate budget sheet in the source model.
  const fb = model.forecastBase;
  model.historical.years.forEach((year, i) => {
    const actual = model.historical.revenue[i];
    if (actual === null) return;
    const fbIdx = fb.years.indexOf(year);
    if (fbIdx < 0) return;
    const budget = fb.revenue[fbIdx];
    if (!budget) return;
    const variance = (actual - budget) / budget;
    if (variance < -0.03) {
      alerts.push({
        id: `revenue-miss-${year}`,
        severity: variance < -0.08 ? "critical" : "warning",
        title: L(locale, "الإيرادات الفعلية أقل من الموازنة", "Revenue misses budget"),
        message: L(
          locale,
          `إيرادات ${year} الفعلية ${fmtSar(actual)} أقل من الموازنة ${fmtSar(budget)} بنسبة ${fmtPct(Math.abs(variance))}.`,
          `${year} actual revenue of ${fmtSar(actual)} missed budget of ${fmtSar(budget)} by ${fmtPct(Math.abs(variance))}.`,
        ),
      });
    }
  });

  // 5) Current ratio falls below threshold.
  scenarioResult.currentRatio.forEach((cr, i) => {
    if (cr < CURRENT_RATIO_BAND[0]) {
      alerts.push({
        id: `current-ratio-low-${scenarioResult.years[i]}`,
        severity: cr < 1.0 ? "critical" : "warning",
        title: L(locale, "نسبة التداول أقل من الحد الأدنى", "Current ratio below threshold"),
        message: L(
          locale,
          `نسبة التداول ${fmtX(cr)} في ${scenarioResult.years[i]} أقل من الحد الأدنى للصناعة ${CURRENT_RATIO_BAND[0]}x.`,
          `Current ratio of ${fmtX(cr)} in ${scenarioResult.years[i]} is below the ${CURRENT_RATIO_BAND[0]}x industry floor.`,
        ),
      });
    }
  });

  // 6) DCF changes significantly vs. the base-case valuation.
  const dcfDelta = baseDcf.enterpriseValue !== 0 ? (dcf.enterpriseValue - baseDcf.enterpriseValue) / baseDcf.enterpriseValue : 0;
  if (Math.abs(dcfDelta) > 0.15) {
    alerts.push({
      id: "dcf-swing",
      severity: "info",
      title: L(locale, "تغير جوهري في التقييم", "DCF valuation swings significantly"),
      message: L(
        locale,
        `القيمة المؤسسية للسيناريو الحالي ${fmtSar(dcf.enterpriseValue)} تختلف ${fmtPct(Math.abs(dcfDelta))} عن السيناريو الأساسي ${fmtSar(baseDcf.enterpriseValue)}.`,
        `Current-scenario enterprise value of ${fmtSar(dcf.enterpriseValue)} differs ${fmtPct(Math.abs(dcfDelta))} from the base-case ${fmtSar(baseDcf.enterpriseValue)}.`,
      ),
    });
  }

  return alerts.sort((a, b) => severityRank(b.severity) - severityRank(a.severity));
}

/* ------------------------------------------------------------------------ */
/* Per-KPI intelligence: trend, target, variance, status, explanation        */
/* ------------------------------------------------------------------------ */

export interface KpiIntel {
  trend: "up" | "down" | "flat";
  variance: number | null;
  status: KpiStatus;
  explanation: string;
  targetLabel: string | null;
}

export function evaluateKpi(params: {
  current: number;
  previous?: number | null;
  target?: number | null;
  higherIsBetter?: boolean;
  locale: Locale;
  name: string;
  fmt: (v: number) => string;
}): KpiIntel {
  const { current, previous, target, higherIsBetter = true, locale, name, fmt } = params;

  let trend: KpiIntel["trend"] = "flat";
  if (previous !== undefined && previous !== null && Number.isFinite(previous)) {
    if (current > previous * 1.001) trend = "up";
    else if (current < previous * 0.999) trend = "down";
  }

  let variance: number | null = null;
  let status: KpiStatus = "good";
  let targetLabel: string | null = null;

  if (target !== undefined && target !== null && target !== 0 && Number.isFinite(target)) {
    variance = (current - target) / Math.abs(target);
    const adverse = higherIsBetter ? variance < 0 : variance > 0;
    const magnitude = Math.abs(variance);
    status = !adverse ? "good" : magnitude > 0.15 ? "critical" : magnitude > 0.05 ? "warning" : "good";
    targetLabel = fmt(target);
  } else {
    status = trend === "down" && higherIsBetter ? "warning" : trend === "up" && !higherIsBetter ? "warning" : "good";
  }

  const trendWord = L(
    locale,
    trend === "up" ? "في ارتفاع" : trend === "down" ? "في انخفاض" : "مستقر",
    trend === "up" ? "trending up" : trend === "down" ? "trending down" : "holding steady",
  );
  const statusWord = L(
    locale,
    status === "good" ? "ضمن المتوقع" : status === "warning" ? "يستدعي المتابعة" : "يستدعي إجراءً عاجلاً",
    status === "good" ? "on track" : status === "warning" ? "worth watching" : "needs urgent attention",
  );
  const varianceText =
    variance !== null
      ? L(
          locale,
          ` بفارق ${fmt(Math.abs(current - (target ?? 0)))} عن الهدف`,
          ` with a variance of ${fmt(Math.abs(current - (target ?? 0)))} versus target`,
        )
      : "";

  const explanation = L(
    locale,
    `${name} ${trendWord}${varianceText} — ${statusWord}.`,
    `${name} is ${trendWord}${varianceText} — ${statusWord}.`,
  );

  return { trend, variance, status, explanation, targetLabel };
}
