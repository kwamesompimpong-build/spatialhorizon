import { NextRequest, NextResponse } from "next/server";

interface YahooChartResult {
  chart?: {
    result?: Array<{
      meta?: {
        regularMarketPrice?: number;
        previousClose?: number;
        currency?: string;
        fiftyTwoWeekHigh?: number;
        fiftyTwoWeekLow?: number;
      };
      indicators?: {
        quote?: Array<{
          volume?: (number | null)[];
          high?: (number | null)[];
          low?: (number | null)[];
        }>;
      };
    }>;
  };
}

const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tickers = searchParams.get("tickers");

  if (!tickers) {
    return NextResponse.json({ error: "Missing tickers parameter" }, { status: 400 });
  }

  const tickerList = tickers.split(",").slice(0, 20); // Limit to 20 tickers
  const results: Record<string, unknown> = {};

  const fetchPromises = tickerList.map(async (ticker) => {
    const trimmed = ticker.trim();
    if (!trimmed) return;

    // Check cache
    const cached = cache.get(trimmed);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      results[trimmed] = cached.data;
      return;
    }

    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(trimmed)}?interval=1d&range=5d`;
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        results[trimmed] = { error: "Failed to fetch", status: response.status };
        return;
      }

      const data: YahooChartResult = await response.json();
      const result = data?.chart?.result?.[0];

      if (!result?.meta) {
        results[trimmed] = { error: "No data available" };
        return;
      }

      const meta = result.meta;
      const price = meta.regularMarketPrice ?? 0;
      const prevClose = meta.previousClose ?? price;
      const change = price - prevClose;
      const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;

      const quotes = result.indicators?.quote?.[0];
      const volumes = quotes?.volume?.filter((v): v is number => v !== null) ?? [];
      const highs = quotes?.high?.filter((v): v is number => v !== null) ?? [];
      const lows = quotes?.low?.filter((v): v is number => v !== null) ?? [];

      const latestVolume = volumes.length > 0 ? volumes[volumes.length - 1] : 0;
      const dayHigh = highs.length > 0 ? highs[highs.length - 1] : price;
      const dayLow = lows.length > 0 ? lows[lows.length - 1] : price;

      const financialData = {
        ticker: trimmed,
        price,
        change: Math.round(change * 100) / 100,
        changePercent: Math.round(changePercent * 100) / 100,
        volume: latestVolume,
        dayHigh,
        dayLow,
        fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh ?? 0,
        fiftyTwoWeekLow: meta.fiftyTwoWeekLow ?? 0,
        currency: meta.currency ?? "USD",
      };

      cache.set(trimmed, { data: financialData, timestamp: Date.now() });
      results[trimmed] = financialData;
    } catch {
      results[trimmed] = { error: "Request failed" };
    }
  });

  await Promise.allSettled(fetchPromises);

  return NextResponse.json(results, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
