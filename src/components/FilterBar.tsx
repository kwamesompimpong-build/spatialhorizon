"use client";

import { useState } from "react";
import {
  DomainLayer,
  Capability,
  CompanySize,
  SensorType,
  DOMAIN_LAYERS,
  CAPABILITIES,
  SENSOR_TYPES,
  DOMAIN_COLORS,
  SENSOR_TYPE_COLORS,
} from "@/data/types";

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  activeDomains: Set<DomainLayer>;
  onToggleDomain: (domain: DomainLayer) => void;
  activeCapabilities: Set<Capability>;
  onToggleCapability: (cap: Capability) => void;
  activeSensors: Set<SensorType>;
  onToggleSensor: (sensor: SensorType) => void;
  activeSize: CompanySize | null;
  onToggleSize: (size: CompanySize | null) => void;
  totalCount: number;
  filteredCount: number;
}

export default function FilterBar({
  search,
  onSearchChange,
  activeDomains,
  onToggleDomain,
  activeCapabilities,
  onToggleCapability,
  activeSensors,
  onToggleSensor,
  activeSize,
  onToggleSize,
  totalCount,
  filteredCount,
}: FilterBarProps) {
  const [showAllSensors, setShowAllSensors] = useState(false);
  const sizes: CompanySize[] = ["Enterprise", "Growth", "Startup"];

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search companies, capabilities, tags..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm
                     text-white placeholder-white/30 focus:outline-none focus:border-white/20
                     focus:bg-white/[0.07] transition-colors"
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 text-xs"
          >
            Clear
          </button>
        )}
      </div>

      {/* Domain filters */}
      <div>
        <h4 className="text-[10px] uppercase tracking-wider text-white/30 font-semibold mb-2">
          Domain Layer
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {DOMAIN_LAYERS.map((domain) => {
            const isActive = activeDomains.has(domain);
            const color = DOMAIN_COLORS[domain];
            return (
              <button
                key={domain}
                onClick={() => onToggleDomain(domain)}
                className="text-xs px-3 py-1.5 rounded-lg border transition-all duration-150"
                style={{
                  backgroundColor: isActive ? `${color}20` : "transparent",
                  borderColor: isActive ? `${color}50` : "rgba(255,255,255,0.1)",
                  color: isActive ? color : "rgba(255,255,255,0.5)",
                }}
              >
                {domain}
              </button>
            );
          })}
        </div>
      </div>

      {/* Capability filters */}
      <div>
        <h4 className="text-[10px] uppercase tracking-wider text-white/30 font-semibold mb-2">
          Capability
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {CAPABILITIES.map((cap) => {
            const isActive = activeCapabilities.has(cap);
            return (
              <button
                key={cap}
                onClick={() => onToggleCapability(cap)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-150 ${
                  isActive
                    ? "bg-white/10 border-white/30 text-white"
                    : "bg-transparent border-white/10 text-white/50 hover:border-white/20"
                }`}
              >
                {cap}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sensor type filters */}
      <div>
        <h4 className="text-[10px] uppercase tracking-wider text-white/30 font-semibold mb-2 flex items-center gap-2">
          <svg className="w-3 h-3 text-cyan-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.788m13.788 0c3.808 3.808 3.808 9.98 0 13.788" />
          </svg>
          Sensor Data
          {activeSensors.size > 0 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400/80">
              {activeSensors.size}
            </span>
          )}
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {(showAllSensors ? SENSOR_TYPES : SENSOR_TYPES.slice(0, 8)).map((sensor) => {
            const isActive = activeSensors.has(sensor);
            const color = SENSOR_TYPE_COLORS[sensor];
            return (
              <button
                key={sensor}
                onClick={() => onToggleSensor(sensor)}
                className="text-[10px] px-2.5 py-1 rounded-lg border transition-all duration-150 flex items-center gap-1.5"
                style={{
                  backgroundColor: isActive ? `${color}20` : "transparent",
                  borderColor: isActive ? `${color}50` : "rgba(255,255,255,0.08)",
                  color: isActive ? color : "rgba(255,255,255,0.45)",
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: color, opacity: isActive ? 1 : 0.5 }}
                />
                {sensor}
              </button>
            );
          })}
          {!showAllSensors && SENSOR_TYPES.length > 8 && (
            <button
              onClick={() => setShowAllSensors(true)}
              className="text-[10px] px-2.5 py-1 rounded-lg border border-white/[0.06] text-white/30 hover:text-white/50 hover:border-white/15 transition-all"
            >
              +{SENSOR_TYPES.length - 8} more
            </button>
          )}
          {showAllSensors && (
            <button
              onClick={() => setShowAllSensors(false)}
              className="text-[10px] px-2.5 py-1 rounded-lg border border-white/[0.06] text-white/30 hover:text-white/50 hover:border-white/15 transition-all"
            >
              Show less
            </button>
          )}
        </div>
      </div>

      {/* Size + Count */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {sizes.map((s) => (
            <button
              key={s}
              onClick={() => onToggleSize(activeSize === s ? null : s)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-150 ${
                activeSize === s
                  ? "bg-white/10 border-white/30 text-white"
                  : "bg-transparent border-white/10 text-white/50 hover:border-white/20"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <span className="text-xs text-white/30">
          {filteredCount === totalCount
            ? `${totalCount} companies`
            : `${filteredCount} of ${totalCount} companies`}
        </span>
      </div>
    </div>
  );
}
