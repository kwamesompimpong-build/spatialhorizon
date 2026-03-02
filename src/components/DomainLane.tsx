"use client";

import { Company, DomainLayer, DOMAIN_COLORS, DOMAIN_DESCRIPTIONS } from "@/data/types";
import CompanyCard from "./CompanyCard";

interface DomainLaneProps {
  domain: DomainLayer;
  companies: Company[];
  onCompanyClick: (company: Company) => void;
  icon: React.ReactNode;
}

const LANE_CLASSES: Record<DomainLayer, string> = {
  Space: "domain-lane-space",
  Aerial: "domain-lane-aerial",
  Terrestrial: "domain-lane-terrestrial",
  "Marine Surface": "domain-lane-marine",
  Subsea: "domain-lane-subsea",
  "Cross-Domain": "domain-lane-cross",
};

const DEPTH_LABELS: Partial<Record<DomainLayer, string>> = {
  Space: "~400 km+",
  Aerial: "0.1 – 20 km",
  Terrestrial: "Surface",
  "Marine Surface": "Sea Level",
  Subsea: "0 – 11 km depth",
};

export default function DomainLane({
  domain,
  companies,
  onCompanyClick,
  icon,
}: DomainLaneProps) {
  const color = DOMAIN_COLORS[domain];
  const laneClass = LANE_CLASSES[domain];
  const depthLabel = DEPTH_LABELS[domain];

  return (
    <section className={`relative rounded-2xl p-5 border border-white/[0.04] ${laneClass}`}>
      {/* Left accent bar */}
      <div
        className="absolute top-0 left-0 w-1 h-full rounded-l-2xl"
        style={{ backgroundColor: `${color}40` }}
      />

      {/* Domain header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-xl"
            style={{ backgroundColor: `${color}15`, boxShadow: `0 0 20px ${color}10` }}
          >
            <div style={{ color }}>{icon}</div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              {domain}
              <span className="text-[11px] font-normal text-white/30 bg-white/5 px-2 py-0.5 rounded-full">
                {companies.length} {companies.length === 1 ? "company" : "companies"}
              </span>
            </h2>
            <p className="text-xs text-white/40 max-w-xl">
              {DOMAIN_DESCRIPTIONS[domain]}
            </p>
          </div>
        </div>
        {depthLabel && (
          <span className="hidden sm:block text-[10px] text-white/20 font-mono tracking-wider">
            {depthLabel}
          </span>
        )}
      </div>

      {/* Company grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 stagger-children">
        {companies.map((company) => (
          <CompanyCard
            key={company.id}
            company={company}
            onClick={onCompanyClick}
          />
        ))}
      </div>

      {companies.length === 0 && (
        <div className="text-center py-8 text-white/20 text-sm">
          No companies match current filters
        </div>
      )}
    </section>
  );
}
