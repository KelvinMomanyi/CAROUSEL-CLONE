import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import {
  getAccessLevel,
  refreshSubscriptionStatusFromShopify,
  syncEntitlementsForShop,
} from "../utils/billing.server";
import { getPlanLimits } from "../utils/billing-state.server";

const RECHECK_INTERVAL = 6 * 60 * 60 * 1000;
const responseOptions = {
  headers: { "Cache-Control": "no-store, max-age=0" },
};

function shouldRecheck(shop) {
  return Boolean(
    shop?.hasActiveSubscription &&
      shop.lastCheckedAt &&
      Date.now() - shop.lastCheckedAt.getTime() > RECHECK_INTERVAL,
  );
}

export const loader = async ({ request }) => {
  try {
    const { session } = await authenticate.public.appProxy(request);
    if (!session?.shop) {
      return Response.json({ active: false, plan: "free" }, responseOptions);
    }

    let shop = await prisma.shop.findUnique({ where: { shop: session.shop } });
    if (!shop || shop.uninstalledAt) {
      return Response.json({ active: false, plan: "free" }, responseOptions);
    }

    if (shouldRecheck(shop)) {
      shop = await refreshSubscriptionStatusFromShopify(session.shop);
    }

    const access = getAccessLevel(shop);
    const plan = ["dev", "subscribed", "trial", "grace"].includes(access)
      ? "pro"
      : "free";
    syncEntitlementsForShop(session.shop, shop).catch(() => {});

    return Response.json(
      { active: access !== "none", plan, limits: getPlanLimits(plan) },
      responseOptions,
    );
  } catch (error) {
    console.error("[Proxy] Billing status failed:", error);
    return Response.json(
      { active: false, plan: "free", limits: getPlanLimits("free") },
      responseOptions,
    );
  }
};
