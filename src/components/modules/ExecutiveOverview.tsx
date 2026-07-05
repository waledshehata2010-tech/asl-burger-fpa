"use client";

import { AlertTriangle, Banknote, PiggyBank, TrendingUp, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { KpiCard } from "@/components/kpi/KpiCard";
import { LineChartPanel } from "@/components/charts/LineChartPanel";
import { BarChartPanel } from "@/components/charts/BarChartPanel";
import { useFinancialModel } from "@/hooks/useFinancialModel";
import { fmtPct, fmtSar, fmtX } from "@/lib/format";
import { cagr, latestYoY } from "@/services/dataEngine";
import { useT } from "@/lib/i18n";

export function ExecutiveOverview() {
  const { model, scenarioResult, benchmarkCompanies } = useFinancialModel();
  const { historical } = model;
  const { t } = useT();

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
  const exceedsBand = currentRatio2030 > industryBand[1];

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
    <div className="flex flex-col gap-5">
      {exceedsBand && (
        <Card className="border-warning/30 bg-warning/5" role="status">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
            <div className="text-sm">
              <p className="font-medium text-warning">
                {t("currentRatioExceeds")} {lastForecastYear} ({fmtX(currentRatio2030)}) {t("aboveIndustryBand")} ({industryBand[0]}x–{industryBand[1]}x)
              </p>
              <p className="mt-1 text-muted-foreground">{t("boardNote")}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label={t("kpiLastActualRevenue")}
          value={fmtSar(lastActualRevenue)}
          delta={revenueYoY}
          sparkline={historical.revenue.filter((v): v is number => v !== null)}
          icon={TrendingUp}
          accent="primary"
        />
        <KpiCard
          label={t("kpiLastActualNetIncome")}
          value={fmtSar(lastActualNetIncome)}
          delta={netIncomeYoY}
          sparkline={historical.netIncome.filter((v): v is number => v !== null)}
          icon={Banknote}
          accent="success"
        />
        <KpiCard
          label={`${t("kpiRevenue2030").replace("2030", String(lastForecastYear))}`}
          value={fmtSar(revenue2030)}
          delta={revenueCagr}
          sparkline={scenarioResult.revenue}
          icon={PiggyBank}
          accent="gold"
        />
        <KpiCard
          label={`${t("kpiCash2030").replace("2030", String(lastForecastYear))}`}
          value={fmtSar(cash2030)}
          delta={(cash2030 - lastActualCash) / (lastActualCash || 1)}
          sparkline={scenarioResult.endingCash}
          icon={Wallet}
          accent={exceedsBand ? "warning" : "primary"}
        />
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
                { key: revenueActualLabel, label: revenueActualLabel, color: "#4f8ff7" },
                { key: revenueForecastLabel, label: revenueForecastLabel, color: "#4f8ff7", dashed: true },
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
              const industry = benchmarkCompanies.industry[key];
              const fmt = key === "currentRatio" ? fmtX : fmtPct;
              const labelKey = key === "grossMargin" ? "metricGrossMargin" : key === "netMargin" ? "metricNetMargin" : "metricCurrentRatio";
              return (
                <div key={key} className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm">
                  <span className="text-muted-foreground">{t(labelKey)}</span>
                  <span className="tabular font-medium">
                    {fmt(aslBurger)} <span className="text-muted-foreground">{t("vsLabel")} {fmt(industry)}</span>
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
              { key: grossMarginLabel, label: grossMarginLabel, color: "#4f8ff7" },
              { key: ebitdaMarginLabel, label: ebitdaMarginLabel, color: "#e8b64c" },
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
