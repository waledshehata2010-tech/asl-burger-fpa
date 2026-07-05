"use client";

import { Area, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fmtNum } from "@/lib/format";

export interface LineSeries {
  key: string;
  label: string;
  color: string;
  dashed?: boolean;
}

interface LineChartPanelProps {
  data: Record<string, number | string | null>[];
  xKey: string;
  series: LineSeries[];
  height?: number;
  valueFormatter?: (v: number) => string;
}

/** Solid ("actual") series render as a gradient-filled Area for an
 *  enterprise-dashboard look; dashed ("forecast") series stay as plain
 *  lines so the actual-vs-forecast visual language stays intact. */
export function LineChartPanel({ data, xKey, series, height = 260, valueFormatter }: LineChartPanelProps) {
  const fmt = valueFormatter ?? ((v: number) => fmtNum(v, { compact: true }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
        <defs>
          {series
            .filter((s) => !s.dashed)
            .map((s) => (
              <linearGradient key={s.key} id={`line-fill-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity={0.28} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
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
          formatter={(v: unknown) => fmt(Number(v as number))}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: "#9aa1ae", paddingTop: 8 }} iconType="circle" iconSize={8} />
        {series.map((s) =>
          s.dashed ? (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2.25}
              strokeDasharray="5 4"
              dot={{ r: 3, strokeWidth: 0, fill: s.color }}
              activeDot={{ r: 5.5, strokeWidth: 2, stroke: "#0b0d12" }}
              animationDuration={700}
              animationEasing="ease-out"
            />
          ) : (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2.25}
              fill={`url(#line-fill-${s.key})`}
              dot={{ r: 3, strokeWidth: 0, fill: s.color }}
              activeDot={{ r: 5.5, strokeWidth: 2, stroke: "#0b0d12" }}
              animationDuration={700}
              animationEasing="ease-out"
            />
          ),
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}
