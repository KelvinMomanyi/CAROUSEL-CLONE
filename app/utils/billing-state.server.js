import prisma from "../db.server";
import { isFresh, SHOP_PLAN_REFRESH_MS } from "./billing-refresh.server";

export const BILLING_PLANS = {
  free: {
    name: "Free",
    amount: 0,
    currencyCode: "USD",
    interval: null,
    limits: {
      maxSliders: 1,
      maxProducts: 6,
      allowedBlocks: [
        "slider",
        "slide9",
        "animated_hero",
        "infinite_marquee",
        "testimonials",
      ],
    },
  },
  pro: {
    name: "Pro Plan",
    amount: 6.99,
    currencyCode: "USD",
    interval: "EVERY_30_DAYS",
    limits: {
      maxSliders: null,
      maxProducts: null,
      allowedBlocks: "all",
    },
  },
};

export const BILLING_PLAN = BILLING_PLANS.pro;
export const BILLING_TRIAL_DAYS = 7;
export const BILLING_GRACE_DAYS = 0;

const FREE_BLOCK_SET = new Set(BILLING_PLANS.free.limits.allowedBlocks);
const DEV_PLAN_NAMES = new Set(["development", "partner test", "partner_test"]);

export function isBlockFree(blockName) {
  return FREE_BLOCK_SET.has(blockName);
}

export function getPlanLimits(planKey) {
  return BILLING_PLANS[planKey]?.limits || BILLING_PLANS.free.limits;
}

export function getShopPlanKey(shop) {
  return shop?.currentPlan === "pro" && shop?.hasActiveSubscription
    ? "pro"
    : "free";
}

export class ShopifyAuthError extends Error {
  constructor(message, { shop, status } = {}) {
    super(message);
    this.name = "ShopifyAuthError";
    this.shop = shop;
    this.status = status;
  }
}

export function isShopifyAuthError(error) {
  return error?.name === "ShopifyAuthError";
}

export function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

export function createTrialWindow(now = new Date()) {
  const trialEndsAt = addDays(now, BILLING_TRIAL_DAYS);
  return {
    trialEndsAt,
    gracePeriodEndsAt: addDays(trialEndsAt, BILLING_GRACE_DAYS),
  };
}

export function createGracePeriodEnd(trialEndsAt) {
  return addDays(trialEndsAt, BILLING_GRACE_DAYS);
}

async function fetchShopPlan(session, admin) {
  if (!session?.shop || !admin) {
    throw new Error("Cannot fetch the shop plan without an authenticated Admin client");
  }
  let response;
  try {
    response = await admin.graphql(`#graphql
          query ShopBillingPlan {
            shop {
              plan {
                publicDisplayName
                partnerDevelopment
              }
            }
          }`);
  } catch (error) {
    if (error?.response?.code === 401 || error?.status === 401) {
      throw new ShopifyAuthError(
        `Shopify rejected the stored access token for ${session.shop}`,
        { shop: session.shop, status: 401 },
      );
    }
    throw error;
  }

  const payload = await response.json();
  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join(", "));
  }

  return payload.data?.shop?.plan || {};
}

function planSnapshot(plan) {
  const displayName = String(plan?.publicDisplayName || "").trim();
  return {
    shopifyPlanName: displayName || null,
    isDevStore:
      Boolean(plan?.partnerDevelopment) ||
      DEV_PLAN_NAMES.has(displayName.toLowerCase()),
  };
}

export async function recordShopInstall(session, admin) {
  const now = new Date();
  const plan = planSnapshot(await fetchShopPlan(session, admin));
  const shop = await prisma.shop.upsert({
    where: { shop: session.shop },
    create: {
      shop: session.shop,
      installDate: now,
      ...(!plan.isDevStore ? createTrialWindow(now) : {}),
      currentPlan: "free",
      hasActiveSubscription: false,
      lastCheckedAt: now,
      uninstalledAt: null,
      shopPlanCheckedAt: now,
      entitlementSyncKey: null,
      ...plan,
    },
    update: {
      lastCheckedAt: now,
      uninstalledAt: null,
      shopPlanCheckedAt: now,
      entitlementSyncKey: null,
      billingVerifiedAt: null,
      ...plan,
    },
  });

  return ensureLiveTrialStarted(shop, now);
}

export async function syncShopFromShopify(session, { force = false, admin } = {}) {
  const existing = await prisma.shop.findUnique({ where: { shop: session.shop } });
  if (!force && existing && !existing.uninstalledAt &&
      isFresh(existing.shopPlanCheckedAt, SHOP_PLAN_REFRESH_MS)) {
    return ensureLiveTrialStarted(existing);
  }
  const now = new Date();
  const plan = planSnapshot(await fetchShopPlan(session, admin));
  const shop = await prisma.shop.upsert({
    where: { shop: session.shop },
    create: {
      shop: session.shop,
      installDate: now,
      ...(!plan.isDevStore ? createTrialWindow(now) : {}),
      currentPlan: "free",
      hasActiveSubscription: false,
      lastCheckedAt: now,
      uninstalledAt: null,
      shopPlanCheckedAt: now,
      ...plan,
    },
    update: {
      lastCheckedAt: now,
      uninstalledAt: null,
      shopPlanCheckedAt: now,
      ...plan,
    },
  });

  return ensureLiveTrialStarted(shop, now);
}

export async function ensureLiveTrialStarted(shop, now = new Date()) {
  if (!shop || shop.isDevStore || shop.trialEndsAt) return shop;

  return prisma.shop.update({
    where: { shop: shop.shop },
    data: createTrialWindow(now),
  });
}
