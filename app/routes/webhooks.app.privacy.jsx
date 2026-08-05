import { authenticate } from "../shopify.server";
import prisma from "../db.server";

const SHOP_REDACT_TOPICS = new Set(["SHOP_REDACT", "shop/redact"]);

export const action = async ({ request }) => {
  const { topic, shop } = await authenticate.webhook(request);

  if (SHOP_REDACT_TOPICS.has(topic)) {
    await prisma.$transaction([
      prisma.carouselEvent.deleteMany({ where: { shop } }),
      prisma.carouselDailySummary.deleteMany({ where: { shop } }),
      prisma.affiliateReferral.deleteMany({
        where: { OR: [{ shop }, { pendingShop: shop }] },
      }),
      prisma.session.deleteMany({ where: { shop } }),
      prisma.shop.deleteMany({ where: { shop } }),
    ]);
  }

  return new Response(null, { status: 200 });
};
