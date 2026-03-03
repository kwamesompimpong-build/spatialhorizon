"use client";

import { useEffect, useMemo } from "react";
import { Company, DOMAIN_COLORS, SENSOR_TYPE_COLORS, SensorType } from "@/data/types";
import { useFinancialData, formatPrice, formatVolume } from "@/hooks/useFinancialData";

interface CompanyDetailProps {
  company: Company;
  onClose: () => void;
}

export default function CompanyDetail({ company, onClose }: CompanyDetailProps) {
  const color = DOMAIN_COLORS[company.domain];

  const tickers = useMemo(() => {
    return company.financial ? [company.financial.ticker] : [];
  }, [company.financial]);

  const { data: finData, loading: finLoading } = useFinancialData(tickers);
  const liveData = company.financial ? finData[company.financial.ticker] : null;

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
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#0d0d20] border border-white/10 rounded-2xl shadow-2xl modal-content">
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

          {/* Funding / Valuation / Market Cap */}
          {(company.marketCap || company.funding) && (
            <div className="mb-5 bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
              <h4 className="text-[10px] font-semibold uppercase tracking-wider text-white/25 mb-3 flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-yellow-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {company.marketCap ? "Market Capitalization" : "Funding & Valuation"}
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {company.marketCap && (
                  <div className="col-span-2">
                    <p className="text-[10px] text-white/30">Market Cap</p>
                    <p className="text-lg font-bold text-yellow-400/90">{company.marketCap}</p>
                  </div>
                )}
                {company.funding?.valuation && (
                  <div>
                    <p className="text-[10px] text-white/30">Valuation</p>
                    <p className="text-base font-bold text-purple-400/90">{company.funding.valuation}</p>
                  </div>
                )}
                {company.funding?.totalRaised && (
                  <div>
                    <p className="text-[10px] text-white/30">Total Raised</p>
                    <p className="text-base font-bold text-cyan-400/90">{company.funding.totalRaised}</p>
                  </div>
                )}
                {company.funding?.lastRound && (
                  <div>
                    <p className="text-[10px] text-white/30">Last Round</p>
                    <p className="text-sm text-white/60">{company.funding.lastRound}</p>
                  </div>
                )}
                {company.funding?.acquiredPrice && (
                  <div>
                    <p className="text-[10px] text-white/30">Acquisition Price</p>
                    <p className="text-base font-bold text-orange-400/90">{company.funding.acquiredPrice}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Live Financial Data */}
          {company.financial && (
            <div className="mb-5 bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
              <h4 className="text-[10px] font-semibold uppercase tracking-wider text-white/25 mb-3 flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-green-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                </svg>
                Live Market Data
                <span className="text-[9px] font-mono text-green-400/50">
                  {company.financial.ticker} ({company.financial.exchange})
                </span>
              </h4>
              {finLoading && !liveData ? (
                <div className="flex items-center gap-2 text-white/30 text-xs">
                  <div className="w-3 h-3 border border-white/20 border-t-white/50 rounded-full animate-spin" />
                  Loading market data...
                </div>
              ) : liveData ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-white/30">Price</p>
                    <p className="text-lg font-bold text-white/90">
                      {formatPrice(liveData.price, liveData.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/30">Change</p>
                    <p className={`text-lg font-bold ${liveData.change >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {liveData.change >= 0 ? "+" : ""}{liveData.change.toFixed(2)} ({liveData.changePercent.toFixed(2)}%)
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/30">Day Range</p>
                    <p className="text-xs text-white/60">
                      {formatPrice(liveData.dayLow, liveData.currency)} - {formatPrice(liveData.dayHigh, liveData.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/30">Volume</p>
                    <p className="text-xs text-white/60">{formatVolume(liveData.volume)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] text-white/30">52-Week Range</p>
                    <div className="mt-1 relative h-2 bg-white/[0.06] rounded-full">
                      {liveData.fiftyTwoWeekHigh > liveData.fiftyTwoWeekLow && (
                        <div
                          className="absolute top-0 h-full w-1 rounded-full bg-white/60"
                          style={{
                            left: `${Math.min(100, Math.max(0, ((liveData.price - liveData.fiftyTwoWeekLow) / (liveData.fiftyTwoWeekHigh - liveData.fiftyTwoWeekLow)) * 100))}%`,
                          }}
                        />
                      )}
                    </div>
                    <div className="flex justify-between mt-0.5 text-[9px] text-white/25">
                      <span>{formatPrice(liveData.fiftyTwoWeekLow, liveData.currency)}</span>
                      <span>{formatPrice(liveData.fiftyTwoWeekHigh, liveData.currency)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-white/25">Market data unavailable</p>
              )}
            </div>
          )}

          {/* Sensor Types */}
          {company.sensorTypes.length > 0 && (
            <div className="mb-5">
              <h4 className="text-[10px] font-semibold uppercase tracking-wider text-white/25 mb-2 flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-cyan-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.788m13.788 0c3.808 3.808 3.808 9.98 0 13.788" />
                </svg>
                Sensor Data Types
              </h4>
              <div className="flex flex-wrap gap-2">
                {company.sensorTypes.map((sensor) => (
                  <span
                    key={sensor}
                    className="text-xs px-2.5 py-1 rounded-lg border flex items-center gap-1.5"
                    style={{
                      borderColor: `${SENSOR_TYPE_COLORS[sensor as SensorType]}30`,
                      backgroundColor: `${SENSOR_TYPE_COLORS[sensor as SensorType]}10`,
                      color: SENSOR_TYPE_COLORS[sensor as SensorType],
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: SENSOR_TYPE_COLORS[sensor as SensorType] }}
                    />
                    {sensor}
                  </span>
                ))}
              </div>
            </div>
          )}

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
