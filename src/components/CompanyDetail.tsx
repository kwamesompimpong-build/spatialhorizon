"use client";

import { Company, DOMAIN_COLORS } from "@/data/types";

interface CompanyDetailProps {
  company: Company;
  onClose: () => void;
}

export default function CompanyDetail({ company, onClose }: CompanyDetailProps) {
  const color = DOMAIN_COLORS[company.domain];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-[#12122a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header bar */}
        <div className="h-1.5 w-full" style={{ backgroundColor: color }} />

        <div className="p-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors text-xl"
            aria-label="Close"
          >
            &#10005;
          </button>

          {/* Domain badge */}
          <span
            className="inline-block text-xs font-medium px-2.5 py-1 rounded-full mb-3"
            style={{ backgroundColor: `${color}30`, color }}
          >
            {company.domain}
          </span>

          {/* Company name */}
          <h2 className="text-2xl font-bold text-white mb-1">{company.name}</h2>

          {/* Meta line */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-white/40 mb-4">
            {company.founded && <span>Est. {company.founded}</span>}
            <span>{company.hq}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                company.size === "Enterprise"
                  ? "bg-amber-500/10 text-amber-400"
                  : company.size === "Growth"
                  ? "bg-blue-500/10 text-blue-400"
                  : "bg-emerald-500/10 text-emerald-400"
              }`}
            >
              {company.size}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-white/70 leading-relaxed mb-5">
            {company.description}
          </p>

          {/* Capabilities */}
          <div className="mb-5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/30 mb-2">
              Capabilities
            </h4>
            <div className="flex flex-wrap gap-2">
              {company.capabilities.map((cap) => (
                <span
                  key={cap}
                  className="text-xs px-2.5 py-1 rounded-full border border-white/10 text-white/60"
                >
                  {cap}
                </span>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="mb-5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/30 mb-2">
              Focus Areas
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {company.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] px-2 py-0.5 rounded bg-white/5 text-white/50"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Website link */}
          <a
            href={company.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
            style={{ color }}
          >
            Visit Website
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
