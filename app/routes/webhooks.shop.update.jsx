import { authenticate, unauthenticated } from "../shopify.server";
import { syncShopFromShopify } from "../utils/billing-state.server";
import {
  clearStoredShopAuth,
  syncBillingMetafields,
} from "../utils/billing.server";

export const action = async ({ request }) => {
  const { admin: webhookAdmin, session: webhookSession, shop } =
    await authenticate.webhook(request);

  try {
    const background =
      webhookAdmin && webhookSession
        ? { admin: webhookAdmin, session: webhookSession }
        : await unauthenticated.admin(shop);
    const updatedShop = await syncShopFromShopify(background.session);
    await syncBillingMetafields({ admin: background.admin, shop: updatedShop });
    return Response.json({ success: true, synced: true });
  } catch (error) {
    if (error?.status === 401 || error?.name === "ShopifyAuthError") {
      await clearStoredShopAuth(shop);
      return Response.json({ success: true, synced: false, reauthRequired: true });
    }
    console.error("[Webhook] Shop update failed:", error);
    return Response.json({ error: "Shop update failed" }, { status: 500 });
  }
};
