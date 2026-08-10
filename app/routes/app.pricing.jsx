import { Form, useLoaderData } from "react-router";
import {
  createBillingApproval,
  getBillingConfig,
  requireBilling,
} from "../utils/billing.server";

export const loader = async ({ request }) => {
  const { billing } = await requireBilling(request);
  return { billing, billingConfig: getBillingConfig() };
};

export const action = async ({ request }) => {
  const context = await requireBilling(request);
  return createBillingApproval(request, context);
};

export default function Pricing() {
  const { billing, billingConfig } = useLoaderData();
  const paid = billing.hasActiveSubscription;
  const fullAccess = billing.hasProAccess;

  return (
    <s-page heading="Pricing">
      <s-link slot="breadcrumb-actions" href="/app">Component library</s-link>

      {billing.isDevStore ? (
        <s-banner heading="Development store" tone="info">
          Shopify does not charge development stores. Pro access is enabled for testing.
        </s-banner>
      ) : paid ? (
        <s-banner heading="Pro Plan active" tone="success">
          Your Shopify subscription is active and every component is unlocked.
        </s-banner>
      ) : billing.isTrialActive ? (
        <s-banner heading={`${billing.trialDaysRemaining} trial days remaining`} tone="info">
          Your trial currently includes all Pro components.
        </s-banner>
      ) : (
        <s-banner heading="Free Plan active" tone="info">
          Your free components remain published. Upgrade when you need the full library.
        </s-banner>
      )}

      <s-grid gridTemplateColumns="repeat(auto-fit, minmax(280px, 1fr))" gap="base">
        <s-section heading="Free">
          <s-stack direction="block" gap="base">
            <s-heading>$0 forever</s-heading>
            <s-badge tone={!fullAccess ? "success" : "info"}>
              {!fullAccess ? "Current plan" : "Included"}
            </s-badge>
            <s-unordered-list>
              <s-list-item>Five storefront motion components</s-list-item>
              <s-list-item>Up to six products per free carousel</s-list-item>
              <s-list-item>Theme editor customization</s-list-item>
              <s-list-item>Storefront interaction analytics</s-list-item>
            </s-unordered-list>
          </s-stack>
        </s-section>

        <s-section heading="Pro Plan">
          <s-stack direction="block" gap="base">
            <s-heading>${billingConfig.plan.amount} USD every 30 days</s-heading>
            <s-badge tone={fullAccess ? "success" : "info"}>
              {paid ? "Current plan" : fullAccess ? "Trial access" : "Upgrade"}
            </s-badge>
            <s-unordered-list>
              <s-list-item>All seventeen motion components</s-list-item>
              <s-list-item>Unlimited Pro carousel usage</s-list-item>
              <s-list-item>New premium layouts as they are released</s-list-item>
              <s-list-item>Priority support</s-list-item>
            </s-unordered-list>
            {!paid && !billing.isDevStore && (
              <Form method="post">
                <s-button type="submit" variant="primary">
                  {billing.isTrialActive ? "Subscribe to Pro" : "Upgrade to Pro"}
                </s-button>
              </Form>
            )}
          </s-stack>
        </s-section>
      </s-grid>
    </s-page>
  );
}
