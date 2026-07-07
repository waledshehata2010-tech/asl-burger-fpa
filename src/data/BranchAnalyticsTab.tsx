import { useMemo, useState } from "react";
import branchData from "../data/branch-sales-data.json";

// ============================================================================
// أصل البرجر — تبويب "تحليل مبيعات الفروع" (نسخة الويب المطابقة للوحة التنفيذية
// في الموديل المالي: نفس الفلاتر، نفس المؤشرات، نفس خريطة المناطق التخطيطية)
// ============================================================================

const COLORS = {
  navy: "#12233F",
  navyLight: "#2A4570",
  gold: "#C9A227",
  bg: "#F7F5F0",
  card: "#FFFFFF",
  ink: "#1A2130",
  sub: "#6B7280",
  border: "#E7E2D6",
  low: "#F8696B",
  mid: "#FFEB84",
  high: "#63BE7B",
  spotlight: "#F08A3C",
};

const MONTHS_AR = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
const ALL_REGIONS = ["الرياض","مكة المكرمة","المدينة المنورة","القصيم","الشرقية","عسير","تبوك","حائل","الحدود الشمالية","جازان","نجران","الباحة","الجوف"];
const OWNERSHIP_OPTIONS = ["الكل","فرع مملوك","فرنشايز","غير مصنف"];
const INDICATORS = ["إجمالي المبيعات","متوسط المبيعات الشهري","عدد الفروع النشطة","النمو السنوي %"] as const;
type Indicator = typeof INDICATORS[number];

const GRID: (string | "callout" | null)[][] = [
  ["تبوك", "الجوف", "الحدود الشمالية", "الشرقية"],
  ["المدينة المنورة", "حائل", "القصيم", null],
  ["مكة المكرمة", "الرياض", null, "callout"],
  ["الباحة", "عسير", "نجران", null],
  ["جازان", null, null, null],
];

type SaleRow = { branch: string; region: string; city: string; ownership: string; year: number; month: number; netSales: number };
const DATA = branchData as { regions: { name: string; lat: number; lng: number }[]; branches: any[]; sales: SaleRow[] };

const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
const pct = (n: number | null) => (n === null ? "—" : `${n >= 0 ? "+" : ""}${(n * 100).toFixed(1)}%`);

function scaleColor(t: number) {
  const c1 = t < 0.5 ? COLORS.low : COLORS.mid;
  const c2 = t < 0.5 ? COLORS.mid : COLORS.high;
  const lt = t < 0.5 ? t / 0.5 : (t - 0.5) / 0.5;
  const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const [r1, g1, b1] = hex(c1), [r2, g2, b2] = hex(c2);
  return `rgb(${Math.round(r1+(r2-r1)*lt)},${Math.round(g1+(g2-g1)*lt)},${Math.round(b1+(b2-b1)*lt)})`;
}

