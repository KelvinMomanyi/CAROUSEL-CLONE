import prisma from "../db.server";
import { authenticate, unauthenticated } from "../shopify.server";
import {
  BILLING_GRACE_DAYS,
  BILLING_PLAN,
  BILLING_PLANS,
  BILLING_TRIAL_DAYS,
  createGracePeriodEnd,
  getPlanLimits,
  isShopifyAuthError,
  syncShopFromShopify,
} from "./billing-state.server";

const ACTIVE_STATUS = "ACTIVE";
const LONG_LIVED_ACCESS = new Date("2099-12-31T23:59:59.000Z");

function daysRemaining(date) {
  if (!date) return 0;
  return Math.max(0, Math.ceil((date.getTime() - Date.now()) / 86400000));
}

export function getAccessLevel(shop, now = new Date()) {
  if (!shop || shop.uninstalledAt) return "none";
  if (shop.isDevStore) return "dev";
  if (shop.hasActiveSubscription) return "subscribed";
  if (shop.trialEndsAt && now < shop.trialEndsAt) return "trial";
  if (shop.gracePeriodEndsAt && now < shop.gracePeriodEndsAt) return "grace";
  return "free";
}

function billingState(shop, activeSubscription = null) {
  const access = getAccessLevel(shop);
  const hasProAccess = ["dev", "subscribed", "trial", "grace"].includes(access);
  return {
    access,
    shop: shop?.shop || null,
    isDevStore: Boolean(shop?.isDevStore),
    hasActiveSubscription: Boolean(shop?.hasActiveSubscription),
    hasProAccess,
    isTrialActive: access === "trial",
    isGracePeriodActive: access === "grace",
    trialDaysRemaining: daysRemaining(shop?.trialEndsAt),
    graceDaysRemaining: daysRemaining(shop?.gracePeriodEndsAt),
    trialEndsAt: shop?.trialEndsAt || null,
    gracePeriodEndsAt: shop?.gracePeriodEndsAt || null,
    plan: shop?.plan || null,
    currentPlan: hasProAccess ? "pro" : "free",
    limits: getPlanLimits(hasProAccess ? "pro" : "free"),
    activeSubscription,
  };
}

export async function clearStoredShopAuth(shop) {
  if (!shop) return;
  await prisma.session.deleteMany({ where: { shop } });
  await prisma.shop.updateMany({ where: { shop }, data: { accessToken: null } });
}

async function getActiveSubscription(admin) {
  const response = await admin.graphql(
    `#graphql
      query CurrentAppInstallationSubscriptions {
        currentAppInstallation {
          activeSubscriptions {
            id
            status
            name
          }
        }
      }`,
  );
  const payload = await response.json();
  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join(", "));
  }
  return (
    payload.data?.currentAppInstallation?.activeSubscriptions?.find(
      (subscription) => subscription.status === ACTIVE_STATUS,
    ) || null
  );
}

async function markActiveSubscription(shopDomain, subscription) {
  const now = new Date();
  return prisma.shop.upsert({
    where: { shop: shopDomain },
    create: {
      shop: shopDomain,
      installDate: now,
      hasActiveSubscription: true,
      plan: subscription.name,
      subscriptionId: subscription.id,
      currentPlan: "pro",
      lastCheckedAt: now,
    },
    update: {
      hasActiveSubscription: true,
      plan: subscription.name,
      subscriptionId: subscription.id,
      currentPlan: "pro",
      lastCheckedAt: now,
      uninstalledAt: null,
    },
  });
}

async function markNoActiveSubscription(shopDomain) {
  return prisma.shop.update({
    where: { shop: shopDomain },
    data: {
      hasActiveSubscription: false,
      plan: null,
      subscriptionId: null,
      currentPlan: "free",
      lastCheckedAt: new Date(),
    },
  });
}

async function ensureGracePeriod(shop) {
  if (!shop?.trialEndsAt || shop.gracePeriodEndsAt) return shop;
  return prisma.shop.update({
    where: { shop: shop.shop },
    data: { gracePeriodEndsAt: createGracePeriodEnd(shop.trialEndsAt) },
  });
}

