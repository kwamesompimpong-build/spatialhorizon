"use client";

import { useState } from "react";
import { DOMAIN_LAYERS, CAPABILITIES, SENSOR_TYPES } from "@/data/types";
import type { DomainLayer, Capability, SensorType, CompanySize } from "@/data/types";

export default function SubmitPage() {
  const [form, setForm] = useState({
    name: "",
    domain: "Space" as DomainLayer,
    capabilities: [] as Capability[],
    sensorTypes: [] as SensorType[],
    description: "",
    founded: "",
    hq: "",
    size: "Growth" as CompanySize,
    tags: "",
    website: "",
    ticker: "",
    exchange: "",
    totalRaised: "",
    lastRound: "",
    valuation: "",
    marketCap: "",
    submitterName: "",
    submitterEmail: "",
    reason: "",
    companyId: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const toggleArray = <T extends string>(arr: T[], val: T): T[] =>
    arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];

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
        setForm({
          name: "", domain: "Space", capabilities: [], sensorTypes: [], description: "",
          founded: "", hq: "", size: "Growth", tags: "", website: "", ticker: "", exchange: "",
          totalRaised: "", lastRound: "", valuation: "", marketCap: "",
          submitterName: "", submitterEmail: "", reason: "", companyId: "",
        });
      } else {
        setResult({ success: false, message: data.error || "Submission failed" });
      }
    } catch {
      setResult({ success: false, message: "Network error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen px-4 py-12 max-w-3xl mx-auto">
      <a href="/" className="text-indigo-400 hover:text-indigo-300 text-sm mb-6 inline-block">&larr; Back to Market Map</a>
      <h1 className="text-3xl font-bold mb-2">Submit a Company</h1>
      <p className="text-slate-400 mb-8">Add a new company or suggest a correction to an existing entry.</p>

      {result && (
        <div className={`mb-6 p-4 rounded-lg border ${result.success ? "border-green-500/30 bg-green-500/10 text-green-300" : "border-red-500/30 bg-red-500/10 text-red-300"}`}>
          {result.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Correction ID */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Existing Company ID (leave blank for new company)</label>
          <input
            type="text"
            value={form.companyId}
            onChange={(e) => setForm({ ...form, companyId: e.target.value })}
            className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            placeholder="e.g. planet-labs (for corrections only)"
          />
        </div>

        {/* Company Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Company Name *</label>
            <input required type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Domain *</label>
            <select value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value as DomainLayer })}
              className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none">
              {DOMAIN_LAYERS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Description *</label>
          <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3} className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">HQ *</label>
            <input required type="text" value={form.hq} onChange={(e) => setForm({ ...form, hq: e.target.value })}
              className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              placeholder="City, State/Country" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Founded</label>
            <input type="number" value={form.founded} onChange={(e) => setForm({ ...form, founded: e.target.value })}
              className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              placeholder="e.g. 2020" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Size *</label>
            <select value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value as CompanySize })}
              className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none">
              <option value="Startup">Startup</option>
              <option value="Growth">Growth</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Website *</label>
          <input required type="url" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })}
            className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            placeholder="https://..." />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Tags (comma-separated)</label>
          <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
            className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
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
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                placeholder="e.g. PL" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Exchange</label>
              <input type="text" value={form.exchange} onChange={(e) => setForm({ ...form, exchange: e.target.value })}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                placeholder="e.g. NYSE" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Total Raised</label>
              <input type="text" value={form.totalRaised} onChange={(e) => setForm({ ...form, totalRaised: e.target.value })}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                placeholder="e.g. ~$500M" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Last Round</label>
              <input type="text" value={form.lastRound} onChange={(e) => setForm({ ...form, lastRound: e.target.value })}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                placeholder="e.g. Series C" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Valuation</label>
              <input type="text" value={form.valuation} onChange={(e) => setForm({ ...form, valuation: e.target.value })}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                placeholder="e.g. ~$1B" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Market Cap</label>
              <input type="text" value={form.marketCap} onChange={(e) => setForm({ ...form, marketCap: e.target.value })}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                placeholder="e.g. ~$8.5B" />
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
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email *</label>
              <input required type="email" value={form.submitterEmail} onChange={(e) => setForm({ ...form, submitterEmail: e.target.value })}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-300 mb-1">Reason / Notes</label>
            <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}
              rows={2} className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              placeholder="Why are you submitting this?" />
          </div>
        </div>

        <button type="submit" disabled={submitting}
          className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors">
          {submitting ? "Submitting..." : "Submit for Review"}
        </button>
      </form>
    </div>
  );
}
