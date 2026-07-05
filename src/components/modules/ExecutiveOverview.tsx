"use client";

import { AlertTriangle, Banknote, PiggyBank, TrendingUp, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { KpiCard } from "@/components/kpi/KpiCard";
import { LineChartPanel } from "@/components/charts/LineChartPanel";
import { BarChartPanel } from "@/components/charts/BarChartPanel";
import { useFinancialModel } from "@/hooks/useFinancialModel";
import { fmtPct, fmtSar, fmtX } from "@/lib/format";
import { cagr, latestYoY } from "@/services/dataEngine";

export function ExecutiveOverview() {
  const { model, scenarioResult, benchmarkCompanies } = useFinancialModel();
  const { historical } = model;

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

  const industryBand: [number, number] = [1.1, 1.5];
  const exceedsBand = currentRatio2030 > industryBand[1];

  const chartData = [
    ...historical.years.map((y, i) => ({
      year: String(y),
      "الإيرادات (فعلي)": historical.revenue[i],
      "صافي الربح (فعلي)": historical.netIncome[i],
    })),
    ...scenarioResult.years.map((y, i) => ({
      year: String(y),
      "الإيرادات (متوقع)": scenarioResult.revenue[i],
      "صافي الربح (متوقع)": scenarioResult.netIncome[i],
    })),
  ];

  const marginData = scenarioResult.years.map((y, i) => ({
    year: String(y),
    "هامش إجمالي الربح": scenarioResult.grossMargin[i],
    "هامش EBITDA": scenarioResult.ebitdaMargin[i],
    "هامش صافي الربح": scenarioResult.netMargin[i],
  }));

  return (
    <div className="flex flex-col gap-5">
      {exceedsBand && (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="flex items-start gap-3 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
            <div className="text-sm">
              <p className="font-medium text-warning">نسبة التداول المتوقعة في 2030 ({fmtX(currentRatio2030)}) أعلى من نطاق الصناعة ({industryBand[0]}x–{industryBand[1]}x)</p>
              <p className="mt-1 text-muted-foreground">
                هذا يعكس تراكم نقدية فائضة عن حاجة التشغيل. خيارات مطروحة على مستوى مجلس الإدارة: رفع نسبة التوزيع، تسريع خطة التوسع، توزيعات استثنائية، أو تكوين احتياطي استراتيجي.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="إيرادات آخر سنة فعلية"
          value={fmtSar(lastActualRevenue)}
          delta={revenueYoY}
          sparkline={historical.revenue.filter((v): v is number => v !== null)}
          icon={TrendingUp}
          accent="primary"
        />
        <KpiCard
          label="صافي الربح آخر سنة فعلية"
          value={fmtSar(lastActualNetIncome)}
          delta={netIncomeYoY}
          sparkline={historical.netIncome.filter((v): v is number => v !== null)}
          icon={Banknote}
          accent="success"
        />
        <KpiCard
          label="الإيرادات المتوقعة 2030"
          value={fmtSar(revenue2030)}
          delta={revenueCagr}
          sparkline={scenarioResult.revenue}
          icon={PiggyBank}
          accent="gold"
        />
        <KpiCard
          label="النقدية آخر المدة 2030"
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
            <CardTitle>الإيرادات وصافي الربح — فعلي ومتوقع (2018–2030)</CardTitle>
            <CardDescription>خط متصل يمثل الفعلي، والفاصل يمثل السيناريو الأساسي المتوقع</CardDescription>
          </CardHeader>
          <CardContent>
            <LineChartPanel
              data={chartData}
              xKey="year"
              series={[
                { key: "الإيرادات (فعلي)", label: "الإيرادات (فعلي)", color: "#4f8ff7" },
                { key: "الإيرادات (متوقع)", label: "الإيرادات (متوقع)", color: "#4f8ff7", dashed: true },
                { key: "صافي الربح (فعلي)", label: "صافي الربح (فعلي)", color: "#34c77b" },
                { key: "صافي الربح (متوقع)", label: "صافي الربح (متوقع)", color: "#34c77b", dashed: true },
              ]}
              height={300}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>موجز المقارنة مع الصناعة</CardTitle>
            <CardDescription>متوسط الموديل 2026–2030 مقابل متوسط الصناعة</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {(["grossMargin", "netMargin", "currentRatio"] as const).map((key) => {
              const aslBurger = benchmarkCompanies.aslBurger[key];
              const industry = benchmarkCompanies.industry[key];
              const fmt = key === "currentRatio" ? fmtX : fmtPct;
              return (
                <div key={key} className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm">
                  <span className="text-muted-foreground">
                    {key === "grossMargin" ? "هامش إجمالي الربح" : key === "netMargin" ? "هامش صافي الربح" : "نسبة التداول"}
                  </span>
                  <span className="tabular font-medium">
                    {fmt(aslBurger)} <span className="text-muted-foreground">مقابل {fmt(industry)}</span>
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>تطور الهوامش خلال فترة التوقع</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChartPanel
            data={marginData}
            xKey="year"
            series={[
              { key: "هامش إجمالي الربح", label: "هامش إجمالي الربح", color: "#4f8ff7" },
              { key: "هامش EBITDA", label: "هامش EBITDA", color: "#e8b64c" },
              { key: "هامش صافي الربح", label: "هامش صافي الربح", color: "#34c77b" },
            ]}
            valueFormatter={(v) => fmtPct(v)}
            height={280}
          />
        </CardContent>
      </Card>
    </div>
  );
}
