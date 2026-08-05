import { authenticate } from "../shopify.server";
import {
  syncBillingMetafields,
  syncEntitlementsForShop,
  updateSubscriptionStatus,
} from "../utils/billing.server";

export const action = async ({ request }) => {
  try {
    const { admin, shop, payload } = await authenticate.webhook(request);
    const subscription = payload?.app_subscription || payload;
    const updatedShop = await updateSubscriptionStatus(shop, subscription);

    if (admin) {
      await syncBillingMetafields({ admin, shop: updatedShop });
    } else {
      await syncEntitlementsForShop(shop, updatedShop);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("[Webhook] Subscription update failed:", error);
    return Response.json({ error: "Subscription update failed" }, { status: 500 });
  }
};
