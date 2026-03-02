"use client";

import { useState, useMemo, useCallback } from "react";
import { companies } from "@/data/companies";
import {
  Company,
  DomainLayer,
  Capability,
  CompanySize,
  DOMAIN_LAYERS,
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
      <header className="border-b border-white/5 bg-[#0a0a1a]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Spatial Horizon
              </h1>
              <p className="text-xs sm:text-sm text-white/40 mt-0.5">
                Market map — Space to Seabed
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("map")}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                  viewMode === "map"
                    ? "bg-white/10 border-white/20 text-white"
                    : "border-white/10 text-white/40 hover:text-white/60"
                }`}
              >
                Market Map
              </button>
              <button
                onClick={() => setViewMode("stats")}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                  viewMode === "stats"
                    ? "bg-white/10 border-white/20 text-white"
                    : "border-white/10 text-white/40 hover:text-white/60"
                }`}
              >
                Analytics
              </button>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs px-3 py-1.5 rounded-lg border border-red-500/20 text-red-400/70
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
        {/* Vertical depth indicator */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Sidebar — Filters */}
          <aside className="lg:sticky lg:top-20 lg:self-start">
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
            <div className="hidden lg:block mt-6 bg-white/[0.03] border border-white/10 rounded-xl p-4">
              <h4 className="text-[10px] uppercase tracking-wider text-white/30 font-semibold mb-3">
                Vertical Coverage
              </h4>
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-[14px] top-2 bottom-2 w-px bg-gradient-to-b from-indigo-500 via-cyan-500 via-green-500 via-blue-500 to-blue-800" />
                <div className="space-y-3">
                  {DOMAIN_LAYERS.filter((d) => d !== "Cross-Domain").map(
                    (domain) => {
                      const count = companiesByDomain.get(domain)?.length ?? 0;
                      return (
                        <div key={domain} className="flex items-center gap-3 pl-0">
                          <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center relative z-10">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: `var(--tw-gradient-stops)` }}>
                              <div className="w-2 h-2 rounded-full bg-current" />
                            </div>
                          </div>
                          <div>
                            <span className="text-xs text-white/60">{domain}</span>
                            <span className="text-[10px] text-white/30 ml-1.5">
                              ({count})
                            </span>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div>
            {viewMode === "stats" ? (
              <StatsBar companies={filteredCompanies} />
            ) : (
              <div className="space-y-10">
                {/* Depth scale visual bar */}
                <div className="hidden sm:flex items-center gap-2 text-[10px] text-white/30 uppercase tracking-widest">
                  <span>Orbit</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-indigo-500/40 via-green-500/40 to-blue-800/40" />
                  <span>Seabed</span>
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
      <footer className="border-t border-white/5 mt-16 py-8">
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
