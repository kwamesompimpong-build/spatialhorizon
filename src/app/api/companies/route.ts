import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await prisma.company.findMany({
    where: { status: "approved" },
    orderBy: { name: "asc" },
  });

  const companies = rows.map((r) => ({
    id: r.id,
    name: r.name,
    domain: r.domain,
    capabilities: JSON.parse(r.capabilities),
    sensorTypes: JSON.parse(r.sensorTypes),
    description: r.description,
    founded: r.founded,
    hq: r.hq,
    size: r.size,
    tags: JSON.parse(r.tags),
    website: r.website,
    financial: r.ticker ? { ticker: r.ticker, exchange: r.exchange! } : undefined,
    funding:
      r.totalRaised || r.lastRound || r.valuation || r.acquiredPrice
        ? {
            totalRaised: r.totalRaised ?? undefined,
            lastRound: r.lastRound ?? undefined,
            valuation: r.valuation ?? undefined,
            acquiredPrice: r.acquiredPrice ?? undefined,
          }
        : undefined,
    marketCap: r.marketCap ?? undefined,
  }));

  return NextResponse.json(companies, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
  });
}
