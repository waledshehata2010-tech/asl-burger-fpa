"use client";

import { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fpaGridTheme } from "@/components/charts/ag-grid-theme";
import { useFinancialModel } from "@/hooks/useFinancialModel";
import { fmtNum, fmtX } from "@/lib/format";

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

export function FinancialStatements() {
  const { model, scenarioResult } = useFinancialModel();
  const { historical, forecastBase } = model;

  const incomeRows = useMemo(
    () =>
      buildRows(forecastBase.years, [
        { label: "الإيرادات", values: forecastBase.revenue },
        { label: "مجمل الربح", values: forecastBase.grossProfit },
        { label: "الربح التشغيلي", values: forecastBase.operatingIncome },
        { label: "EBITDA", values: forecastBase.ebitda },
        { label: "صافي ربح السنة", values: forecastBase.netIncome },
      ]),
    [forecastBase],
  );

  const balanceRows = useMemo(
    () =>
      buildRows(historical.years, [
        { label: "النقدية وما في حكمها", values: historical.cash },
        { label: "إجمالي الموجودات", values: historical.totalAssets },
        { label: "إجمالي المطلوبات", values: historical.totalLiabilities },
        { label: "إجمالي حقوق الملكية", values: historical.totalEquity },
      ]),
    [historical],
  );

  const cashFlowRows = useMemo(
    () =>
      buildRows(forecastBase.years, [
        { label: "المصروفات الرأسمالية (Capex)", values: forecastBase.capex },
        { label: "رصيد النقدية آخر المدة", values: forecastBase.endingCash },
        { label: "نسبة التداول", values: forecastBase.currentRatio, isRatio: true },
      ]),
    [forecastBase],
  );

  const scenarioRows = useMemo(
    () =>
      buildRows(scenarioResult.years, [
        { label: "الإيرادات (سيناريو حالي)", values: scenarioResult.revenue },
        { label: "صافي ربح السنة", values: scenarioResult.netIncome },
        { label: "التوزيعات", values: scenarioResult.dividends },
        { label: "رصيد النقدية آخر المدة", values: scenarioResult.endingCash },
        { label: "نسبة التداول", values: scenarioResult.currentRatio, isRatio: true },
      ]),
    [scenarioResult],
  );

  const isRatioRow = (row: StatementRow) => row.metric === "نسبة التداول";

  const metricCol: ColDef<StatementRow> = {
    field: "metric",
    headerName: "البند",
    pinned: "right",
    minWidth: 220,
    cellClass: "font-medium",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>القوائم المالية</CardTitle>
        <CardDescription>مبنية مباشرة من ملف الإكسل — أي تحديث في الملف ينعكس هنا تلقائيًا</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="income">
          <TabsList>
            <TabsTrigger value="income">قائمة الدخل</TabsTrigger>
            <TabsTrigger value="balance">المركز المالي</TabsTrigger>
            <TabsTrigger value="cashflow">التدفقات النقدية</TabsTrigger>
            <TabsTrigger value="scenario">حسب السيناريو المختار</TabsTrigger>
          </TabsList>

          <TabsContent value="income">
            <div className="ag-theme-fpa" style={{ height: 280, width: "100%" }}>
              <AgGridReact<StatementRow>
                theme={fpaGridTheme}
                rowData={incomeRows}
                columnDefs={[metricCol, ...yearColumns(forecastBase.years, isRatioRow)]}
                domLayout="normal"
                suppressCellFocus
              />
            </div>
          </TabsContent>

          <TabsContent value="balance">
            <div className="ag-theme-fpa" style={{ height: 240, width: "100%" }}>
              <AgGridReact<StatementRow>
                theme={fpaGridTheme}
                rowData={balanceRows}
                columnDefs={[metricCol, ...yearColumns(historical.years, isRatioRow)]}
                domLayout="normal"
                suppressCellFocus
              />
            </div>
          </TabsContent>

          <TabsContent value="cashflow">
            <div className="ag-theme-fpa" style={{ height: 200, width: "100%" }}>
              <AgGridReact<StatementRow>
                theme={fpaGridTheme}
                rowData={cashFlowRows}
                columnDefs={[metricCol, ...yearColumns(forecastBase.years, isRatioRow)]}
                domLayout="normal"
                suppressCellFocus
              />
            </div>
          </TabsContent>

          <TabsContent value="scenario">
            <div className="ag-theme-fpa" style={{ height: 260, width: "100%" }}>
              <AgGridReact<StatementRow>
                theme={fpaGridTheme}
                rowData={scenarioRows}
                columnDefs={[metricCol, ...yearColumns(scenarioResult.years, isRatioRow)]}
                domLayout="normal"
                suppressCellFocus
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
