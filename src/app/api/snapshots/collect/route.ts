import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST /api/snapshots/collect — collect price snapshots for all public companies
// Protected by ADMIN_KEY; designed to be called by a cron job
export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.ADMIN_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get all companies with tickers
  const companies = await prisma.company.findMany({
    where: { ticker: { not: null }, status: "approved" },
    select: { id: true, ticker: true },
  });

  if (companies.length === 0) {
    return NextResponse.json({ message: "No public companies to snapshot" });
  }

  const tickers = companies.filter((c) => c.ticker).map((c) => c.ticker!);
  const tickerToCompany = new Map(companies.filter((c) => c.ticker).map((c) => [c.ticker!, c.id]));

  // Fetch in batches of 10
  let saved = 0;
  let failed = 0;

  for (let i = 0; i < tickers.length; i += 10) {
    const batch = tickers.slice(i, i + 10);

    const fetchPromises = batch.map(async (ticker) => {
      try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=5d`;
        const response = await fetch(url, {
          headers: { "User-Agent": "Mozilla/5.0" },
          signal: AbortSignal.timeout(8000),
        });

        if (!response.ok) return null;

        const data = await response.json();
        const result = data?.chart?.result?.[0];
        if (!result?.meta) return null;

        const meta = result.meta;
        const price = meta.regularMarketPrice ?? 0;
        const prevClose = meta.previousClose ?? price;
        const change = price - prevClose;
        const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;

        const quotes = result.indicators?.quote?.[0];
        const volumes = quotes?.volume?.filter((v: number | null) => v !== null) ?? [];
        const highs = quotes?.high?.filter((v: number | null) => v !== null) ?? [];
        const lows = quotes?.low?.filter((v: number | null) => v !== null) ?? [];

        const companyId = tickerToCompany.get(ticker);
        if (!companyId) return null;

        await prisma.priceSnapshot.create({
          data: {
            companyId,
            ticker,
            price,
            change: Math.round(change * 100) / 100,
            changePercent: Math.round(changePercent * 100) / 100,
            marketCap: meta.marketCap ?? 0,
            volume: volumes.length > 0 ? volumes[volumes.length - 1] : 0,
            dayHigh: highs.length > 0 ? highs[highs.length - 1] : price,
            dayLow: lows.length > 0 ? lows[lows.length - 1] : price,
            currency: meta.currency ?? "USD",
          },
        });

        saved++;
      } catch {
        failed++;
      }
    });

    await Promise.allSettled(fetchPromises);
  }

  return NextResponse.json({
    message: `Snapshot complete: ${saved} saved, ${failed} failed out of ${tickers.length} tickers`,
    saved,
    failed,
    total: tickers.length,
  });
}
