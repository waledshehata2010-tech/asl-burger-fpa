"use client";

import { useMemo } from "react";
import { Calculator, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { LineChartPanel } from "@/components/charts/LineChartPanel";
import { KpiCard } from "@/components/kpi/KpiCard";
import { useFinancialModel } from "@/hooks/useFinancialModel";
import { fmtPct, fmtSar, fmtX } from "@/lib/format";
import { computeScenario } from "@/services/dataEngine";
import type { ScenarioKey } from "@/types/financial";

const SCENARIO_ORDER: ScenarioKey[] = ["pessimistic", "base", "optimistic"];

export function ScenarioPlanning() {
  const {
    model,
    scenarioKey,
    overrides,
    scenarioResult,
    dcf,
    setScenarioKey,
    updateOverride,
    resetOverrides,
  } = useFinancialModel();

  const activeDef = model.scenarios[scenarioKey];
  const sameStoreDelta = overrides.sameStoreDelta ?? activeDef.sameStoreDelta;
  const cogsShock = overrides.cogsShock ?? activeDef.cogsShock;
  const waccPremium = overrides.waccPremium ?? activeDef.waccPremium;

  // Base case reference line for comparison, always recomputed with zero overrides.
  const baseReference = useMemo(() => computeScenario(model, "base"), [model]);

  const chartData = scenarioResult.years.map((y, i) => ({
    year: String(y),
    "الإيرادات (السيناريو الحالي)": scenarioResult.revenue[i],
    "الإيرادات (الأساسي)": baseReference.revenue[i],
    "النقدية آخر المدة (الحالي)": scenarioResult.endingCash[i],
  }));

  const lastIdx = scenarioResult.years.length - 1;

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>اختيار السيناريو</CardTitle>
            <CardDescription>السيناريو الأساسي مبني على افتراضات ملف الإكسل تمامًا؛ حرّك المؤشرات لاختبار حساسية النموذج</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={resetOverrides}>
            <RotateCcw className="h-4 w-4" />
            إعادة تعيين
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <Tabs value={scenarioKey} onValueChange={(v) => setScenarioKey(v as ScenarioKey)}>
            <TabsList>
              {SCENARIO_ORDER.map((key) => (
                <TabsTrigger key={key} value={key}>
                  {model.scenarios[key].label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">نمو مبيعات الفروع القائمة</span>
                <span className="tabular font-medium">{sameStoreDelta >= 0 ? "+" : ""}{fmtPct(sameStoreDelta)}</span>
              </div>
              <Slider
                value={[sameStoreDelta]}
                min={-0.1}
                max={0.1}
                step={0.005}
                onValueChange={([v]) => updateOverride("sameStoreDelta", v)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">صدمة تكلفة البضاعة المباعة</span>
                <span className="tabular font-medium">{cogsShock >= 0 ? "+" : ""}{fmtPct(cogsShock)}</span>
              </div>
              <Slider
                value={[cogsShock]}
                min={-0.03}
                max={0.08}
                step={0.005}
                onValueChange={([v]) => updateOverride("cogsShock", v)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">علاوة مخاطر WACC</span>
                <span className="tabular font-medium">{waccPremium >= 0 ? "+" : ""}{fmtPct(waccPremium)}</span>
              </div>
              <Slider
                value={[waccPremium]}
                min={-0.03}
                max={0.05}
                step={0.005}
                onValueChange={([v]) => updateOverride("waccPremium", v)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="الإيرادات 2030" value={fmtSar(scenarioResult.revenue[lastIdx])} icon={Calculator} accent="primary" />
        <KpiCard label="صافي الربح 2030" value={fmtSar(scenarioResult.netIncome[lastIdx])} accent="success" />
        <KpiCard label="النقدية آخر المدة 2030" value={fmtSar(scenarioResult.endingCash[lastIdx])} accent="gold" />
        <KpiCard label="نسبة التداول 2030" value={fmtX(scenarioResult.currentRatio[lastIdx])} accent="warning" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>الإيرادات المتوقعة حسب السيناريو مقابل الأساسي</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChartPanel
              data={chartData}
              xKey="year"
              series={[
                { key: "الإيرادات (السيناريو الحالي)", label: "السيناريو الحالي", color: "#4f8ff7" },
                { key: "الإيرادات (الأساسي)", label: "الأساسي (مرجعي)", color: "#9aa1ae", dashed: true },
              ]}
              height={280}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>تقييم DCF</CardTitle>
            <CardDescription>القيمة المؤسسية بناءً على التدفقات النقدية الحرة للسيناريو الحالي</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div>
              <p className="text-xs text-muted-foreground">القيمة المؤسسية (EV)</p>
              <p className="mt-1 text-2xl font-semibold tabular">{fmtSar(dcf.enterpriseValue)}</p>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm">
              <span className="text-muted-foreground">معدل الخصم WACC</span>
              <span className="tabular font-medium">{fmtPct(dcf.wacc)}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm">
              <span className="text-muted-foreground">التدفق النقدي الحر 2030</span>
              <span className="tabular font-medium">{fmtSar(dcf.fcf[dcf.fcf.length - 1])}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
