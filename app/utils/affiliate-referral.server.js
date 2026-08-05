import prisma from "../db.server";

const COOKIE_NAME = "carousel_affiliate_ref";
const CODE_PATTERN = /^[a-z0-9][a-z0-9_-]{0,79}$/;
const SHOP_PATTERN = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/;
const MAX_AGE = 60 * 60 * 24 * 30;

export function normalizeAffiliateCode(value) {
  if (typeof value !== "string") return null;
  const code = value.trim().toLowerCase();
  return CODE_PATTERN.test(code) ? code : null;
}

export function normalizeShopDomain(value) {
  if (typeof value !== "string") return null;
  let shop = value.trim().toLowerCase();
  if (!shop) return null;
  shop = shop.replace(/^https?:\/\//, "").split(/[/?#]/)[0];
  if (!shop.includes(".")) shop = `${shop}.myshopify.com`;
  return SHOP_PATTERN.test(shop) ? shop : null;
}

function readCookie(request) {
  const cookie = request.headers.get("cookie") || "";
  const entry = cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`));
  return entry ? decodeURIComponent(entry.slice(COOKIE_NAME.length + 1)) : null;
}

function referralCookie(code) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${COOKIE_NAME}=${encodeURIComponent(code)}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; SameSite=Lax${secure}`;
}

async function readFormData(request) {
  if (!new Set(["POST", "PUT", "PATCH"]).has(request.method.toUpperCase())) {
    return null;
  }
  const type = request.headers.get("content-type") || "";
  if (!type.includes("form")) return null;
  try {
    return await request.clone().formData();
  } catch {
    return null;
  }
}

export async function captureAffiliateReferral(request) {
  const url = new URL(request.url);
  const form = await readFormData(request);
  const queryCode = normalizeAffiliateCode(url.searchParams.get("ref"));
  const formCode = normalizeAffiliateCode(form?.get("ref"));
  const affiliateCode =
    queryCode || formCode || normalizeAffiliateCode(readCookie(request));
  const shop =
    normalizeShopDomain(url.searchParams.get("shop")) ||
    normalizeShopDomain(form?.get("shop"));
  const headers = new Headers();

  if (queryCode || formCode) {
    headers.append("Set-Cookie", referralCookie(queryCode || formCode));
  }

  if (!affiliateCode || !shop) return { affiliateCode, shop, headers };

  const installed = await prisma.affiliateReferral.findFirst({
    where: { status: "installed", OR: [{ shop }, { pendingShop: shop }] },
  });

  if (!installed) {
    const now = new Date();
    await prisma.affiliateReferral.upsert({
      where: { pendingShop: shop },
      create: {
        affiliateCode,
        pendingShop: shop,
        firstSeenAt: now,
        lastSeenAt: now,
      },
      update: { affiliateCode, status: "pending", lastSeenAt: now },
    });
  }

  return { affiliateCode, shop, headers };
}

export async function recordAffiliateInstall(session) {
  const shop = normalizeShopDomain(session?.shop);
  if (!shop) return null;

  const installed = await prisma.affiliateReferral.findFirst({
    where: { shop, status: "installed" },
  });
  if (installed) return installed;

  const pending = await prisma.affiliateReferral.findUnique({
    where: { pendingShop: shop },
  });
  if (!pending) return null;

  return prisma.affiliateReferral.update({
    where: { id: pending.id },
    data: { shop, status: "installed", installedAt: new Date() },
  });
}
