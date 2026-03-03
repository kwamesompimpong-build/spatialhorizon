"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface LiveFinancialData {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  dayHigh: number;
  dayLow: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  currency: string;
}

interface FinancialDataState {
  data: Record<string, LiveFinancialData>;
  loading: boolean;
  error: string | null;
}

const globalCache: Record<string, { data: LiveFinancialData; timestamp: number }> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function useFinancialData(tickers: string[]): FinancialDataState {
  const [state, setState] = useState<FinancialDataState>({
    data: {},
    loading: false,
    error: null,
  });
  const fetchedRef = useRef<string>("");

  const fetchData = useCallback(async (tickerList: string[]) => {
    if (tickerList.length === 0) return;

    // Check which tickers need fetching
    const now = Date.now();
    const cached: Record<string, LiveFinancialData> = {};
    const toFetch: string[] = [];

    for (const t of tickerList) {
      const c = globalCache[t];
      if (c && now - c.timestamp < CACHE_TTL) {
        cached[t] = c.data;
      } else {
        toFetch.push(t);
      }
    }

    if (Object.keys(cached).length > 0) {
      setState((prev) => ({ ...prev, data: { ...prev.data, ...cached } }));
    }

    if (toFetch.length === 0) return;

    setState((prev) => ({ ...prev, loading: true }));

    try {
      // Batch into groups of 10
      const batches: string[][] = [];
      for (let i = 0; i < toFetch.length; i += 10) {
        batches.push(toFetch.slice(i, i + 10));
      }

      for (const batch of batches) {
        const res = await fetch(`/api/finance?tickers=${batch.join(",")}`);
        if (!res.ok) continue;

        const results: Record<string, LiveFinancialData | { error: string }> = await res.json();

        const validData: Record<string, LiveFinancialData> = {};
        for (const [ticker, val] of Object.entries(results)) {
          if (val && "price" in val && typeof val.price === "number") {
            validData[ticker] = val as LiveFinancialData;
            globalCache[ticker] = { data: val as LiveFinancialData, timestamp: Date.now() };
          }
        }

        setState((prev) => ({
          ...prev,
          data: { ...prev.data, ...validData },
        }));
      }

      setState((prev) => ({ ...prev, loading: false, error: null }));
    } catch {
      setState((prev) => ({ ...prev, loading: false, error: "Failed to fetch financial data" }));
    }
  }, []);

  useEffect(() => {
    const key = tickers.sort().join(",");
    if (key === fetchedRef.current || tickers.length === 0) return;
    fetchedRef.current = key;
    fetchData(tickers);
  }, [tickers, fetchData]);

  return state;
}

export function formatMarketCap(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(0)}M`;
  return `$${value.toLocaleString()}`;
}

export function formatPrice(value: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatVolume(value: number): string {
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(0)}K`;
  return value.toString();
}
