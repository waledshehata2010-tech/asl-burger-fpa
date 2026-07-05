"use client";

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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

export function LineChartPanel({ data, xKey, series, height = 260, valueFormatter }: LineChartPanelProps) {
  const fmt = valueFormatter ?? ((v: number) => fmtNum(v, { compact: true }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey={xKey} stroke="#9aa1ae" fontSize={12} tickLine={false} axisLine={{ stroke: "rgba(255,255,255,0.08)" }} />
        <YAxis stroke="#9aa1ae" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => fmt(Number(v))} width={56} />
        <Tooltip
          contentStyle={{ background: "#171b24", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12 }}
          labelStyle={{ color: "#9aa1ae" }}
          formatter={(v: unknown) => fmt(Number(v as number))}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: "#9aa1ae" }} />
        {series.map((s) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label}
            stroke={s.color}
            strokeWidth={2}
            strokeDasharray={s.dashed ? "5 4" : undefined}
            dot={{ r: 3, strokeWidth: 0, fill: s.color }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
