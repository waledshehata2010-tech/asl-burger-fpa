"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HealthScoreGauge } from "@/components/kpi/HealthScoreGauge";
import { LineChartPanel } from "@/components/charts/LineChartPanel";
import { PdfExportButton } from "@/components/export/PdfExportButton";
import { useFinancialModel } from "@/hooks/useFinancialModel";
import { fmtPct, fmtSar, fmtX } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { computeHealthScore, generateAiExecutiveSummary, getTopOpportunities, getTopRisks, type ExecutiveContext } from "@/lib/insightEngine";

export function BoardDashboard() {
  const { model, scenarioResult, dcf, benchmarkCompanies } = useFinancialModel();
  const { t, locale } = useT();
  const { historical } = model;

  const lastForecastYear = scenarioResult.years[scenarioResult.years.length - 1];
  const lastActualIdx = historical.years.length - 1;

  const health = useMemo(
    () => computeHealthScore(model, scenarioResult, dcf, benchmarkCompanies, locale),
    [model, scenarioResult, dcf, benchmarkCompanies, locale],
  );

  const ctx: ExecutiveContext = useMemo(
    () => ({ model, scenarioResult, dcf, benchmarkCompanies, health, fmtSar, fmtPct, fmtX, lastForecastYear }),
    [model, scenarioResult, dcf, benchmarkCompanies, health, lastForecastYear],
  );

  const summary = useMemo(() => generateAiExecutiveSummary(ctx, locale), [ctx, locale]);
  const risks = useMemo(() => getTopRisks(ctx, locale), [ctx, locale]);
  const opportunities = useMemo(() => getTopOpportunities(ctx, locale), [ctx, locale]);

  const revenueLabel = t("legendRevenueForecast");
  const netIncomeLabel = t("legendNetIncomeForecast");
  const chartData = scenarioResult.years.map((y, i) => ({
    year: String(y),
    [revenueLabel]: scenarioResult.revenue[i],
    [netIncomeLabel]: scenarioResult.netIncome[i],
  }));

  const metricRows: { label: string; values: string[] }[] = [
    { label: t("lineRevenue"), values: scenarioResult.revenue.map((v) => fmtSar(v)) },
    { label: t("lineEbitda"), values: scenarioResult.ebitda.map((v) => fmtSar(v)) },
    { label: t("lineNetIncome"), values: scenarioResult.netIncome.map((v) => fmtSar(v)) },
    { label: t("lineEndingCash"), values: scenarioResult.endingCash.map((v) => fmtSar(v)) },
    { label: t("lineCurrentRatioScenario"), values: scenarioResult.currentRatio.map((v) => fmtX(v)) },
  ];

  const generatedOn = new Date().toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col gap-5 print-page">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{t("appName")} — {t("boardTitle")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("boardPreparedFor")} · {t("boardGeneratedOn")}: {generatedOn}
          </p>
        </div>
        <PdfExportButton />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>{t("healthScoreTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <HealthScoreGauge health={health} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("aiExecSummaryTitle")}</CardTitle>
            <CardDescription>{t("aiExecSummaryBadge")}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-foreground/90">{summary}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("boardKeyMetrics")}</CardTitle>
          <CardDescription>{`${historical.years[lastActualIdx]} – ${lastForecastYear}`}</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-start text-xs text-muted-foreground">
                <th className="py-2 pe-4 text-start font-medium">{t("colMetric")}</th>
                {scenarioResult.years.map((y) => (
                  <th key={y} className="py-2 px-3 text-end font-medium tabular">{y}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metricRows.map((row) => (
                <tr key={row.label} className="border-b border-border/60">
                  <td className="py-2 pe-4 font-medium">{row.label}</td>
                  {row.values.map((v, i) => (
                    <td key={i} className="py-2 px-3 text-end tabular">{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("chartRevenueNetIncomeTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChartPanel
            data={chartData}
            xKey="year"
            series={[
              { key: revenueLabel, label: revenueLabel, color: "#fbb617" },
              { key: netIncomeLabel, label: netIncomeLabel, color: "#34c77b" },
            ]}
            height={260}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("topRisksTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {risks.length === 0 && <p className="text-sm text-muted-foreground">{t("noRisksFound")}</p>}
            {risks.map((r) => (
              <div key={r.id} className="rounded-lg border border-border px-3 py-2 text-sm">
                <p className="font-medium">{r.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{r.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("topOpportunitiesTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {opportunities.length === 0 && <p className="text-sm text-muted-foreground">{t("noOpportunitiesFound")}</p>}
            {opportunities.map((o) => (
              <div key={o.id} className="rounded-lg border border-border px-3 py-2 text-sm">
                <p className="font-medium">{o.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{o.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <p className="text-center text-xs text-muted-foreground">{t("boardFooterNote")}</p>
    </div>
  );
}
