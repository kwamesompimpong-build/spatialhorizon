import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { DOMAIN_LAYERS, CAPABILITIES, SENSOR_TYPES } from "@/data/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, domain, capabilities, sensorTypes, description, founded, hq, size, tags, website,
      ticker, exchange, totalRaised, lastRound, valuation, marketCap,
      submitterName, submitterEmail, reason, companyId } = body;

    // Validate required fields
    if (!name || !domain || !description || !hq || !size || !website || !submitterName || !submitterEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!DOMAIN_LAYERS.includes(domain)) {
      return NextResponse.json({ error: "Invalid domain" }, { status: 400 });
    }

    if (!["Startup", "Growth", "Enterprise"].includes(size)) {
      return NextResponse.json({ error: "Invalid company size" }, { status: 400 });
    }

    const capArr = Array.isArray(capabilities) ? capabilities : [];
    const sensorArr = Array.isArray(sensorTypes) ? sensorTypes : [];
    const tagArr = Array.isArray(tags) ? tags : [];

    for (const cap of capArr) {
      if (!CAPABILITIES.includes(cap)) {
        return NextResponse.json({ error: `Invalid capability: ${cap}` }, { status: 400 });
      }
    }

    for (const sensor of sensorArr) {
      if (!SENSOR_TYPES.includes(sensor)) {
        return NextResponse.json({ error: `Invalid sensor type: ${sensor}` }, { status: 400 });
      }
    }

    // If this is a correction, verify the company exists
    if (companyId) {
      const existing = await prisma.company.findUnique({ where: { id: companyId } });
      if (!existing) {
        return NextResponse.json({ error: "Company not found for correction" }, { status: 404 });
      }
    }

    const submission = await prisma.companySubmission.create({
      data: {
        companyId: companyId || null,
        name,
        domain,
        capabilities: JSON.stringify(capArr),
        sensorTypes: JSON.stringify(sensorArr),
        description,
        founded: founded ? parseInt(founded, 10) : null,
        hq,
        size,
        tags: JSON.stringify(tagArr),
        website,
        ticker: ticker || null,
        exchange: exchange || null,
        totalRaised: totalRaised || null,
        lastRound: lastRound || null,
        valuation: valuation || null,
        marketCap: marketCap || null,
        submitterName,
        submitterEmail,
        reason: reason || null,
        status: "pending",
      },
    });

    return NextResponse.json({ id: submission.id, message: "Submission received" }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
