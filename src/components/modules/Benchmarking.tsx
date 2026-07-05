"use client";

import { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fpaGridTheme } from "@/components/charts/ag-grid-theme";
import { useFinancialModel } from "@/hooks/useFinancialModel";
import { fmtMetric } from "@/lib/format";
import { useT, type DictKey } from "@/lib/i18n";
import { ExportButtons } from "@/components/export/ExportButtons";
import type { BenchmarkCompany } from "@/types/financial";

interface BenchmarkRow {
  metric: string;
  fmt: "pct" | "x";
  [company: string]: string | number | null;
}

// Burgerizzr first, per the explicit comparison ordering requirement, then
// Asl Burger's own model average, then the remaining listed peers, with the
// sector average last as the reference band.
const COMPANY_ORDER: { key: string; labelKey: DictKey }[] = [
  { key: "burgerizzr", labelKey: "benchCompanyBurgerizzr" },
  { key: "aslBurger", labelKey: "benchCompanyAslBurger" },
  { key: "herfy", labelKey: "benchCompanyHerfy" },
  { key: "americana", labelKey: "benchCompanyAmericana" },
  { key: "industry", labelKey: "benchCompanyIndustry" },
];

export function Benchmarking() {
  const { benchmarkMetrics, benchmarkCompanies } = useFinancialModel();
  const { t, locale } = useT();
  const isRtl = locale === "ar";

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

  const exportRows = useMemo(
    () =>
      rows.map((row) => {
        const flat: Record<string, unknown> = { [t("colIndicator")]: row.metric };
        for (const c of COMPANY_ORDER) {
          flat[t(c.labelKey)] = fmtMetric(row[c.key] as number | null, row.fmt);
        }
        return flat;
      }),
    [rows, t],
  );

  const columnDefs: ColDef<BenchmarkRow>[] = [
    { field: "metric", headerName: t("colIndicator"), pinned: isRtl ? "right" : "left", minWidth: 200, cellClass: "font-medium" },
    ...COMPANY_ORDER.map(
      (c): ColDef<BenchmarkRow> => ({
        field: c.key,
        headerName: t(c.labelKey),
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
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>{t("benchmarkTitle")}</CardTitle>
            <CardDescription>{t("benchmarkDesc")}</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="hidden sm:inline-flex">
              {t("benchmarkSource")}
            </Badge>
            <ExportButtons rows={exportRows} sheetName={t("benchmarkTitle")} fileName="asl-burger-benchmarks" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="ag-theme-fpa overflow-x-auto" style={{ height: 340, width: "100%" }}>
            <AgGridReact<BenchmarkRow>
              theme={fpaGridTheme}
              enableRtl={isRtl}
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
