"use client";

import { useState, useEffect, useCallback } from "react";

interface Submission {
  id: string;
  companyId: string | null;
  name: string;
  domain: string;
  capabilities: string[];
  sensorTypes: string[];
  description: string;
  founded: number | null;
  hq: string;
  size: string;
  tags: string[];
  website: string;
  ticker: string | null;
  exchange: string | null;
  totalRaised: string | null;
  lastRound: string | null;
  valuation: string | null;
  marketCap: string | null;
  submitterName: string;
  submitterEmail: string;
  reason: string | null;
  status: string;
  reviewNote: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected">("pending");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/submissions?status=${filter}`, {
        headers: { Authorization: `Bearer ${adminKey}` },
      });
      if (res.status === 401) {
        setAuthenticated(false);
        return;
      }
      const data = await res.json();
      setSubmissions(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [filter, adminKey]);

  useEffect(() => {
    if (authenticated) fetchSubmissions();
  }, [authenticated, filter, fetchSubmissions]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthenticated(true);
  }

  async function handleAction(id: string, action: "approve" | "reject") {
    const reviewNote = action === "reject" ? prompt("Rejection reason (optional):") : null;
    setActionLoading(id);
    try {
      await fetch(`/api/admin/submissions/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminKey}`,
        },
        body: JSON.stringify({ action, reviewNote }),
      });
      fetchSubmissions();
    } catch {
      // ignore
    } finally {
      setActionLoading(null);
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
          <h1 className="text-2xl font-bold text-center">Admin Login</h1>
          <input
            type="password"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            placeholder="Admin key"
            className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
          <button type="submit" className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold transition-colors">
            Login
          </button>
          <a href="/" className="block text-center text-indigo-400 hover:text-indigo-300 text-sm">&larr; Back to Market Map</a>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <a href="/" className="text-indigo-400 hover:text-indigo-300 text-sm mb-2 inline-block">&larr; Back to Market Map</a>
          <h1 className="text-3xl font-bold">Admin — Submissions</h1>
        </div>
        <div className="flex gap-2">
          {(["pending", "approved", "rejected"] as const).map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === s ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : submissions.length === 0 ? (
        <p className="text-slate-500">No {filter} submissions.</p>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => (
            <div key={sub.id} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold">{sub.name}</h3>
                  <div className="flex gap-2 mt-1 text-xs text-slate-400">
                    <span className="px-2 py-0.5 bg-slate-700/50 rounded">{sub.domain}</span>
                    <span className="px-2 py-0.5 bg-slate-700/50 rounded">{sub.size}</span>
                    {sub.companyId && (
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded">Correction: {sub.companyId}</span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-slate-500 text-right">
                  <div>by {sub.submitterName}</div>
                  <div>{sub.submitterEmail}</div>
                  <div>{new Date(sub.createdAt).toLocaleDateString()}</div>
                </div>
              </div>

              <p className="text-sm text-slate-300 mb-3">{sub.description}</p>

              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-400 mb-3">
                <div><span className="text-slate-500">HQ:</span> {sub.hq}</div>
                <div><span className="text-slate-500">Website:</span> {sub.website}</div>
                {sub.founded && <div><span className="text-slate-500">Founded:</span> {sub.founded}</div>}
                {sub.ticker && <div><span className="text-slate-500">Ticker:</span> {sub.ticker} ({sub.exchange})</div>}
                {sub.totalRaised && <div><span className="text-slate-500">Raised:</span> {sub.totalRaised}</div>}
                {sub.valuation && <div><span className="text-slate-500">Valuation:</span> {sub.valuation}</div>}
                {sub.marketCap && <div><span className="text-slate-500">Market Cap:</span> {sub.marketCap}</div>}
              </div>

              {sub.capabilities.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {sub.capabilities.map((c) => (
                    <span key={c} className="px-2 py-0.5 bg-indigo-500/10 text-indigo-300 rounded text-xs">{c}</span>
                  ))}
                </div>
              )}

              {sub.sensorTypes.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {sub.sensorTypes.map((s) => (
                    <span key={s} className="px-2 py-0.5 bg-cyan-500/10 text-cyan-300 rounded text-xs">{s}</span>
                  ))}
                </div>
              )}

              {sub.reason && (
                <p className="text-xs text-slate-500 italic mb-3">Reason: {sub.reason}</p>
              )}

              {sub.reviewNote && (
                <p className="text-xs text-amber-400 mb-3">Review note: {sub.reviewNote}</p>
              )}

              {sub.status === "pending" && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700/50">
                  <button
                    onClick={() => handleAction(sub.id, "approve")}
                    disabled={actionLoading === sub.id}
                    className="px-4 py-1.5 rounded-lg bg-green-600/80 hover:bg-green-500 text-sm font-medium transition-colors disabled:opacity-50">
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(sub.id, "reject")}
                    disabled={actionLoading === sub.id}
                    className="px-4 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-500 text-sm font-medium transition-colors disabled:opacity-50">
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
