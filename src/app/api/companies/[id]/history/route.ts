import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const snapshots = await prisma.priceSnapshot.findMany({
    where: { companyId: id },
    orderBy: { snapshotDate: "asc" },
    select: {
      snapshotDate: true,
      price: true,
      marketCap: true,
      volume: true,
      change: true,
      changePercent: true,
      dayHigh: true,
      dayLow: true,
      currency: true,
    },
  });

  return NextResponse.json(snapshots);
}
