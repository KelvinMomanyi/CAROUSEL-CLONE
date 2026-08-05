import "@shopify/shopify-app-react-router/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  BillingInterval,
  shopifyApp,
} from "@shopify/shopify-app-react-router/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";
import {
  BILLING_PLAN,
  BILLING_TRIAL_DAYS,
  recordShopInstall,
} from "./utils/billing-state.server";
import { recordAffiliateInstall } from "./utils/affiliate-referral.server";

const scopes = Array.from(
  new Set(
    (process.env.SCOPES || "read_products,write_products")
      .split(",")
      .map((scope) => scope.trim())
      .filter(Boolean),
  ),
);

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.July26,
  scopes,
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  billing: {
    [BILLING_PLAN.name]: {
      amount: BILLING_PLAN.amount,
      currencyCode: BILLING_PLAN.currencyCode,
      interval: BillingInterval.Every30Days,
      trialDays: BILLING_TRIAL_DAYS,
    },
  },
  hooks: {
    afterAuth: async ({ session }) => {
      await recordShopInstall(session);
      try {
        await recordAffiliateInstall(session);
      } catch (error) {
        console.error("[Affiliate] Unable to finalize referral:", error);
      }
    },
  },
  future: {
    expiringOfflineAccessTokens: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = ApiVersion.July26;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
