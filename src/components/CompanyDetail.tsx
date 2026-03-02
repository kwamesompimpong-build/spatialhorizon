"use client";

import { useEffect } from "react";
import { Company, DOMAIN_COLORS } from "@/data/types";

interface CompanyDetailProps {
  company: Company;
  onClose: () => void;
}

export default function CompanyDetail({ company, onClose }: CompanyDetailProps) {
  const color = DOMAIN_COLORS[company.domain];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm modal-backdrop"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-[#0d0d20] border border-white/10 rounded-2xl shadow-2xl overflow-hidden modal-content">
        {/* Header gradient bar */}
        <div className="h-1 w-full" style={{ backgroundColor: color }} />

        {/* Ambient glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ backgroundColor: color }}
        />

        <div className="relative p-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-lg
                       text-white/30 hover:text-white/70 hover:bg-white/10 transition-all text-sm"
            aria-label="Close"
          >
            &#10005;
          </button>

          {/* Domain badge */}
          <span
            className="inline-block text-[11px] font-semibold px-2.5 py-1 rounded-lg mb-3 uppercase tracking-wider"
            style={{ backgroundColor: `${color}18`, color }}
          >
            {company.domain}
          </span>

          {/* Company name */}
          <h2 className="text-2xl font-bold text-white mb-1.5">{company.name}</h2>

          {/* Meta line */}
          <div className="flex flex-wrap items-center gap-2.5 text-sm text-white/40 mb-5">
            {company.founded && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                Est. {company.founded}
              </span>
            )}
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              {company.hq}
            </span>
            <span
              className={`px-2 py-0.5 rounded-lg text-xs font-medium ${
                company.size === "Enterprise"
                  ? "bg-amber-500/10 text-amber-400/80"
                  : company.size === "Growth"
                  ? "bg-blue-500/10 text-blue-400/80"
                  : "bg-emerald-500/10 text-emerald-400/80"
              }`}
            >
              {company.size}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-white/65 leading-relaxed mb-6">
            {company.description}
          </p>

          {/* Capabilities */}
          <div className="mb-5">
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-white/25 mb-2">
              Capabilities
            </h4>
            <div className="flex flex-wrap gap-2">
              {company.capabilities.map((cap) => (
                <span
                  key={cap}
                  className="text-xs px-2.5 py-1 rounded-lg border border-white/8 text-white/55 bg-white/[0.03]"
                >
                  {cap}
                </span>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="mb-6">
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-white/25 mb-2">
              Focus Areas
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {company.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-white/[0.04] text-white/45"
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
            className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-all hover:opacity-80"
            style={{ backgroundColor: `${color}15`, color }}
          >
            Visit Website
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
