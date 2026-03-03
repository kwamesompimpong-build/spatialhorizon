import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import { companies } from "../src/data/companies";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log(`Seeding ${companies.length} companies...`);

  for (const c of companies) {
    await prisma.company.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        name: c.name,
        domain: c.domain,
        capabilities: JSON.stringify(c.capabilities),
        sensorTypes: JSON.stringify(c.sensorTypes),
        description: c.description,
        founded: c.founded,
        hq: c.hq,
        size: c.size,
        tags: JSON.stringify(c.tags),
        website: c.website,
        ticker: c.financial?.ticker ?? null,
        exchange: c.financial?.exchange ?? null,
        totalRaised: c.funding?.totalRaised ?? null,
        lastRound: c.funding?.lastRound ?? null,
        valuation: c.funding?.valuation ?? null,
        acquiredPrice: c.funding?.acquiredPrice ?? null,
        marketCap: c.marketCap ?? null,
        status: "approved",
      },
    });
  }

  console.log(`Seeded ${companies.length} companies.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
