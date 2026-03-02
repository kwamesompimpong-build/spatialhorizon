"use client";

import { useMemo } from "react";
import {
  Company,
  DomainLayer,
  Capability,
  DOMAIN_LAYERS,
  DOMAIN_COLORS,
  CAPABILITIES,
} from "@/data/types";

interface StatsBarProps {
  companies: Company[];
}

export default function StatsBar({ companies }: StatsBarProps) {
  const domainCounts = DOMAIN_LAYERS.map((d) => ({
    domain: d,
    count: companies.filter((c) => c.domain === d).length,
    color: DOMAIN_COLORS[d],
  }));

  const capCounts = CAPABILITIES.map((c) => ({
    capability: c,
    count: companies.filter((co) => co.capabilities.includes(c)).length,
  })).sort((a, b) => b.count - a.count);

  const totalMax = Math.max(...domainCounts.map((d) => d.count), 1);

  const sizeCounts = useMemo(() => {
    const sizes = ["Enterprise", "Growth", "Startup"] as const;
    return sizes.map((s) => ({
      size: s,
      count: companies.filter((c) => c.size === s).length,
    }));
  }, [companies]);

  // Geographic distribution
  const regionCounts = useMemo(() => {
    const regions: Record<string, number> = {};
    companies.forEach((c) => {
      let region: string;
      const hq = c.hq.toLowerCase();
      if (hq.includes("ca") || hq.includes("co") || hq.includes("wa") || hq.includes("tx") || hq.includes("ny") ||
          hq.includes("va") || hq.includes("ma") || hq.includes("fl") || hq.includes("pa") || hq.includes("vt") ||
          hq.includes("nm") || hq.includes("dc") || hq.includes("boston") || hq.includes("denver") ||
          hq.includes("mountain view") || hq.includes("san") || hq.includes("new york") || hq.includes("seattle")) {
        region = "North America";
      } else if (hq.includes("uk") || hq.includes("france") || hq.includes("germany") || hq.includes("netherlands") ||
                 hq.includes("sweden") || hq.includes("norway") || hq.includes("switzerland") || hq.includes("austria") ||
                 hq.includes("finland") || hq.includes("russia") || hq.includes("monaco") || hq.includes("greece")) {
        region = "Europe";
      } else if (hq.includes("canada")) {
        region = "North America";
      } else if (hq.includes("japan") || hq.includes("india") || hq.includes("china") || hq.includes("israel")) {
        region = "Asia-Pacific";
      } else if (hq.includes("australia")) {
        region = "Asia-Pacific";
      } else if (hq.includes("argentina")) {
        region = "Latin America";
      } else {
        region = "North America";
      }
      regions[region] = (regions[region] || 0) + 1;
    });
    return Object.entries(regions)
      .map(([region, count]) => ({ region, count }))
      .sort((a, b) => b.count - a.count);
  }, [companies]);

  // Capability matrix: for each domain, count companies per capability
  const capabilityMatrix = useMemo(() => {
    const matrix: Record<string, Record<string, number>> = {};
    for (const domain of DOMAIN_LAYERS) {
      matrix[domain] = {};
      const domainCompanies = companies.filter((c) => c.domain === domain);
      for (const cap of CAPABILITIES) {
        matrix[domain][cap] = domainCompanies.filter((c) =>
          c.capabilities.includes(cap)
        ).length;
      }
    }
    return matrix;
  }, [companies]);

  const matrixMax = useMemo(() => {
    let max = 0;
    for (const domain of DOMAIN_LAYERS) {
      for (const cap of CAPABILITIES) {
        max = Math.max(max, capabilityMatrix[domain]?.[cap] || 0);
      }
    }
    return max || 1;
  }, [capabilityMatrix]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryCard label="Total Companies" value={companies.length} />
        <SummaryCard label="Domains" value={DOMAIN_LAYERS.length} />
        <SummaryCard label="Capabilities" value={CAPABILITIES.length} />
        <SummaryCard
          label="Avg. Capabilities"
          value={companies.length > 0
            ? (companies.reduce((sum, c) => sum + c.capabilities.length, 0) / companies.length).toFixed(1)
            : "0"}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Domain distribution */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
          <h3 className="text-[10px] uppercase tracking-wider text-white/25 font-semibold mb-4">
            Companies by Domain
          </h3>
          <div className="space-y-2.5">
            {domainCounts.map(({ domain, count, color }) => (
              <div key={domain} className="flex items-center gap-3">
                <span className="text-[11px] text-white/50 w-28 shrink-0">{domain}</span>
                <div className="flex-1 h-6 bg-white/[0.03] rounded-lg overflow-hidden">
                  <div
                    className="h-full rounded-lg transition-all duration-700 flex items-center justify-end pr-2"
                    style={{
                      width: `${Math.max((count / totalMax) * 100, 8)}%`,
                      backgroundColor: `${color}50`,
                    }}
                  >
                    <span className="text-[10px] font-semibold text-white/80">{count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Capability breakdown */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
          <h3 className="text-[10px] uppercase tracking-wider text-white/25 font-semibold mb-4">
            Capability Distribution
          </h3>
          <div className="space-y-2.5">
            {capCounts.map(({ capability, count }) => {
              const pct = companies.length > 0 ? Math.round((count / companies.length) * 100) : 0;
              return (
                <div key={capability} className="flex items-center gap-3">
                  <span className="text-[11px] text-white/50 w-40 shrink-0">{capability}</span>
                  <div className="flex-1 h-6 bg-white/[0.03] rounded-lg overflow-hidden">
                    <div
                      className="h-full rounded-lg bg-gradient-to-r from-indigo-500/40 to-cyan-500/40 transition-all duration-700 flex items-center justify-end pr-2"
                      style={{ width: `${Math.max(pct, 8)}%` }}
                    >
                      <span className="text-[10px] font-semibold text-white/70">{count}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-white/25 w-8 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Company size breakdown */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
          <h3 className="text-[10px] uppercase tracking-wider text-white/25 font-semibold mb-4">
            Company Stage
          </h3>
          <div className="flex items-end gap-4 h-36">
            {sizeCounts.map(({ size, count }) => {
              const maxCount = Math.max(...sizeCounts.map((s) => s.count), 1);
              const heightPct = (count / maxCount) * 100;
              const color =
                size === "Enterprise"
                  ? "bg-amber-500/50"
                  : size === "Growth"
                  ? "bg-blue-500/50"
                  : "bg-emerald-500/50";
              return (
                <div key={size} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-sm font-semibold text-white/70">{count}</span>
                  <div className="w-full bg-white/[0.03] rounded-lg overflow-hidden" style={{ height: "100%" }}>
                    <div
                      className={`w-full ${color} rounded-lg transition-all duration-700`}
                      style={{ height: `${heightPct}%`, marginTop: `${100 - heightPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-white/40">{size}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Geographic distribution */}
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
          <h3 className="text-[10px] uppercase tracking-wider text-white/25 font-semibold mb-4">
            Geographic Distribution
          </h3>
          <div className="space-y-3">
            {regionCounts.map(({ region, count }) => {
              const pct = companies.length > 0 ? Math.round((count / companies.length) * 100) : 0;
              return (
                <div key={region}>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-[11px] text-white/55">{region}</span>
                    <span className="text-[10px] text-white/30">{count} ({pct}%)</span>
                  </div>
                  <div className="h-3 bg-white/[0.03] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500/40 to-pink-500/40 transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Domain × Capability heatmap */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5">
        <h3 className="text-[10px] uppercase tracking-wider text-white/25 font-semibold mb-4">
          Domain × Capability Matrix
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr>
                <th className="text-left text-[10px] text-white/30 pb-3 pr-3 font-medium">Domain</th>
                {CAPABILITIES.map((cap) => (
                  <th key={cap} className="text-center text-[9px] text-white/30 pb-3 px-1 font-medium whitespace-nowrap">
                    {cap.replace(" / ", "/").replace(" & ", "/")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DOMAIN_LAYERS.map((domain) => (
                <tr key={domain} className="border-t border-white/[0.03]">
                  <td className="text-[11px] text-white/50 py-2.5 pr-3 whitespace-nowrap">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: DOMAIN_COLORS[domain] }} />
                      {domain}
                    </span>
                  </td>
                  {CAPABILITIES.map((cap) => {
                    const val = capabilityMatrix[domain]?.[cap] || 0;
                    const intensity = val / matrixMax;
                    return (
                      <td key={cap} className="text-center py-2.5 px-1">
                        <div
                          className="mx-auto w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-medium transition-all"
                          style={{
                            backgroundColor: val > 0 ? `${DOMAIN_COLORS[domain]}${Math.round(intensity * 40 + 10).toString(16).padStart(2, "0")}` : "rgba(255,255,255,0.02)",
                            color: val > 0 ? `${DOMAIN_COLORS[domain]}` : "rgba(255,255,255,0.15)",
                          }}
                        >
                          {val || "·"}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
      <p className="text-[10px] uppercase tracking-wider text-white/25 font-semibold">{label}</p>
      <p className="text-2xl font-bold text-white/80 mt-1">{value}</p>
    </div>
  );
}
