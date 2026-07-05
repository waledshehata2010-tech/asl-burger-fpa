"use client";

import { useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fpaGridTheme } from "@/components/charts/ag-grid-theme";
import { useFinancialModel } from "@/hooks/useFinancialModel";
import { fmtNum, fmtX } from "@/lib/format";
import { useT } from "@/lib/i18n";
import { ExportButtons } from "@/components/export/ExportButtons";

interface StatementRow {
  metric: string;
  [year: string]: string | number | null;
}

function buildRows(
  years: (number | string)[],
  metrics: { label: string; values: (number | null)[]; isRatio?: boolean }[],
): StatementRow[] {
  return metrics.map((m) => {
    const row: StatementRow = { metric: m.label };
    years.forEach((y, i) => {
      row[String(y)] = m.values[i] ?? null;
    });
    return row;
  });
}

function yearColumns(years: (number | string)[], isRatioMetric: (row: StatementRow) => boolean): ColDef<StatementRow>[] {
  return years.map((y) => ({
    field: String(y),
    headerName: String(y),
    flex: 1,
    minWidth: 110,
    valueFormatter: (p) => {
      const v = p.value as number | null;
      if (v === null || v === undefined) return "—";
      return isRatioMetric(p.data as StatementRow) ? fmtX(v) : fmtNum(v, { compact: true });
    },
    cellClass: "tabular text-right",
  }));
}

type TabKey = "income" | "balance" | "cashflow" | "scenario";

export function FinancialStatements() {
  const { model, scenarioResult } = useFinancialModel();
  const { t, locale } = useT();
  const { historical, forecastBase } = model;
  const [activeTab, setActiveTab] = useState<TabKey>("income");
  const isRtl = locale === "ar";

  const incomeRows = useMemo(
    () =>
      buildRows(forecastBase.years, [
        { label: t("lineRevenue"), values: forecastBase.revenue },
        { label: t("lineGrossProfit"), values: forecastBase.grossProfit },
        { label: t("lineOperatingIncome"), values: forecastBase.operatingIncome },
        { label: t("lineEbitda"), values: forecastBase.ebitda },
        { label: t("lineNetIncome"), values: forecastBase.netIncome },
      ]),
    [forecastBase, t],
  );

  const balanceRows = useMemo(
    () =>
      buildRows(historical.years, [
        { label: t("lineCash"), values: historical.cash },
        { label: t("lineTotalAssets"), values: historical.totalAssets },
        { label: t("lineTotalLiabilities"), values: historical.totalLiabilities },
        { label: t("lineTotalEquity"), values: historical.totalEquity },
      ]),
    [historical, t],
  );

  const cashFlowRows = useMemo(
    () =>
      buildRows(forecastBase.years, [
        { label: t("lineCapex"), values: forecastBase.capex },
        { label: t("lineEndingCash"), values: forecastBase.endingCash },
        { label: t("lineCurrentRatioScenario"), values: forecastBase.currentRatio, isRatio: true },
      ]),
    [forecastBase, t],
  );

  const scenarioRows = useMemo(
    () =>
      buildRows(scenarioResult.years, [
        { label: t("lineRevenueScenario"), values: scenarioResult.revenue },
        { label: t("lineNetIncome"), values: scenarioResult.netIncome },
        { label: t("lineDividends"), values: scenarioResult.dividends },
        { label: t("lineEndingCash"), values: scenarioResult.endingCash },
        { label: t("lineCurrentRatioScenario"), values: scenarioResult.currentRatio, isRatio: true },
      ]),
    [scenarioResult, t],
  );

  const ratioLabels = new Set([t("lineCurrentRatioScenario")]);
  const isRatioRow = (row: StatementRow) => ratioLabels.has(row.metric);

  const metricCol: ColDef<StatementRow> = {
    field: "metric",
    headerName: t("colMetric"),
    pinned: isRtl ? "right" : "left",
    minWidth: 220,
    cellClass: "font-medium",
  };

  const tabsData: Record<TabKey, { rows: StatementRow[]; years: (number | string)[]; label: string; height: number }> = {
    income: { rows: incomeRows, years: forecastBase.years, label: t("tabIncome"), height: 280 },
    balance: { rows: balanceRows, years: historical.years, label: t("tabBalance"), height: 240 },
    cashflow: { rows: cashFlowRows, years: forecastBase.years, label: t("tabCashflow"), height: 200 },
    scenario: { rows: scenarioRows, years: scenarioResult.years, label: t("tabScenario"), height: 260 },
  };

  const current = tabsData[activeTab];

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle>{t("statementsTitle")}</CardTitle>
          <CardDescription>{t("statementsDesc")}</CardDescription>
        </div>
        <ExportButtons rows={current.rows} sheetName={current.label} fileName={`asl-burger-${activeTab}`} />
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabKey)}>
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="income">{t("tabIncome")}</TabsTrigger>
            <TabsTrigger value="balance">{t("tabBalance")}</TabsTrigger>
            <TabsTrigger value="cashflow">{t("tabCashflow")}</TabsTrigger>
            <TabsTrigger value="scenario">{t("tabScenario")}</TabsTrigger>
          </TabsList>

          {(Object.keys(tabsData) as TabKey[]).map((key) => (
            <TabsContent key={key} value={key}>
              <div className="ag-theme-fpa overflow-x-auto" style={{ height: tabsData[key].height, width: "100%" }}>
                <AgGridReact<StatementRow>
                  theme={fpaGridTheme}
                  enableRtl={isRtl}
                  rowData={tabsData[key].rows}
                  columnDefs={[metricCol, ...yearColumns(tabsData[key].years, isRatioRow)]}
                  domLayout="normal"
                  suppressCellFocus
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
