import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function checkAdmin(request: NextRequest): boolean {
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${process.env.ADMIN_KEY}`;
}

// PATCH /api/admin/submissions/[id] — approve or reject
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { action, reviewNote } = body as { action: "approve" | "reject"; reviewNote?: string };

  if (!["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const submission = await prisma.companySubmission.findUnique({ where: { id } });
  if (!submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }

  if (submission.status !== "pending") {
    return NextResponse.json({ error: "Submission already reviewed" }, { status: 400 });
  }

  if (action === "approve") {
    const companyId = submission.companyId || submission.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    if (submission.companyId) {
      // Update existing company
      await prisma.company.update({
        where: { id: submission.companyId },
        data: {
          name: submission.name,
          domain: submission.domain,
          capabilities: submission.capabilities,
          sensorTypes: submission.sensorTypes,
          description: submission.description,
          founded: submission.founded,
          hq: submission.hq,
          size: submission.size,
          tags: submission.tags,
          website: submission.website,
          ticker: submission.ticker,
          exchange: submission.exchange,
          totalRaised: submission.totalRaised,
          lastRound: submission.lastRound,
          valuation: submission.valuation,
          marketCap: submission.marketCap,
        },
      });
    } else {
      // Create new company
      await prisma.company.create({
        data: {
          id: companyId,
          name: submission.name,
          domain: submission.domain,
          capabilities: submission.capabilities,
          sensorTypes: submission.sensorTypes,
          description: submission.description,
          founded: submission.founded,
          hq: submission.hq,
          size: submission.size,
          tags: submission.tags,
          website: submission.website,
          ticker: submission.ticker,
          exchange: submission.exchange,
          totalRaised: submission.totalRaised,
          lastRound: submission.lastRound,
          valuation: submission.valuation,
          marketCap: submission.marketCap,
          status: "approved",
        },
      });
    }
  }

  await prisma.companySubmission.update({
    where: { id },
    data: {
      status: action === "approve" ? "approved" : "rejected",
      reviewNote: reviewNote || null,
      reviewedAt: new Date(),
    },
  });

  return NextResponse.json({ success: true, action });
}