export async function requireBilling(request) {
  const context = await authenticate.admin(request);
  const { admin, session } = context;
  let shop;

  try {
    shop = await syncShopFromShopify(session);
  } catch (error) {
    if (isShopifyAuthError(error)) {
      await clearStoredShopAuth(session.shop);
    }
    throw error;
  }

  let activeSubscription = null;
  if (!shop.isDevStore) {
    activeSubscription = await getActiveSubscription(admin);
    if (activeSubscription) {
      shop = await markActiveSubscription(session.shop, activeSubscription);
    } else if (shop.hasActiveSubscription || shop.currentPlan === "pro") {
      shop = await markNoActiveSubscription(session.shop);
    }
  }

  shop = await ensureGracePeriod(shop);
  await syncBillingMetafields({ admin, shop }).catch((error) => {
    console.error("[Billing] Unable to sync storefront entitlements:", error);
  });

  return {
    ...context,
    shop,
    billing: billingState(shop, activeSubscription),
  };
}

export async function createBillingApproval(request, authenticatedContext) {
  const context = authenticatedContext || (await requireBilling(request));
  const { admin, session, redirect, billing } = context;

  if (billing.isDevStore || billing.hasActiveSubscription) {
    return redirect("/app", { target: "_top" });
  }

  const requestUrl = new URL(request.url);
  const baseUrl = process.env.SHOPIFY_APP_URL || requestUrl.origin;
  const returnUrl = new URL("/app", baseUrl);
  returnUrl.searchParams.set("shop", session.shop);
  const host = requestUrl.searchParams.get("host");
  if (host) returnUrl.searchParams.set("host", host);

  const response = await admin.graphql(
    `#graphql
      mutation AppSubscriptionCreate(
        $name: String!
        $returnUrl: URL!
        $test: Boolean
        $trialDays: Int
        $lineItems: [AppSubscriptionLineItemInput!]!
      ) {
        appSubscriptionCreate(
          name: $name
          returnUrl: $returnUrl
          test: $test
          trialDays: $trialDays
          lineItems: $lineItems
        ) {
          appSubscription { id status name }
          confirmationUrl
          userErrors { field message }
        }
      }`,
    {
      variables: {
        name: BILLING_PLAN.name,
        returnUrl: returnUrl.toString(),
        test: process.env.SHOPIFY_BILLING_TEST === "true",
        trialDays: billing.isTrialActive ? billing.trialDaysRemaining : 0,
        lineItems: [
          {
            plan: {
              appRecurringPricingDetails: {
                price: {
                  amount: BILLING_PLAN.amount,
                  currencyCode: BILLING_PLAN.currencyCode,
                },
                interval: BILLING_PLAN.interval,
              },
            },
          },
        ],
      },
    },
  );

  const payload = await response.json();
  const result = payload.data?.appSubscriptionCreate;
  const errors = [
    ...(payload.errors || []).map((error) => error.message),
    ...(result?.userErrors || []).map((error) => error.message),
  ];
  if (errors.length) throw new Response(errors.join(", "), { status: 400 });
  if (!result?.confirmationUrl) {
    throw new Response("Shopify did not return a billing confirmation URL.", {
      status: 502,
    });
  }

  return redirect(result.confirmationUrl, { target: "_top" });
}

export async function refreshSubscriptionStatusFromShopify(shopDomain) {
  const { admin } = await unauthenticated.admin(shopDomain);
  const activeSubscription = await getActiveSubscription(admin);
  const shop = activeSubscription
    ? await markActiveSubscription(shopDomain, activeSubscription)
    : await markNoActiveSubscription(shopDomain);
  await syncBillingMetafields({ admin, shop });
  return shop;
}

