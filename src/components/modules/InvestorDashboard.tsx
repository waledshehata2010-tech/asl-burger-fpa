"use client";

import { useMemo } from "react";
import { BarChart3, Percent, TrendingUp, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/kpi/KpiCard";
import { LineChartPanel } from "@/components/charts/LineChartPanel";
import { PdfExportButton } from "@/components/export/PdfExportButton";
import { useFinancialModel } from "@/hooks/useFinancialModel";
import { fmtPct, fmtSar, fmtX } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { cagr } from "@/services/dataEngine";
import { generateCeoSummary, computeHealthScore, type ExecutiveContext } from "@/lib/insightEngine";

export function InvestorDashboard() {
  const { model, scenarioResult, dcf, benchmarkCompanies } = useFinancialModel();
  const { t, locale } = useT();
  const { historical } = model;

  const lastActualIdx = historical.years.length - 1;
  const lastActualRevenue = historical.revenue[lastActualIdx] ?? 0;
  const lastForecastYear = scenarioResult.years[scenarioResult.years.length - 1];
  const revenueCagr = cagr([lastActualRevenue, ...scenarioResult.revenue]);
  const ebitdaMarginEnd = scenarioResult.ebitdaMargin[scenarioResult.ebitdaMargin.length - 1];
  const currentRatioEnd = scenarioResult.currentRatio[scenarioResult.currentRatio.length - 1];

  const health = useMemo(
    () => computeHealthScore(model, scenarioResult, dcf, benchmarkCompanies, locale),
    [model, scenarioResult, dcf, benchmarkCompanies, locale],
  );
  const ctx: ExecutiveContext = useMemo(
    () => ({ model, scenarioResult, dcf, benchmarkCompanies, health, fmtSar, fmtPct, fmtX, lastForecastYear }),
    [model, scenarioResult, dcf, benchmarkCompanies, health, lastForecastYear],
  );
  const growthStory = useMemo(() => generateCeoSummary(ctx, locale), [ctx, locale]);

  const revenueLabel = t("legendRevenueForecast");
  const chartData = [
    ...historical.years.map((y, i) => ({ year: String(y), [revenueLabel]: historical.revenue[i] })),
    ...scenarioResult.years.map((y, i) => ({ year: String(y), [revenueLabel]: scenarioResult.revenue[i] })),
  ];

  return (
    <div className="flex flex-col gap-5 print-page">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{t("appName")} — {t("investorTitle")}</h2>
          <p className="text-sm text-muted-foreground">{t("investorDesc")}</p>
        </div>
        <PdfExportButton />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label={t("kpiNameRevenueCagr")} value={fmtPct(revenueCagr)} icon={TrendingUp} accent="primary" />
        <KpiCard label={t("kpiNameEbitdaMargin")} value={fmtPct(ebitdaMarginEnd)} icon={Percent} accent="gold" />
        <KpiCard label={t("kpiNameDcfEv")} value={fmtSar(dcf.enterpriseValue)} icon={BarChart3} accent="success" />
        <KpiCard label={t("kpiNameCurrentRatio")} value={fmtX(currentRatioEnd)} icon={Wallet} accent="primary" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("investorGrowthStory")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-foreground/90">{growthStory}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("investorRevenueChartTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChartPanel data={chartData} xKey="year" series={[{ key: revenueLabel, label: revenueLabel, color: "#fbb617" }]} height={280} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("investorValuationSummary")}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-muted/20 px-3 py-2.5 text-sm">
            <p className="text-xs text-muted-foreground">{t("dcfEv")}</p>
            <p className="mt-1 text-lg font-semibold tabular">{fmtSar(dcf.enterpriseValue)}</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 px-3 py-2.5 text-sm">
            <p className="text-xs text-muted-foreground">{t("dcfWacc")}</p>
            <p className="mt-1 text-lg font-semibold tabular">{fmtPct(dcf.wacc)}</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 px-3 py-2.5 text-sm">
            <p className="text-xs text-muted-foreground">{t("healthScoreTitle")}</p>
            <p className="mt-1 text-lg font-semibold tabular">{health.score}/100 · {health.bandLabel}</p>
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">{t("investorDisclaimer")}</p>
    </div>
  );
}
