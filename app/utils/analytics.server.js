import prisma from "../db.server";

function startOfDay(value) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfDay(value) {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
}

export async function aggregateDailySummaries(shop, value = new Date()) {
  const date = startOfDay(value);
  const groups = await prisma.carouselEvent.groupBy({
    by: ["blockName", "eventType"],
    where: { shop, createdAt: { gte: date, lte: endOfDay(value) } },
    _count: { id: true },
  });
  const summaries = new Map();
  for (const group of groups) {
    const counts = summaries.get(group.blockName) || {
      impressions: 0,
      clicks: 0,
      addToCarts: 0,
    };
    if (group.eventType === "impression") counts.impressions = group._count.id;
    if (group.eventType === "click") counts.clicks = group._count.id;
    if (group.eventType === "add_to_cart") counts.addToCarts = group._count.id;
    summaries.set(group.blockName, counts);
  }
  await Promise.all(
    Array.from(summaries.entries()).map(([blockName, counts]) =>
      prisma.carouselDailySummary.upsert({
        where: { shop_date_blockName: { shop, date, blockName } },
        create: { shop, date, blockName, ...counts },
        update: counts,
      }),
    ),
  );
  pruneOldEvents(shop).catch(() => {});
}

export async function getAnalyticsSummary(shop, days = 30) {
  const since = startOfDay(new Date());
  since.setDate(since.getDate() - days);
  const rows = await prisma.carouselDailySummary.findMany({
    where: { shop, date: { gte: since } },
    orderBy: { date: "asc" },
  });
  const grouped = new Map();
  for (const row of rows) {
    const key = row.date.toISOString().slice(0, 10);
    const value = grouped.get(key) || {
      date: key,
      impressions: 0,
      clicks: 0,
      addToCarts: 0,
    };
    value.impressions += row.impressions;
    value.clicks += row.clicks;
    value.addToCarts += row.addToCarts;
    grouped.set(key, value);
  }
  return Array.from(grouped.values());
}

export async function getBlockBreakdown(shop, days = 30) {
  const since = startOfDay(new Date());
  since.setDate(since.getDate() - days);
  const rows = await prisma.carouselDailySummary.findMany({
    where: { shop, date: { gte: since } },
  });
  const grouped = new Map();
  for (const row of rows) {
    const value = grouped.get(row.blockName) || {
      blockName: row.blockName,
      impressions: 0,
      clicks: 0,
      addToCarts: 0,
    };
    value.impressions += row.impressions;
    value.clicks += row.clicks;
    value.addToCarts += row.addToCarts;
    grouped.set(row.blockName, value);
  }
  return Array.from(grouped.values()).sort(
    (left, right) => right.impressions - left.impressions,
  );
}

export async function getTopProducts(shop, days = 30, limit = 5) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const rows = await prisma.carouselEvent.groupBy({
    by: ["productId"],
    where: {
      shop,
      eventType: { in: ["click", "add_to_cart"] },
      productId: { not: null },
      createdAt: { gte: since },
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: limit,
  });
  return rows.map((row) => ({
    productId: row.productId,
    interactions: row._count.id,
  }));
}

export async function getAnalyticsTotals(shop, days = 30) {
  const since = startOfDay(new Date());
  since.setDate(since.getDate() - days);
  const totals = await prisma.carouselDailySummary.aggregate({
    where: { shop, date: { gte: since } },
    _sum: { impressions: true, clicks: true, addToCarts: true },
  });
  const impressions = totals._sum.impressions || 0;
  const clicks = totals._sum.clicks || 0;
  const addToCarts = totals._sum.addToCarts || 0;
  return {
    impressions,
    clicks,
    addToCarts,
    ctr: impressions ? ((clicks / impressions) * 100).toFixed(1) : "0.0",
    conversionRate: impressions
      ? ((addToCarts / impressions) * 100).toFixed(1)
      : "0.0",
  };
}

export async function pruneOldEvents(shop, retentionDays = 90) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - retentionDays);
  await prisma.carouselEvent.deleteMany({
    where: { shop, createdAt: { lt: cutoff } },
  });
}