export default function BranchAnalyticsTab() {
  const [year, setYear] = useState<number | "الإجمالي">(2026);
  const [month, setMonth] = useState<number>(0);
  const [region, setRegion] = useState<string>("كل المناطق");
  const [indicator, setIndicator] = useState<Indicator>("إجمالي المبيعات");
  const [ownership, setOwnership] = useState<string>("الكل");

  const years = useMemo(() => Array.from(new Set(DATA.sales.map((s) => s.year))).sort(), []);

  const current = useMemo(() => DATA.sales.filter((s) =>
    (year === "الإجمالي" || s.year === year) &&
    (month === 0 || s.month === month) &&
    (region === "كل المناطق" || s.region === region) &&
    (ownership === "الكل" || s.ownership === ownership)
  ), [year, month, region, ownership]);

  const prevYearSame = useMemo(() => {
    if (year === "الإجمالي") return [];
    return DATA.sales.filter((s) => s.year === year - 1 && (month === 0 || s.month === month) && (region === "كل المناطق" || s.region === region) && (ownership === "الكل" || s.ownership === ownership));
  }, [year, month, region, ownership]);

  const prevMonthRows = useMemo(() => {
    if (year === "الإجمالي" || month === 0) return [];
    const pm = month === 1 ? 12 : month - 1;
    const py = month === 1 ? year - 1 : year;
    return DATA.sales.filter((s) => s.year === py && s.month === pm && (region === "كل المناطق" || s.region === region) && (ownership === "الكل" || s.ownership === ownership));
  }, [year, month, region, ownership]);

  const totalSales = current.reduce((a, s) => a + s.netSales, 0);
  const activeBranchesSet = new Set(current.filter((s) => s.netSales > 0).map((s) => s.branch));
  const activeBranches = activeBranchesSet.size;
  const avgPerBranch = activeBranches ? totalSales / activeBranches : 0;
  const grandTotal = useMemo(() => DATA.sales.filter((s) => ownership === "الكل" || s.ownership === ownership).reduce((a, s) => a + s.netSales, 0), [ownership]);

  const prevYearTotal = prevYearSame.reduce((a, s) => a + s.netSales, 0);
  const yoy = prevYearTotal ? (totalSales - prevYearTotal) / prevYearTotal : null;
  const prevMonthTotal = prevMonthRows.reduce((a, s) => a + s.netSales, 0);
  const mom = prevMonthTotal ? (totalSales - prevMonthTotal) / prevMonthTotal : null;

  const regionStats = useMemo(() => {
    const rowsForYearMonth = DATA.sales.filter((s) => (year === "الإجمالي" || s.year === year) && (month === 0 || s.month === month) && (ownership === "الكل" || s.ownership === ownership));
    const rowsPrevYear = DATA.sales.filter((s) => year !== "الإجمالي" && s.year === (year as number) - 1 && (month === 0 || s.month === month) && (ownership === "الكل" || s.ownership === ownership));

    return ALL_REGIONS.map((name) => {
      const rows = rowsForYearMonth.filter((s) => s.region === name);
      const prevRows = rowsPrevYear.filter((s) => s.region === name);
      const total = rows.reduce((a, s) => a + s.netSales, 0);
      const prevTotal = prevRows.reduce((a, s) => a + s.netSales, 0);
      const activeSet = new Set(rows.filter((s) => s.netSales > 0).map((s) => s.branch));
      const branchesCount = activeSet.size;
      const avgMonthly = branchesCount ? total / branchesCount : 0;
      const growth = prevTotal ? (total - prevTotal) / prevTotal : null;
      let value = 0;
      if (indicator === "إجمالي المبيعات") value = total;
      else if (indicator === "متوسط المبيعات الشهري") value = avgMonthly;
      else if (indicator === "عدد الفروع النشطة") value = branchesCount;
      else value = growth ?? 0;
      return { name, total, branchesCount, avgMonthly, growth, value };
    });
  }, [year, month, ownership, indicator]);

  const rankedRegions = [...regionStats].filter((r) => r.total > 0 || r.branchesCount > 0).sort((a, b) => b.value - a.value);
  const bestRegion = rankedRegions[0];
  const valuesForScale = regionStats.map((r) => r.value).filter((v) => v > 0);
  const minV = Math.min(...(valuesForScale.length ? valuesForScale : [0]));
  const maxV = Math.max(1, ...(valuesForScale.length ? valuesForScale : [1]));
  const normalize = (v: number) => (v <= 0 ? 0 : Math.max(0, Math.min(1, (v - minV) / Math.max(1, maxV - minV))));

  const fmtIndicator = (r: (typeof regionStats)[number]) => {
    if (indicator === "عدد الفروع النشطة") return `${r.branchesCount} فرع`;
    if (indicator === "النمو السنوي %") return r.growth === null ? "—" : pct(r.growth);
    return `${fmt(r.value)} ر.س`;
  };

  const ranking = useMemo(() => {
    const map = new Map<string, { region: string; city: string; ownership: string; total: number; months: number }>();
    for (const s of current) {
      if (!map.has(s.branch)) map.set(s.branch, { region: s.region, city: s.city, ownership: s.ownership, total: 0, months: 0 });
      const e = map.get(s.branch)!;
      e.total += s.netSales;
      if (s.netSales > 0) e.months += 1;
    }
    return Array.from(map.entries())
      .map(([branch, e]) => ({ branch, ...e, avg: e.months ? e.total / e.months : 0 }))
      .filter((r) => r.total > 0)
      .sort((a, b) => b.avg - a.avg);
  }, [current]);

  const medal = (i: number) => (i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : String(i + 1));
  const ownColor = (o: string) => (o === "فرع مملوك" ? "#0F7B34" : o === "فرنشايز" ? "#9C5700" : "#7F7F7F");
  const ownBg = (o: string) => (o === "فرع مملوك" ? "#EAF7EE" : o === "فرنشايز" ? "#FFF6E0" : "#F2F2F2");

  return (
    <div dir="rtl" style={{ background: COLORS.bg, minHeight: "100%", padding: 24, fontFamily: "'Tahoma','Segoe UI',sans-serif", color: COLORS.ink }}>
      <style>{`
        @keyframes basPulse { 0% { r: 6; opacity: .85; } 100% { r: 20; opacity: 0; } }
        .bas-marker-ring { animation: basPulse 2.2s ease-out infinite; }
        .bas-select { padding:7px 10px; border-radius:8px; border:1px solid ${COLORS.border}; background:#fff; font-size:13px; color:${COLORS.ink}; cursor:pointer; }
        .bas-card { background:${COLORS.card}; border:1px solid ${COLORS.border}; border-radius:14px; padding:16px 18px; }
        table.bas-table { width:100%; border-collapse:collapse; font-size:13px; }
        table.bas-table th { text-align:right; color:${COLORS.sub}; font-weight:600; padding:7px 9px; border-bottom:2px solid ${COLORS.border}; white-space:nowrap; }
        table.bas-table td { padding:7px 9px; border-bottom:1px solid ${COLORS.border}; }
        table.bas-table tr:hover td { background:#faf8f2; }
        .bas-cell { border-radius:10px; padding:8px 6px; text-align:center; color:#1A2130; font-size:11.5px; line-height:1.5; border:2px solid transparent; transition:.15s; cursor:pointer; }
        .bas-cell:hover { filter:brightness(0.97); }
      `}</style>

      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11.5, letterSpacing: 1, color: COLORS.gold, fontWeight: 700 }}>لوحة تنفيذية — بيانات فعلية</div>
        <h2 style={{ margin: "2px 0 2px", fontSize: 23, color: COLORS.navy }}>تحليل مبيعات الفروع</h2>
        <div style={{ fontSize: 12.5, color: COLORS.sub }}>
          شركة أصل البرجر  |  {DATA.branches.length} فرع/موقع  |  عرض ديناميكي حسب السنة والشهر والمنطقة
        </div>
      </div>

      <div className="bas-card" style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
        <label style={{ fontSize: 12, color: COLORS.sub }}>🎛 السنة
          <div><select className="bas-select" value={String(year)} onChange={(e) => setYear(e.target.value === "الإجمالي" ? "الإجمالي" : Number(e.target.value))}>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
            <option value="الإجمالي">الإجمالي</option>
          </select></div>
        </label>
        <label style={{ fontSize: 12, color: COLORS.sub }}>الشهر
          <div><select className="bas-select" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            <option value={0}>كل الأشهر</option>
            {MONTHS_AR.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select></div>
        </label>
        <label style={{ fontSize: 12, color: COLORS.sub }}>المنطقة
          <div><select className="bas-select" value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="كل المناطق">كل المناطق</option>
            {ALL_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select></div>
        </label>
        <label style={{ fontSize: 12, color: COLORS.sub }}>نوع المؤشر
          <div><select className="bas-select" value={indicator} onChange={(e) => setIndicator(e.target.value as Indicator)}>
            {INDICATORS.map((i) => <option key={i} value={i}>{i}</option>)}
          </select></div>
        </label>
        <label style={{ fontSize: 12, color: COLORS.sub }}>تصنيف الملكية
          <div><select className="bas-select" value={ownership} onChange={(e) => setOwnership(e.target.value)}>
            {OWNERSHIP_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select></div>
        </label>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { label: "💰 إجمالي المبيعات (الفترة)", value: `${fmt(totalSales)} ر.س` },
          { label: "🏪 عدد الفروع النشطة", value: fmt(activeBranches) },
          { label: "📊 متوسط مبيعات الفرع", value: `${fmt(avgPerBranch)} ر.س` },
          { label: "📈 النمو السنوي YoY", value: pct(yoy), tone: yoy },
          ...(month !== 0 ? [{ label: "النمو الشهري MoM", value: pct(mom), tone: mom }] : []),
          { label: "🗂 إجمالي كامل التاريخ", value: `${fmt(grandTotal)} ر.س` },
        ].map((k, i) => (
          <div key={i} className="bas-card">
            <div style={{ fontSize: 12, color: COLORS.sub, marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: 19, fontWeight: 700, color: k.tone != null ? (k.tone >= 0 ? "#0F7B34" : "#C00000") : COLORS.navy }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.05fr 1fr", gap: 18, alignItems: "start" }}>
        <div className="bas-card">
          <div style={{ fontWeight: 700, color: COLORS.navy, marginBottom: 2 }}>🗺 خريطة المملكة العربية السعودية — كثافة الأداء حسب المنطقة</div>
          <div style={{ fontSize: 11, color: COLORS.sub, marginBottom: 10 }}>
            المؤشر المعروض: <b>{indicator}</b> — اضغط على أي منطقة للتصفية
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {GRID.flat().map((cell, idx) => {
              if (cell === null) return <div key={idx} />;
              if (cell === "callout") {
                return (
                  <div key={idx} style={styleCallout}>
                    <div style={{ fontSize: 10.5, opacity: 0.85 }}>أفضل منطقة</div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{bestRegion?.name ?? "—"}</div>
                    <div style={{ fontSize: 11 }}>{bestRegion ? fmtIndicator(bestRegion) : "—"}</div>
                    <div style={{ fontSize: 10, opacity: 0.8, marginTop: 4 }}>إجمالي الفترة: {fmt(totalSales)} ر.س</div>
                  </div>
                );
              }
              const stat = regionStats.find((r) => r.name === cell)!;
              const active = stat.branchesCount > 0;
              const isSelected = region === cell;
              const bg = active ? scaleColor(normalize(stat.value)) : "#EDEDED";
              return (
                <div
                  key={idx}
                  className="bas-cell"
                  onClick={() => setRegion(isSelected ? "كل المناطق" : cell)}
                  style={{ background: bg, border: isSelected ? `2px solid ${COLORS.spotlight}` : "2px solid transparent", position: "relative" }}
                >
                  {active && (
                    <svg width="0" height="0" style={{ position: "absolute" }}>
                      <circle className="bas-marker-ring" cx={0} cy={0} r={6} />
                    </svg>
                  )}
                  <div style={{ fontWeight: 700 }}>{cell}</div>
                  <div>{fmtIndicator(stat)}</div>
                  <div style={{ opacity: 0.75 }}>({stat.branchesCount} فرع)</div>
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, fontSize: 11, color: COLORS.sub }}>
            <span>🟥 أدنى/غير نشطة</span>
            <div style={{ flex: 1, height: 8, borderRadius: 4, background: `linear-gradient(90deg, ${COLORS.low}, ${COLORS.mid}, ${COLORS.high})` }} />
            <span>🟩 أعلى كفاءة</span>
            <span style={{ marginRight: 6 }}>🟧 المنطقة المختارة</span>
          </div>
        </div>

        <div className="bas-card">
          <div style={{ fontWeight: 700, color: COLORS.navy, marginBottom: 10 }}>تحليل حسب المنطقة الإدارية</div>
          <table className="bas-table">
            <thead><tr><th>المنطقة</th><th>إجمالي المبيعات</th><th>عدد الفروع</th><th>متوسط/فرع</th><th>الترتيب</th></tr></thead>
            <tbody>
              {rankedRegions.map((r, i) => (
                <tr key={r.name} style={{ background: region === r.name ? "#FFF3E7" : undefined }}>
                  <td style={{ fontWeight: 600 }}>{r.name}</td>
                  <td>{fmt(r.total)}</td>
                  <td>{r.branchesCount}</td>
                  <td>{fmt(r.avgMonthly)}</td>
                  <td>{i + 1}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bas-card" style={{ marginTop: 18 }}>
        <div style={{ fontWeight: 700, color: COLORS.navy, marginBottom: 10 }}>🏆 ترتيب الفروع بالكفاءة (حسب فترة العرض المختارة)</div>
        <div style={{ maxHeight: 420, overflow: "auto" }}>
          <table className="bas-table">
            <thead>
              <tr><th>#</th><th>الفرع</th><th>المدينة</th><th>المنطقة</th><th>مبيعات الفترة (ر.س)</th><th>أشهر نشطة</th><th>متوسط شهري (ر.س)</th><th>الملكية</th></tr>
            </thead>
            <tbody>
              {ranking.map((r, i) => (
                <tr key={r.branch}>
                  <td>{medal(i)}</td>
                  <td>{r.branch}</td>
                  <td>{r.city}</td>
                  <td>{r.region}</td>
                  <td>{fmt(r.total)}</td>
                  <td>{r.months}</td>
                  <td style={{ fontWeight: 600, color: COLORS.navy }}>{fmt(r.avg)}</td>
                  <td><span style={{ background: ownBg(r.ownership), color: ownColor(r.ownership), padding: "2px 8px", borderRadius: 6, fontSize: 11.5 }}>{r.ownership}</span></td>
                </tr>
              ))}
              {ranking.length === 0 && <tr><td colSpan={8} style={{ textAlign: "center", color: COLORS.sub, padding: 20 }}>لا توجد بيانات مبيعات لهذه الفترة/المنطقة/التصنيف</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const styleCallout: React.CSSProperties = {
  background: "linear-gradient(135deg,#12233F,#2A4570)",
  color: "#fff",
  borderRadius: 10,
  padding: "10px 8px",
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};
