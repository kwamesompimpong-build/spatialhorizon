"use client";

import { useState, useMemo, useCallback } from "react";
import { companies } from "@/data/companies";
import {
  Company,
  DomainLayer,
  Capability,
  CompanySize,
  DOMAIN_LAYERS,
  DOMAIN_COLORS,
} from "@/data/types";
import FilterBar from "@/components/FilterBar";
import DomainLane from "@/components/DomainLane";
import CompanyDetail from "@/components/CompanyDetail";
import StatsBar from "@/components/StatsBar";
import { getDomainIcon } from "@/components/DomainIcons";

type ViewMode = "map" | "stats";

export default function Home() {
  const [search, setSearch] = useState("");
  const [activeDomains, setActiveDomains] = useState<Set<DomainLayer>>(new Set());
  const [activeCapabilities, setActiveCapabilities] = useState<Set<Capability>>(new Set());
  const [activeSize, setActiveSize] = useState<CompanySize | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("map");

  const toggleDomain = useCallback((domain: DomainLayer) => {
    setActiveDomains((prev) => {
      const next = new Set(prev);
      if (next.has(domain)) {
        next.delete(domain);
      } else {
        next.add(domain);
      }
      return next;
    });
  }, []);

  const toggleCapability = useCallback((cap: Capability) => {
    setActiveCapabilities((prev) => {
      const next = new Set(prev);
      if (next.has(cap)) {
        next.delete(cap);
      } else {
        next.add(cap);
      }
      return next;
    });
  }, []);

  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      // Domain filter
      if (activeDomains.size > 0 && !activeDomains.has(c.domain)) return false;
      // Capability filter
      if (
        activeCapabilities.size > 0 &&
        !c.capabilities.some((cap) => activeCapabilities.has(cap))
      )
        return false;
      // Size filter
      if (activeSize && c.size !== activeSize) return false;
      // Search
      if (search) {
        const q = search.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q)) ||
          c.capabilities.some((cap) => cap.toLowerCase().includes(q)) ||
          c.domain.toLowerCase().includes(q) ||
          c.hq.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [search, activeDomains, activeCapabilities, activeSize]);

  const companiesByDomain = useMemo(() => {
    const map = new Map<DomainLayer, Company[]>();
    for (const domain of DOMAIN_LAYERS) {
      map.set(
        domain,
        filteredCompanies.filter((c) => c.domain === domain)
      );
    }
    return map;
  }, [filteredCompanies]);

  const clearFilters = useCallback(() => {
    setSearch("");
    setActiveDomains(new Set());
    setActiveCapabilities(new Set());
    setActiveSize(null);
  }, []);

  const hasFilters =
    search || activeDomains.size > 0 || activeCapabilities.size > 0 || activeSize;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/[0.04] bg-[#060612]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 border border-white/[0.06] flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Spatial Horizon
                </h1>
                <p className="text-[11px] text-white/30 -mt-0.5">
                  Market Map — Space to Seabed
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-white/[0.04] rounded-lg border border-white/[0.06] p-0.5">
                <button
                  onClick={() => setViewMode("map")}
                  className={`text-[11px] px-3 py-1.5 rounded-md transition-all ${
                    viewMode === "map"
                      ? "bg-white/10 text-white shadow-sm"
                      : "text-white/40 hover:text-white/60"
                  }`}
                >
                  Market Map
                </button>
                <button
                  onClick={() => setViewMode("stats")}
                  className={`text-[11px] px-3 py-1.5 rounded-md transition-all ${
                    viewMode === "stats"
                      ? "bg-white/10 text-white shadow-sm"
                      : "text-white/40 hover:text-white/60"
                  }`}
                >
                  Analytics
                </button>
              </div>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="text-[11px] px-3 py-1.5 rounded-lg border border-red-500/15 text-red-400/60
                             hover:bg-red-500/10 transition-all"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-16 lg:self-start lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto">
            <FilterBar
              search={search}
              onSearchChange={setSearch}
              activeDomains={activeDomains}
              onToggleDomain={toggleDomain}
              activeCapabilities={activeCapabilities}
              onToggleCapability={toggleCapability}
              activeSize={activeSize}
              onToggleSize={setActiveSize}
              totalCount={companies.length}
              filteredCount={filteredCompanies.length}
            />

            {/* Depth legend */}
            <div className="hidden lg:block mt-5 bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
              <h4 className="text-[10px] uppercase tracking-wider text-white/25 font-semibold mb-3">
                Vertical Coverage
              </h4>
              <div className="relative">
                <div className="absolute left-[14px] top-2 bottom-2 w-px depth-line" />
                <div className="space-y-3.5">
                  {DOMAIN_LAYERS.filter((d) => d !== "Cross-Domain").map((domain) => {
                    const count = companiesByDomain.get(domain)?.length ?? 0;
                    const color = DOMAIN_COLORS[domain];
                    return (
                      <div key={domain} className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-white/[0.04] flex items-center justify-center relative z-10 border border-white/[0.06]">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color, opacity: 0.8 }} />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-white/55">{domain}</span>
                          <span className="text-[10px] text-white/25">({count})</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div>
            {viewMode === "stats" ? (
              <StatsBar companies={filteredCompanies} />
            ) : (
              <div className="space-y-6">
                {/* Orbit → Seabed scale */}
                <div className="hidden sm:flex items-center gap-3 text-[10px] text-white/25 uppercase tracking-[0.2em] font-medium">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3 h-3 text-indigo-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                    </svg>
                    Orbit
                  </span>
                  <div className="flex-1 h-px bg-gradient-to-r from-indigo-500/30 via-green-500/20 to-blue-600/30" />
                  <span className="flex items-center gap-1.5">
                    Seabed
                    <svg className="w-3 h-3 text-blue-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                    </svg>
                  </span>
                </div>

                {DOMAIN_LAYERS.map((domain) => {
                  const domainCompanies = companiesByDomain.get(domain) ?? [];
                  if (
                    activeDomains.size > 0 &&
                    !activeDomains.has(domain) &&
                    domainCompanies.length === 0
                  ) {
                    return null;
                  }
                  return (
                    <DomainLane
                      key={domain}
                      domain={domain}
                      companies={domainCompanies}
                      onCompanyClick={setSelectedCompany}
                      icon={getDomainIcon(domain)}
                    />
                  );
                })}

                {filteredCompanies.length === 0 && (
                  <div className="text-center py-20">
                    <p className="text-white/30 text-lg mb-2">No companies found</p>
                    <p className="text-white/20 text-sm">
                      Try adjusting your filters or search terms
                    </p>
                    <button
                      onClick={clearFilters}
                      className="mt-4 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] mt-16 py-8">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 text-center">
          <p className="text-xs text-white/20">
            Spatial Horizon — Mapping the spatial data ecosystem from orbit to ocean floor
          </p>
          <p className="text-[10px] text-white/10 mt-1">
            Data is illustrative. Company information sourced from public records.
          </p>
        </div>
      </footer>

      {/* Detail modal */}
      {selectedCompany && (
        <CompanyDetail
          company={selectedCompany}
          onClose={() => setSelectedCompany(null)}
        />
      )}
    </div>
  );
}
