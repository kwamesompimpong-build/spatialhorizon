import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function checkAdmin(request: NextRequest): boolean {
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${process.env.ADMIN_KEY}`;
}

export async function GET(request: NextRequest) {
  if (!checkAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "pending";

  const submissions = await prisma.companySubmission.findMany({
    where: { status },
    orderBy: { createdAt: "desc" },
  });

  const parsed = submissions.map((s) => ({
    ...s,
    capabilities: JSON.parse(s.capabilities),
    sensorTypes: JSON.parse(s.sensorTypes),
    tags: JSON.parse(s.tags),
  }));

  return NextResponse.json(parsed);
}