export async function updateSubscriptionStatus(shopDomain, subscription) {
  const status = subscription?.status || "NONE";
  const active = status === ACTIVE_STATUS;
  const now = new Date();
  return prisma.shop.upsert({
    where: { shop: shopDomain },
    create: {
      shop: shopDomain,
      installDate: now,
      hasActiveSubscription: active,
      plan: active ? subscription?.name || BILLING_PLAN.name : null,
      subscriptionId:
        subscription?.id || subscription?.admin_graphql_api_id || null,
      currentPlan: active ? "pro" : "free",
      lastCheckedAt: now,
    },
    update: {
      hasActiveSubscription: active,
      plan: active ? subscription?.name || BILLING_PLAN.name : null,
      subscriptionId: active
        ? subscription?.id || subscription?.admin_graphql_api_id || null
        : null,
      currentPlan: active ? "pro" : "free",
      lastCheckedAt: now,
    },
  });
}

export async function syncEntitlementsForShop(shopDomain, shopRecord) {
  const { admin } = await unauthenticated.admin(shopDomain);
  const shop =
    shopRecord ||
    (await prisma.shop.findUnique({ where: { shop: shopDomain } }));
  if (shop) await syncBillingMetafields({ admin, shop });
}

export async function markAppUninstalled(shopDomain) {
  const now = new Date();
  return prisma.shop.upsert({
    where: { shop: shopDomain },
    create: {
      shop: shopDomain,
      installDate: now,
      hasActiveSubscription: false,
      currentPlan: "free",
      uninstalledAt: now,
      lastCheckedAt: now,
    },
    update: {
      hasActiveSubscription: false,
      currentPlan: "free",
      accessToken: null,
      plan: null,
      subscriptionId: null,
      uninstalledAt: now,
      lastCheckedAt: now,
    },
  });
}

export function getBillingConfig() {
  return {
    plan: BILLING_PLAN,
    plans: BILLING_PLANS,
    trialDays: BILLING_TRIAL_DAYS,
    graceDays: BILLING_GRACE_DAYS,
  };
}

export function hasPremiumFeatureAccess(billing) {
  return Boolean(billing?.hasProAccess);
}

export function getBillingMetafieldSnapshot(shop) {
  const access = getAccessLevel(shop);
  const proAccess = ["dev", "subscribed", "trial", "grace"].includes(access);
  const expiresAt =
    access === "trial"
      ? shop.trialEndsAt
      : access === "grace"
        ? shop.gracePeriodEndsAt
        : LONG_LIVED_ACCESS;
  return {
    active: access !== "none",
    proAccess,
    planTier: proAccess ? "pro" : "free",
    expiresAt: expiresAt || new Date(),
  };
}

export async function syncBillingMetafields({ admin, shop }) {
  if (!admin || !shop || shop.uninstalledAt) return;
  const installationResponse = await admin.graphql(
    `#graphql
      query CurrentAppInstallationId {
        currentAppInstallation { id }
      }`,
  );
  const installationPayload = await installationResponse.json();
  const ownerId = installationPayload.data?.currentAppInstallation?.id;
  if (!ownerId) throw new Error("No current Shopify app installation found");

  const snapshot = getBillingMetafieldSnapshot(shop);
  const response = await admin.graphql(
    `#graphql
      mutation SyncBillingEntitlements($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields { id namespace key value }
          userErrors { field message }
        }
      }`,
    {
      variables: {
        metafields: [
          {
            namespace: "billing",
            key: "active",
            ownerId,
            type: "boolean",
            value: String(snapshot.active),
          },
          {
            namespace: "billing",
            key: "pro_access",
            ownerId,
            type: "boolean",
            value: String(snapshot.proAccess),
          },
          {
            namespace: "billing",
            key: "plan_tier",
            ownerId,
            type: "single_line_text_field",
            value: snapshot.planTier,
          },
          {
            namespace: "billing",
            key: "expires_at",
            ownerId,
            type: "date_time",
            value: snapshot.expiresAt.toISOString(),
          },
        ],
      },
    },
  );
  const payload = await response.json();
  const errors = [
    ...(payload.errors || []).map((error) => error.message),
    ...(payload.data?.metafieldsSet?.userErrors || []).map(
      (error) => error.message,
    ),
  ];
  if (errors.length) throw new Error(errors.join(", "));
}
