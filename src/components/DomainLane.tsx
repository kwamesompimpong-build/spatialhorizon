"use client";

import { Company, DomainLayer, DOMAIN_COLORS, DOMAIN_DESCRIPTIONS } from "@/data/types";
import CompanyCard from "./CompanyCard";

interface DomainLaneProps {
  domain: DomainLayer;
  companies: Company[];
  onCompanyClick: (company: Company) => void;
  icon: React.ReactNode;
}

export default function DomainLane({
  domain,
  companies,
  onCompanyClick,
  icon,
}: DomainLaneProps) {
  const color = DOMAIN_COLORS[domain];

  return (
    <section className="relative">
      {/* Domain header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-xl"
          style={{ backgroundColor: `${color}20` }}
        >
          <div style={{ color }}>{icon}</div>
        </div>
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            {domain}
            <span className="text-xs font-normal text-white/30 bg-white/5 px-2 py-0.5 rounded-full">
              {companies.length}
            </span>
          </h2>
          <p className="text-xs text-white/40 max-w-xl">
            {DOMAIN_DESCRIPTIONS[domain]}
          </p>
        </div>
      </div>

      {/* Company grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
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
