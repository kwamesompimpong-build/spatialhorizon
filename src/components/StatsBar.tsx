"use client";

import { Company, DOMAIN_LAYERS, DOMAIN_COLORS, CAPABILITIES } from "@/data/types";

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

  const totalMax = Math.max(...domainCounts.map((d) => d.count));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Domain distribution */}
      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
        <h3 className="text-xs uppercase tracking-wider text-white/30 font-semibold mb-3">
          Companies by Domain
        </h3>
        <div className="space-y-2">
          {domainCounts.map(({ domain, count, color }) => (
            <div key={domain} className="flex items-center gap-3">
              <span className="text-xs text-white/50 w-28 shrink-0">{domain}</span>
              <div className="flex-1 h-5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(count / totalMax) * 100}%`,
                    backgroundColor: color,
                    opacity: 0.7,
                  }}
                />
              </div>
              <span className="text-xs text-white/40 w-6 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Capability breakdown */}
      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
        <h3 className="text-xs uppercase tracking-wider text-white/30 font-semibold mb-3">
          Top Capabilities
        </h3>
        <div className="space-y-2">
          {capCounts.map(({ capability, count }) => (
            <div key={capability} className="flex items-center gap-3">
              <span className="text-xs text-white/50 w-40 shrink-0">{capability}</span>
              <div className="flex-1 h-5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500/60 to-cyan-500/60 transition-all duration-500"
                  style={{
                    width: `${(count / companies.length) * 100}%`,
                  }}
                />
              </div>
              <span className="text-xs text-white/40 w-6 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
