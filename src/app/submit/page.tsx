"use client";

import { useState } from "react";
import { DOMAIN_LAYERS, CAPABILITIES, SENSOR_TYPES } from "@/data/types";
import type { DomainLayer, Capability, SensorType, CompanySize } from "@/data/types";

interface FormState {
  name: string;
  domain: DomainLayer;
  capabilities: Capability[];
  sensorTypes: SensorType[];
  description: string;
  founded: string;
  hq: string;
  size: CompanySize;
  tags: string;
  website: string;
  ticker: string;
  exchange: string;
  totalRaised: string;
  lastRound: string;
  valuation: string;
  marketCap: string;
  submitterName: string;
  submitterEmail: string;
  reason: string;
  companyId: string;
}

const EMPTY_FORM: FormState = {
  name: "", domain: "Space", capabilities: [], sensorTypes: [], description: "",
  founded: "", hq: "", size: "Growth", tags: "", website: "", ticker: "", exchange: "",
  totalRaised: "", lastRound: "", valuation: "", marketCap: "",
  submitterName: "", submitterEmail: "", reason: "", companyId: "",
};

export default function SubmitPage() {
  const [url, setUrl] = useState("");
  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM });
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  const toggleArray = <T extends string>(arr: T[], val: T): T[] =>
    arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];

  async function handleAnalyze() {
    if (!url.trim()) return;
    setAnalyzing(true);
    setAnalyzeError(null);
    setResult(null);

    try {
      const res = await fetch("/api/companies/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setAnalyzeError(data.error || "Failed to analyze website");
        return;
      }

      setForm({
        ...EMPTY_FORM,
        name: data.name || "",
        domain: data.domain || "Space",
        capabilities: Array.isArray(data.capabilities) ? data.capabilities : [],
        sensorTypes: Array.isArray(data.sensorTypes) ? data.sensorTypes : [],
        description: data.description || "",
        founded: data.founded ? String(data.founded) : "",
        hq: data.hq || "",
        size: data.size || "Growth",
        tags: Array.isArray(data.tags) ? data.tags.join(", ") : "",
        website: data.website || url.trim(),
        ticker: data.ticker || "",
        exchange: data.exchange || "",
      });

      setAnalyzed(true);
    } catch {
      setAnalyzeError("Network error — could not reach the server");
    } finally {
      setAnalyzing(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);

    try {
      const res = await fetch("/api/companies/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
          companyId: form.companyId || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setResult({ success: true, message: "Submission received! It will be reviewed by an admin." });
        setForm({ ...EMPTY_FORM });
        setUrl("");
        setAnalyzed(false);
      } else {
        setResult({ success: false, message: data.error || "Submission failed" });
      }
    } catch {
      setResult({ success: false, message: "Network error" });
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = "w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none";

  return (
    <div className="min-h-screen px-4 py-12 max-w-3xl mx-auto">
      <a href="/" className="text-indigo-400 hover:text-indigo-300 text-sm mb-6 inline-block">&larr; Back to Market Map</a>
      <h1 className="text-3xl font-bold mb-2">Submit a Company</h1>
      <p className="text-slate-400 mb-8">
        Paste a company website link and we&apos;ll extract the details automatically.
      </p>

      {result && (
        <div className={`mb-6 p-4 rounded-lg border ${result.success ? "border-green-500/30 bg-green-500/10 text-green-300" : "border-red-500/30 bg-red-500/10 text-red-300"}`}>
          {result.message}
        </div>
      )}

      {/* ── URL Input ── */}
      <div className="mb-8 p-6 rounded-xl border border-indigo-500/20 bg-indigo-500/[0.04]">
        <label className="block text-sm font-semibold text-white mb-2">
          Company Website URL
        </label>
        <div className="flex gap-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAnalyze(); } }}
            className={`${inputClass} flex-1`}
            placeholder="https://example.com"
          />
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={analyzing || !url.trim()}
            className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed
                       font-semibold text-sm transition-colors whitespace-nowrap flex items-center gap-2"
          >
            {analyzing ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analyzing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Analyze
              </>
            )}
          </button>
        </div>
        <p className="text-[11px] text-slate-500 mt-2">
          We&apos;ll scan the site to extract company name, description, domain, capabilities, and more.
        </p>
        {analyzeError && (
          <div className="mt-3 p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-red-300 text-sm">
            {analyzeError}
          </div>
        )}
      </div>

      {/* ── Auto-populated Form ── */}
      {analyzed && (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm text-green-400/80 font-medium">
              Auto-populated — review and adjust before submitting
            </span>
          </div>

          {/* Correction ID */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Existing Company ID (leave blank for new company)</label>
            <input
              type="text"
              value={form.companyId}
              onChange={(e) => setForm({ ...form, companyId: e.target.value })}
              className={inputClass}
              placeholder="e.g. planet-labs (for corrections only)"
            />
          </div>

          {/* Company Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Company Name *</label>
              <input required type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Domain *</label>
              <select value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value as DomainLayer })}
                className={inputClass}>
                {DOMAIN_LAYERS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Description *</label>
            <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3} className={inputClass} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">HQ *</label>
              <input required type="text" value={form.hq} onChange={(e) => setForm({ ...form, hq: e.target.value })}
                className={inputClass}
                placeholder="City, State/Country" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Founded</label>
              <input type="number" value={form.founded} onChange={(e) => setForm({ ...form, founded: e.target.value })}
                className={inputClass}
                placeholder="e.g. 2020" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Size *</label>
              <select value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value as CompanySize })}
                className={inputClass}>
                <option value="Startup">Startup</option>
                <option value="Growth">Growth</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Website *</label>
            <input required type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })}
              className={inputClass}
              placeholder="https://..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Tags (comma-separated)</label>
            <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className={inputClass}
              placeholder="e.g. SAR, defense, AI" />
          </div>

          {/* Capabilities */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Capabilities</label>
            <div className="flex flex-wrap gap-2">
              {CAPABILITIES.map((cap) => (
                <button key={cap} type="button"
                  onClick={() => setForm({ ...form, capabilities: toggleArray(form.capabilities, cap) })}
                  className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                    form.capabilities.includes(cap)
                      ? "bg-indigo-500/20 border-indigo-500 text-indigo-300"
                      : "bg-slate-800/40 border-slate-700 text-slate-400 hover:border-slate-500"
                  }`}>
                  {cap}
                </button>
              ))}
            </div>
          </div>

          {/* Sensor Types */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Sensor Types</label>
            <div className="flex flex-wrap gap-2">
              {SENSOR_TYPES.map((sensor) => (
                <button key={sensor} type="button"
                  onClick={() => setForm({ ...form, sensorTypes: toggleArray(form.sensorTypes, sensor) })}
                  className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                    form.sensorTypes.includes(sensor)
                      ? "bg-cyan-500/20 border-cyan-500 text-cyan-300"
                      : "bg-slate-800/40 border-slate-700 text-slate-400 hover:border-slate-500"
                  }`}>
                  {sensor}
                </button>
              ))}
            </div>
          </div>

          {/* Financial Info */}
          <div className="border-t border-slate-700/50 pt-6">
            <h3 className="text-lg font-semibold mb-4">Financial Info (optional)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Ticker</label>
                <input type="text" value={form.ticker} onChange={(e) => setForm({ ...form, ticker: e.target.value })}
                  className={inputClass} placeholder="e.g. PL" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Exchange</label>
                <input type="text" value={form.exchange} onChange={(e) => setForm({ ...form, exchange: e.target.value })}
                  className={inputClass} placeholder="e.g. NYSE" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Total Raised</label>
                <input type="text" value={form.totalRaised} onChange={(e) => setForm({ ...form, totalRaised: e.target.value })}
                  className={inputClass} placeholder="e.g. ~$500M" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Last Round</label>
                <input type="text" value={form.lastRound} onChange={(e) => setForm({ ...form, lastRound: e.target.value })}
                  className={inputClass} placeholder="e.g. Series C" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Valuation</label>
                <input type="text" value={form.valuation} onChange={(e) => setForm({ ...form, valuation: e.target.value })}
                  className={inputClass} placeholder="e.g. ~$1B" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Market Cap</label>
                <input type="text" value={form.marketCap} onChange={(e) => setForm({ ...form, marketCap: e.target.value })}
                  className={inputClass} placeholder="e.g. ~$8.5B" />
              </div>
            </div>
          </div>

          {/* Submitter Info */}
          <div className="border-t border-slate-700/50 pt-6">
            <h3 className="text-lg font-semibold mb-4">Your Info</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Name *</label>
                <input required type="text" value={form.submitterName} onChange={(e) => setForm({ ...form, submitterName: e.target.value })}
                  className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email *</label>
                <input required type="email" value={form.submitterEmail} onChange={(e) => setForm({ ...form, submitterEmail: e.target.value })}
                  className={inputClass} />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-slate-300 mb-1">Reason / Notes</label>
              <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}
                rows={2} className={inputClass}
                placeholder="Why are you submitting this?" />
            </div>
          </div>

          <button type="submit" disabled={submitting}
            className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors">
            {submitting ? "Submitting..." : "Submit for Review"}
          </button>
        </form>
      )}

      {/* Manual entry toggle */}
      {!analyzed && (
        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => setAnalyzed(true)}
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors underline underline-offset-4"
          >
            Or fill in details manually
          </button>
        </div>
      )}
    </div>
  );
}
