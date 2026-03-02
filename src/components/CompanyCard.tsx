"use client";

import { Company, DOMAIN_COLORS } from "@/data/types";

interface CompanyCardProps {
  company: Company;
  onClick: (company: Company) => void;
}

export default function CompanyCard({ company, onClick }: CompanyCardProps) {
  const color = DOMAIN_COLORS[company.domain];

  return (
    <button
      onClick={() => onClick(company)}
      className="group relative w-full text-left rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5
                 transition-all duration-200 hover:bg-white/[0.06] hover:border-white/15 hover:scale-[1.02]
                 hover:shadow-lg hover:shadow-black/20
                 focus:outline-none focus:ring-2 focus:ring-white/20"
    >
      {/* Color accent */}
      <div
        className="absolute top-0 left-0 w-1 h-full rounded-l-xl opacity-60 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: color }}
      />
      <div className="pl-2.5">
        {/* Top row: name + size badge */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm text-white/90 group-hover:text-white truncate">
            {company.name}
          </h3>
          <span
            className={`shrink-0 text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
              company.size === "Enterprise"
                ? "bg-amber-500/10 text-amber-400/70"
                : company.size === "Growth"
                ? "bg-blue-500/10 text-blue-400/70"
                : "bg-emerald-500/10 text-emerald-400/70"
            }`}
          >
            {company.size}
          </span>
        </div>
        <p className="text-[11px] text-white/35 mt-1 line-clamp-2 leading-relaxed">
          {company.description}
        </p>
        <div className="flex flex-wrap gap-1 mt-2">
          {company.capabilities.slice(0, 3).map((cap) => (
            <span
              key={cap}
              className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/[0.04] text-white/45 border border-white/[0.04]"
            >
              {cap}
            </span>
          ))}
          {company.capabilities.length > 3 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/[0.04] text-white/25">
              +{company.capabilities.length - 3}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
