ALTER TABLE "Shop"
  ADD COLUMN "billingVerifiedAt" TIMESTAMP(3),
  ADD COLUMN "shopPlanCheckedAt" TIMESTAMP(3),
  ADD COLUMN "entitlementSyncKey" TEXT,
  ADD COLUMN "entitlementSyncedAt" TIMESTAMP(3);
