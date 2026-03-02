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
      className="group relative w-full text-left rounded-lg border border-white/10 bg-white/[0.03] p-3
                 transition-all duration-200 hover:bg-white/[0.07] hover:border-white/20 hover:scale-[1.02]
                 focus:outline-none focus:ring-2 focus:ring-white/20"
    >
      <div
        className="absolute top-0 left-0 w-1 h-full rounded-l-lg"
        style={{ backgroundColor: color }}
      />
      <div className="pl-2">
        <h3 className="font-semibold text-sm text-white/90 group-hover:text-white truncate">
          {company.name}
        </h3>
        <p className="text-xs text-white/40 mt-0.5 line-clamp-2 leading-relaxed">
          {company.description}
        </p>
        <div className="flex flex-wrap gap-1 mt-2">
          {company.capabilities.slice(0, 2).map((cap) => (
            <span
              key={cap}
              className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/50"
            >
              {cap}
            </span>
          ))}
          {company.capabilities.length > 2 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/30">
              +{company.capabilities.length - 2}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
