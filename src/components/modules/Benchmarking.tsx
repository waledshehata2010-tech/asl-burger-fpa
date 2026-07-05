"use client";

import { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fpaGridTheme } from "@/components/charts/ag-grid-theme";
import { useFinancialModel } from "@/hooks/useFinancialModel";
import { fmtMetric } from "@/lib/format";
import type { BenchmarkCompany } from "@/types/financial";

interface BenchmarkRow {
  metric: string;
  fmt: "pct" | "x";
  [company: string]: string | number | null;
}

// Burgerizzr first, per the explicit comparison ordering requirement, then
// Asl Burger's own model average, then the remaining listed peers, with the
// sector average last as the reference band.
const COMPANY_ORDER: { key: string; label: string }[] = [
  { key: "burgerizzr", label: "برجريزر" },
  { key: "aslBurger", label: "أصل البرجر" },
  { key: "herfy", label: "هرفي" },
  { key: "americana", label: "أمريكانا" },
  { key: "industry", label: "متوسط الصناعة" },
];

export function Benchmarking() {
  const { benchmarkMetrics, benchmarkCompanies } = useFinancialModel();

  const rows: BenchmarkRow[] = useMemo(
    () =>
      benchmarkMetrics.map((m) => {
        const row: BenchmarkRow = { metric: m.label, fmt: m.fmt };
        for (const c of COMPANY_ORDER) {
          const company = benchmarkCompanies[c.key] as BenchmarkCompany | undefined;
          row[c.key] = company ? (company[m.key] as number | null) : null;
        }
        return row;
      }),
    [benchmarkMetrics, benchmarkCompanies],
  );

  const columnDefs: ColDef<BenchmarkRow>[] = [
    { field: "metric", headerName: "المؤشر", pinned: "right", minWidth: 200, cellClass: "font-medium" },
    ...COMPANY_ORDER.map(
      (c): ColDef<BenchmarkRow> => ({
        field: c.key,
        headerName: c.label,
        flex: 1,
        minWidth: 130,
        cellClass: c.key === "aslBurger" ? "font-semibold" : undefined,
        cellStyle: c.key === "aslBurger" ? { background: "rgba(79,143,247,0.12)" } : undefined,
        valueFormatter: (p) => fmtMetric(p.value as number | null, (p.data?.fmt ?? "pct") as "pct" | "x"),
      }),
    ),
  ];

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>معايير الصناعة — المقارنة التنافسية</CardTitle>
            <CardDescription>برجريزر أولاً حسب الترتيب المطلوب، وعمود أصل البرجر مظلل للمقارنة المباشرة</CardDescription>
          </div>
          <Badge variant="secondary">مصدر: Argaam · Investing.com · تقارير الشركات</Badge>
        </CardHeader>
        <CardContent>
          <div className="ag-theme-fpa" style={{ height: 340, width: "100%" }}>
            <AgGridReact<BenchmarkRow>
              theme={fpaGridTheme}
              rowData={rows}
              columnDefs={columnDefs}
              domLayout="normal"
              suppressCellFocus
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
