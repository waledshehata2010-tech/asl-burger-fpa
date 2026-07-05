"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fmtNum } from "@/lib/format";

export interface BarSeries {
  key: string;
  label: string;
  color: string;
}

interface BarChartPanelProps {
  data: Record<string, number | string | null>[];
  xKey: string;
  series: BarSeries[];
  height?: number;
  stacked?: boolean;
  valueFormatter?: (v: number) => string;
}

export function BarChartPanel({ data, xKey, series, height = 260, stacked, valueFormatter }: BarChartPanelProps) {
  const fmt = valueFormatter ?? ((v: number) => fmtNum(v, { compact: true }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`bar-fill-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={1} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0.55} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey={xKey} stroke="#9aa1ae" fontSize={12} tickLine={false} axisLine={{ stroke: "rgba(255,255,255,0.08)" }} />
        <YAxis stroke="#9aa1ae" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => fmt(Number(v))} width={56} />
        <Tooltip
          contentStyle={{
            background: "#171b24",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            fontSize: 12,
            boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
            padding: "8px 12px",
          }}
          labelStyle={{ color: "#9aa1ae", marginBottom: 4 }}
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
          formatter={(v: unknown) => fmt(Number(v as number))}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: "#9aa1ae", paddingTop: 8 }} iconType="circle" iconSize={8} />
        {series.map((s) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.label}
            fill={`url(#bar-fill-${s.key})`}
            radius={[5, 5, 0, 0]}
            stackId={stacked ? "stack" : undefined}
            animationDuration={700}
            animationEasing="ease-out"
            maxBarSize={48}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
