"use client";

import { useMemo } from "react";
import {
  Banknote,
  Lightbulb,
  PiggyBank,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { KpiCard } from "@/components/kpi/KpiCard";
import { KpiIntelCard } from "@/components/kpi/KpiIntelCard";
import { HealthScoreGauge } from "@/components/kpi/HealthScoreGauge";
import { AlertsPanel } from "@/components/alerts/AlertsPanel";
import { LineChartPanel } from "@/components/charts/LineChartPanel";
import { BarChartPanel } from "@/components/charts/BarChartPanel";
import { PdfExportButton } from "@/components/export/PdfExportButton";
import { useFinancialModel } from "@/hooks/useFinancialModel";
import { useUiStore } from "@/store/uiStore";
import { fmtPct, fmtSar, fmtX } from "@/lib/format";
import { cagr, computeScenario, latestYoY, simpleDCF } from "@/services/dataEngine";
import { useT } from "@/lib/i18n";
import {
  computeHealthScore,
  evaluateKpi,
  generateAiExecutiveSummary,
  generateCeoSummary,
  generateCfoSummary,
  getSmartAlerts,
  getTodayInsights,
  getTopOpportunities,
  getTopRisks,
  type ExecutiveContext,
} from "@/lib/insightEngine";

const WACC_BASE = 0.12;
const TERMINAL_GROWTH = 0.03;

export function ExecutiveOverview() {
  const { model, scenarioResult, dcf, benchmarkCompanies, scenarioKey, overrides } = useFinancialModel();
  const { historical } = model;
  const { t, locale } = useT();
  const goToStatement = useUiStore((s) => s.goToStatement);

  const lastActualIdx = historical.years.length - 1;
  const lastActualRevenue = historical.revenue[lastActualIdx] ?? 0;
  const lastActualCash = historical.cash[lastActualIdx] ?? 0;
  const lastActualNetIncome = historical.netIncome[lastActualIdx] ?? 0;

  const revenueYoY = latestYoY(historical.revenue);
  const netIncomeYoY = latestYoY(historical.netIncome);

  const revenue2030 = scenarioResult.revenue[scenarioResult.revenue.length - 1];
  const cash2030 = scenarioResult.endingCash[scenarioResult.endingCash.length - 1];
  const currentRatio2030 = scenarioResult.currentRatio[scenarioResult.currentRatio.length - 1];
  const revenueCagr = cagr([lastActualRevenue, ...scenarioResult.revenue]);
  const lastForecastYear = scenarioResult.years[scenarioResult.years.length - 1];

  const industryBand: [number, number] = [1.1, 1.5];

  // Base-case scenario/DCF, recomputed independently of the currently
  // selected scenario, purely as a stable reference point for "how far are
  // we from base case" alerts and KPI targets. Does not affect the numbers
  // shown anywhere else on the page.
  const baseScenarioResult = useMemo(() => computeScenario(model, "base"), [model]);
  const baseDcf = useMemo(() => {
    const def = model.scenarios.base;
    return simpleDCF(baseScenarioResult, WACC_BASE, def.waccPremium, TERMINAL_GROWTH);
  }, [baseScenarioResult, model]);

  const health = useMemo(
    () => computeHealthScore(model, scenarioResult, dcf, benchmarkCompanies, locale),
    [model, scenarioResult, dcf, benchmarkCompanies, locale],
  );

  const ctx: ExecutiveContext = useMemo(
    () => ({ model, scenarioResult, dcf, benchmarkCompanies, health, fmtSar, fmtPct, fmtX, lastForecastYear }),
    [model, scenarioResult, dcf, benchmarkCompanies, health, lastForecastYear],
  );

  const ceoSummary = useMemo(() => generateCeoSummary(ctx, locale), [ctx, locale]);
  const cfoSummary = useMemo(() => generateCfoSummary(ctx, locale), [ctx, locale]);
  const aiSummary = useMemo(() => generateAiExecutiveSummary(ctx, locale), [ctx, locale]);
  const insights = useMemo(() => getTodayInsights(ctx, locale), [ctx, locale]);
  const risks = useMemo(() => getTopRisks(ctx, locale), [ctx, locale]);
  const opportunities = useMemo(() => getTopOpportunities(ctx, locale), [ctx, locale]);
  const alerts = useMemo(
    () => getSmartAlerts(model, scenarioResult, dcf, baseDcf, locale, fmtSar, fmtPct, fmtX),
    [model, scenarioResult, dcf, baseDcf, locale],
  );

  // KPI Intelligence — targets come from the industry benchmark row where
  // available, or the base-case scenario for anything scenario/override
  // dependent (so switching scenarios shows a real variance vs. plan).
  const industry = benchmarkCompanies.industry;
  const grossMarginAvg = scenarioResult.grossMargin.reduce((a, b) => a + b, 0) / scenarioResult.grossMargin.length;
  const ebitdaMarginAvg = scenarioResult.ebitdaMargin.reduce((a, b) => a + b, 0) / scenarioResult.ebitdaMargin.length;
  const netMarginAvg = scenarioResult.netMargin.reduce((a, b) => a + b, 0) / scenarioResult.netMargin.length;
  const baseGrossMarginAvg = baseScenarioResult.grossMargin.reduce((a, b) => a + b, 0) / baseScenarioResult.grossMargin.length;
  const baseEbitdaMarginAvg = baseScenarioResult.ebitdaMargin.reduce((a, b) => a + b, 0) / baseScenarioResult.ebitdaMargin.length;
  const baseNetMarginAvg = baseScenarioResult.netMargin.reduce((a, b) => a + b, 0) / baseScenarioResult.netMargin.length;
  const baseCurrentRatioAvg = baseScenarioResult.currentRatio.reduce((a, b) => a + b, 0) / baseScenarioResult.currentRatio.length;
  const isBaseScenario = scenarioKey === "base" && Object.keys(overrides).length === 0;

  const kpiIntelItems = [
    {
      key: "grossMargin",
      label: t("kpiNameGrossMargin"),
      value: fmtPct(scenarioResult.grossMargin[scenarioResult.grossMargin.length - 1]),
      intel: evaluateKpi({
        current: grossMarginAvg,
        previous: baseGrossMarginAvg,
        target: industry?.grossMargin ?? (isBaseScenario ? null : baseGrossMarginAvg),
        higherIsBetter: true,
        locale,
        name: t("kpiNameGrossMargin"),
        fmt: fmtPct,
      }),
      tab: "income" as const,
    },
    {
      key: "ebitdaMargin",
      label: t("kpiNameEbitdaMargin"),
      value: fmtPct(scenarioResult.ebitdaMargin[scenarioResult.ebitdaMargin.length - 1]),
      intel: evaluateKpi({
        current: ebitdaMarginAvg,
        previous: baseEbitdaMarginAvg,
        target: industry?.ebitdaMargin ?? (isBaseScenario ? null : baseEbitdaMarginAvg),
        higherIsBetter: true,
        locale,
        name: t("kpiNameEbitdaMargin"),
        fmt: fmtPct,
      }),
      tab: "income" as const,
    },
    {
      key: "netMargin",
      label: t("kpiNameNetMargin"),
      value: fmtPct(scenarioResult.netMargin[scenarioResult.netMargin.length - 1]),
      intel: evaluateKpi({
        current: netMarginAvg,
        previous: baseNetMarginAvg,
        target: industry?.netMargin ?? (isBaseScenario ? null : baseNetMarginAvg),
        higherIsBetter: true,
        locale,
        name: t("kpiNameNetMargin"),
        fmt: fmtPct,
      }),
      tab: "income" as const,
    },
    {
      key: "currentRatio",
      label: t("kpiNameCurrentRatio"),
      value: fmtX(currentRatio2030),
      intel: evaluateKpi({
        current: currentRatio2030,
        previous: baseCurrentRatioAvg,
        target: (industryBand[0] + industryBand[1]) / 2,
        higherIsBetter: true,
        locale,
        name: t("kpiNameCurrentRatio"),
        fmt: fmtX,
      }),
      tab: "cashflow" as const,
    },
    {
      key: "revenueCagr",
      label: t("kpiNameRevenueCagr"),
      value: fmtPct(revenueCagr),
      intel: evaluateKpi({
        current: revenueCagr,
        previous: null,
        target: 0.08,
        higherIsBetter: true,
        locale,
        name: t("kpiNameRevenueCagr"),
        fmt: fmtPct,
      }),
      tab: "income" as const,
    },
    {
      key: "dcfEv",
      label: t("kpiNameDcfEv"),
      value: fmtSar(dcf.enterpriseValue),
      intel: evaluateKpi({
        current: dcf.enterpriseValue,
        previous: baseDcf.enterpriseValue,
        target: isBaseScenario ? null : baseDcf.enterpriseValue,
        higherIsBetter: true,
        locale,
        name: t("kpiNameDcfEv"),
        fmt: fmtSar,
      }),
      tab: "scenario" as const,
    },
  ];

  const revenueActualLabel = t("legendRevenueActual");
  const revenueForecastLabel = t("legendRevenueForecast");
  const netIncomeActualLabel = t("legendNetIncomeActual");
  const netIncomeForecastLabel = t("legendNetIncomeForecast");

  const chartData = [
    ...historical.years.map((y, i) => ({
      year: String(y),
      [revenueActualLabel]: historical.revenue[i],
      [netIncomeActualLabel]: historical.netIncome[i],
    })),
    ...scenarioResult.years.map((y, i) => ({
      year: String(y),
      [revenueForecastLabel]: scenarioResult.revenue[i],
      [netIncomeForecastLabel]: scenarioResult.netIncome[i],
    })),
  ];

  const grossMarginLabel = t("metricGrossMargin");
  const ebitdaMarginLabel = t("metricEbitdaMargin");
  const netMarginLabel = t("metricNetMargin");

  const marginData = scenarioResult.years.map((y, i) => ({
    year: String(y),
    [grossMarginLabel]: scenarioResult.grossMargin[i],
    [ebitdaMarginLabel]: scenarioResult.ebitdaMargin[i],
    [netMarginLabel]: scenarioResult.netMargin[i],
  }));

  return (
    <div className="flex flex-col gap-5 print-page">
      <div className="flex items-center justify-end">
        <PdfExportButton />
      </div>

      {alerts.length > 0 && <AlertsPanel alerts={alerts} />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label={t("kpiLastActualRevenue")}
          value={fmtSar(lastActualRevenue)}
          delta={revenueYoY}
          sparkline={historical.revenue.filter((v): v is number => v !== null)}
          icon={TrendingUp}
          accent="primary"
          onDrilldown={() => goToStatement("income")}
        />
        <KpiCard
          label={t("kpiLastActualNetIncome")}
          value={fmtSar(lastActualNetIncome)}
          delta={netIncomeYoY}
          sparkline={historical.netIncome.filter((v): v is number => v !== null)}
          icon={Banknote}
          accent="success"
          onDrilldown={() => goToStatement("income")}
        />
        <KpiCard
          label={`${t("kpiRevenue2030").replace("2030", String(lastForecastYear))}`}
          value={fmtSar(revenue2030)}
          delta={revenueCagr}
          sparkline={scenarioResult.revenue}
          icon={PiggyBank}
          accent="gold"
          onDrilldown={() => goToStatement("scenario")}
        />
        <KpiCard
          label={`${t("kpiCash2030").replace("2030", String(lastForecastYear))}`}
          value={fmtSar(cash2030)}
          delta={(cash2030 - lastActualCash) / (lastActualCash || 1)}
          sparkline={scenarioResult.endingCash}
          icon={Wallet}
          accent="primary"
          onDrilldown={() => goToStatement("cashflow")}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>{t("healthScoreTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <HealthScoreGauge health={health} />
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
            <div>
              <CardTitle>{t("aiExecSummaryTitle")}</CardTitle>
              <CardDescription>{t("aiExecSummaryBadge")}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-foreground/90">{aiSummary}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("ceoSummaryTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">{ceoSummary}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("cfoSummaryTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">{cfoSummary}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Lightbulb className="h-4 w-4 text-gold" aria-hidden="true" />
          <CardTitle>{t("todayInsightsTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {insights.map((insight, i) => (
              <li key={i} className="flex items-start gap-2 rounded-lg border border-border bg-muted/20 px-3 py-2.5 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                {insight}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-danger" aria-hidden="true" />
            <CardTitle>{t("topRisksTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5">
            {risks.length === 0 && <p className="text-sm text-muted-foreground">{t("noRisksFound")}</p>}
            {risks.map((r) => (
              <div key={r.id} className="rounded-lg border border-danger/25 bg-danger/5 px-3 py-2.5 text-sm">
                <p className="font-medium text-danger">{r.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{r.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <TrendingUp className="h-4 w-4 text-success" aria-hidden="true" />
            <CardTitle>{t("topOpportunitiesTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2.5">
            {opportunities.length === 0 && <p className="text-sm text-muted-foreground">{t("noOpportunitiesFound")}</p>}
            {opportunities.map((o) => (
              <div key={o.id} className="rounded-lg border border-success/25 bg-success/5 px-3 py-2.5 text-sm">
                <p className="font-medium text-success">{o.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{o.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold tracking-tight">{t("kpiIntelTitle")}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {kpiIntelItems.map((item) => (
            <KpiIntelCard
              key={item.key}
              label={item.label}
              value={item.value}
              intel={item.intel}
              onDrilldown={() => goToStatement(item.tab)}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>{t("chartRevenueNetIncomeTitle")}</CardTitle>
            <CardDescription>{t("chartRevenueNetIncomeDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <LineChartPanel
              data={chartData}
              xKey="year"
              series={[
                { key: revenueActualLabel, label: revenueActualLabel, color: "#fbb617" },
                { key: revenueForecastLabel, label: revenueForecastLabel, color: "#fbb617", dashed: true },
                { key: netIncomeActualLabel, label: netIncomeActualLabel, color: "#34c77b" },
                { key: netIncomeForecastLabel, label: netIncomeForecastLabel, color: "#34c77b", dashed: true },
              ]}
              height={300}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("benchmarkSummaryTitle")}</CardTitle>
            <CardDescription>{t("benchmarkSummaryDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {(["grossMargin", "netMargin", "currentRatio"] as const).map((key) => {
              const aslBurger = benchmarkCompanies.aslBurger[key];
              const industryVal = benchmarkCompanies.industry[key];
              const fmt = key === "currentRatio" ? fmtX : fmtPct;
              const labelKey = key === "grossMargin" ? "metricGrossMargin" : key === "netMargin" ? "metricNetMargin" : "metricCurrentRatio";
              return (
                <div key={key} className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm">
                  <span className="text-muted-foreground">{t(labelKey)}</span>
                  <span className="tabular font-medium">
                    {fmt(aslBurger)} <span className="text-muted-foreground">{t("vsLabel")} {fmt(industryVal)}</span>
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("marginsEvolutionTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChartPanel
            data={marginData}
            xKey="year"
            series={[
              { key: grossMarginLabel, label: grossMarginLabel, color: "#fbb617" },
              { key: ebitdaMarginLabel, label: ebitdaMarginLabel, color: "#e5e5e3" },
              { key: netMarginLabel, label: netMarginLabel, color: "#34c77b" },
            ]}
            valueFormatter={(v) => fmtPct(v)}
            height={280}
          />
        </CardContent>
      </Card>
    </div>
  );
}
