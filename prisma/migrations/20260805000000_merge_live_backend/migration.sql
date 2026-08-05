CREATE TABLE IF NOT EXISTS "Session" (
  "id" TEXT NOT NULL,
  "shop" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "isOnline" BOOLEAN NOT NULL DEFAULT false,
  "scope" TEXT,
  "expires" TIMESTAMP(3),
  "accessToken" TEXT NOT NULL,
  "userId" BIGINT,
  "firstName" TEXT,
  "lastName" TEXT,
  "email" TEXT,
  "accountOwner" BOOLEAN NOT NULL DEFAULT false,
  "locale" TEXT,
  "collaborator" BOOLEAN DEFAULT false,
  "emailVerified" BOOLEAN DEFAULT false,
  "refreshToken" TEXT,
  "refreshTokenExpires" TIMESTAMP(3),
  "refreshTokenExpiresAt" TIMESTAMP(3),
  CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "refreshToken" TEXT;
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "refreshTokenExpires" TIMESTAMP(3);
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "refreshTokenExpiresAt" TIMESTAMP(3);

UPDATE "Session"
SET "refreshTokenExpires" = "refreshTokenExpiresAt"
WHERE "refreshTokenExpires" IS NULL AND "refreshTokenExpiresAt" IS NOT NULL;

CREATE TABLE IF NOT EXISTS "Shop" (
  "id" TEXT NOT NULL,
  "shop" TEXT NOT NULL,
  "installDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "trialEndsAt" TIMESTAMP(3),
  "plan" TEXT,
  "isDevStore" BOOLEAN NOT NULL DEFAULT false,
  "hasActiveSubscription" BOOLEAN NOT NULL DEFAULT false,
  "gracePeriodEndsAt" TIMESTAMP(3),
  "lastCheckedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "accessToken" TEXT,
  "shopifyPlanName" TEXT,
  "subscriptionId" TEXT,
  "currentPlan" TEXT NOT NULL DEFAULT 'free',
  "uninstalledAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Shop_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "currentPlan" TEXT NOT NULL DEFAULT 'free';
ALTER TABLE "Shop" ADD COLUMN IF NOT EXISTS "uninstalledAt" TIMESTAMP(3);

UPDATE "Shop"
SET "currentPlan" = CASE WHEN "hasActiveSubscription" THEN 'pro' ELSE 'free' END
WHERE "currentPlan" IS NULL
   OR ("hasActiveSubscription" AND "currentPlan" <> 'pro');

CREATE UNIQUE INDEX IF NOT EXISTS "Shop_shop_key" ON "Shop"("shop");

CREATE TABLE IF NOT EXISTS "AffiliateReferral" (
  "id" TEXT NOT NULL,
  "affiliateCode" TEXT NOT NULL,
  "shop" TEXT,
  "pendingShop" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "installedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AffiliateReferral_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AffiliateReferral_shop_key" ON "AffiliateReferral"("shop");
CREATE UNIQUE INDEX IF NOT EXISTS "AffiliateReferral_pendingShop_key" ON "AffiliateReferral"("pendingShop");
CREATE INDEX IF NOT EXISTS "AffiliateReferral_affiliateCode_idx" ON "AffiliateReferral"("affiliateCode");
CREATE INDEX IF NOT EXISTS "AffiliateReferral_status_idx" ON "AffiliateReferral"("status");
CREATE INDEX IF NOT EXISTS "AffiliateReferral_installedAt_idx" ON "AffiliateReferral"("installedAt");

CREATE TABLE IF NOT EXISTS "CarouselEvent" (
  "id" TEXT NOT NULL,
  "shop" TEXT NOT NULL,
  "blockName" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "productId" TEXT,
  "variantId" TEXT,
  "pageUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CarouselEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "CarouselEvent_shop_createdAt_idx" ON "CarouselEvent"("shop", "createdAt");
CREATE INDEX IF NOT EXISTS "CarouselEvent_shop_blockName_eventType_idx" ON "CarouselEvent"("shop", "blockName", "eventType");

CREATE TABLE IF NOT EXISTS "CarouselDailySummary" (
  "id" TEXT NOT NULL,
  "shop" TEXT NOT NULL,
  "date" DATE NOT NULL,
  "blockName" TEXT NOT NULL,
  "impressions" INTEGER NOT NULL DEFAULT 0,
  "clicks" INTEGER NOT NULL DEFAULT 0,
  "addToCarts" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "CarouselDailySummary_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CarouselDailySummary_shop_date_blockName_key"
  ON "CarouselDailySummary"("shop", "date", "blockName");
CREATE INDEX IF NOT EXISTS "CarouselDailySummary_shop_date_idx"
  ON "CarouselDailySummary"("shop", "date");
