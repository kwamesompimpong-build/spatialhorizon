"use client";

import { useState, useEffect } from "react";

interface Snapshot {
  snapshotDate: string;
  price: number;
  marketCap: number;
  volume: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  currency: string;
}

export default function PriceHistoryChart({ companyId }: { companyId: string }) {
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [metric, setMetric] = useState<"price" | "marketCap">("price");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/companies/${companyId}/history`)
      .then((r) => r.json())
      .then((data) => setSnapshots(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [companyId]);

  if (loading) return <div className="text-xs text-slate-500 py-4">Loading history...</div>;
  if (snapshots.length < 2) return null;

  const values = snapshots.map((s) => (metric === "price" ? s.price : s.marketCap));
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const W = 400;
  const H = 120;
  const padX = 0;
  const padY = 8;

  const points = values.map((v, i) => ({
    x: padX + (i / (values.length - 1)) * (W - 2 * padX),
    y: padY + (1 - (v - minVal) / range) * (H - 2 * padY),
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${H} L ${points[0].x} ${H} Z`;

  const isUp = values[values.length - 1] >= values[0];
  const color = isUp ? "#22c55e" : "#ef4444";

  const formatValue = (v: number) => {
    if (metric === "marketCap") {
      if (v >= 1e12) return `$${(v / 1e12).toFixed(1)}T`;
      if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
      if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
      return `$${v.toLocaleString()}`;
    }
    return `$${v.toFixed(2)}`;
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const hovered = hoveredIdx !== null ? snapshots[hoveredIdx] : null;

  return (
    <div className="mt-4 pt-4 border-t border-slate-700/50">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-slate-300">Price History</h4>
        <div className="flex gap-1">
          {(["price", "marketCap"] as const).map((m) => (
            <button key={m} onClick={() => setMetric(m)}
              className={`px-2 py-0.5 rounded text-xs transition-colors ${
                metric === m ? "bg-slate-700 text-slate-200" : "text-slate-500 hover:text-slate-300"
              }`}>
              {m === "price" ? "Price" : "Mkt Cap"}
            </button>
          ))}
        </div>
      </div>

      {/* Hover info */}
      <div className="h-5 mb-1">
        {hovered ? (
          <div className="text-xs text-slate-400">
            {formatDate(hovered.snapshotDate)}: <span className="text-slate-200 font-medium">{formatValue(metric === "price" ? hovered.price : hovered.marketCap)}</span>
            {" "}
            <span className={hovered.changePercent >= 0 ? "text-green-400" : "text-red-400"}>
              {hovered.changePercent >= 0 ? "+" : ""}{hovered.changePercent.toFixed(2)}%
            </span>
          </div>
        ) : (
          <div className="text-xs text-slate-500">
            {formatValue(values[values.length - 1])}
            {" "}
            <span className={isUp ? "text-green-400" : "text-red-400"}>
              {isUp ? "+" : ""}{((values[values.length - 1] - values[0]) / values[0] * 100).toFixed(1)}% overall
            </span>
          </div>
        )}
      </div>

      {/* SVG Chart */}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none"
        onMouseLeave={() => setHoveredIdx(null)}>
        <defs>
          <linearGradient id={`grad-${companyId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#grad-${companyId})`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
        {/* Hover zones */}
        {points.map((p, i) => (
          <rect key={i} x={i === 0 ? 0 : (points[i - 1].x + p.x) / 2} y={0}
            width={i === 0 || i === points.length - 1 ? W / points.length / 2 : (points[Math.min(i + 1, points.length - 1)].x - points[Math.max(i - 1, 0)].x) / 2}
            height={H} fill="transparent"
            onMouseEnter={() => setHoveredIdx(i)} />
        ))}
        {hoveredIdx !== null && (
          <>
            <circle cx={points[hoveredIdx].x} cy={points[hoveredIdx].y} r="3" fill={color} stroke="#1e293b" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            <line x1={points[hoveredIdx].x} y1={0} x2={points[hoveredIdx].x} y2={H} stroke={color} strokeWidth="0.5" strokeDasharray="3,3" opacity="0.5" vectorEffect="non-scaling-stroke" />
          </>
        )}
      </svg>

      {/* Date range labels */}
      <div className="flex justify-between text-[10px] text-slate-600 mt-1">
        <span>{formatDate(snapshots[0].snapshotDate)}</span>
        <span>{formatDate(snapshots[snapshots.length - 1].snapshotDate)}</span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mt-2 text-[10px] text-slate-500">
        <div>High: <span className="text-slate-300">{formatValue(maxVal)}</span></div>
        <div>Low: <span className="text-slate-300">{formatValue(minVal)}</span></div>
        <div>Points: <span className="text-slate-300">{snapshots.length}</span></div>
      </div>
    </div>
  );
}
