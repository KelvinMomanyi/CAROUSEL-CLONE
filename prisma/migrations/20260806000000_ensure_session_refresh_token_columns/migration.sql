-- Keep session storage compatible with Shopify's expiring offline token fields.
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "refreshToken" TEXT;
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "refreshTokenExpires" TIMESTAMP(3);
ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "refreshTokenExpiresAt" TIMESTAMP(3);

UPDATE "Session"
SET "refreshTokenExpires" = "refreshTokenExpiresAt"
WHERE "refreshTokenExpires" IS NULL AND "refreshTokenExpiresAt" IS NOT NULL;
