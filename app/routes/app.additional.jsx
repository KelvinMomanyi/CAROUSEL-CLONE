import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function ThemeSetupPage() {
  return (
    <s-page heading="Theme setup">
      <s-button slot="primary-action" href="/app">Browse components</s-button>

      <s-section heading="From library to live store">
        <s-stack direction="block" gap="base">
          <s-paragraph>
            Motion Sections uses Shopify theme app extensions. Your components stay native to the
            theme editor, so you keep Shopify&apos;s storefront preview, responsive controls, draft
            changes and publishing workflow.
          </s-paragraph>
          <s-grid gridTemplateColumns="repeat(auto-fit, minmax(180px, 1fr))" gap="base">
            <s-box padding="base" border="base" borderRadius="base">
              <s-stack direction="block" gap="small-200">
                <s-badge tone="info">Step 1</s-badge>
                <s-heading>Choose a component</s-heading>
                <s-paragraph>Browse the library and preview a motion style.</s-paragraph>
              </s-stack>
            </s-box>
            <s-box padding="base" border="base" borderRadius="base">
              <s-stack direction="block" gap="small-200">
                <s-badge tone="info">Step 2</s-badge>
                <s-heading>Pick a page</s-heading>
                <s-paragraph>Select home, product, collection or custom page.</s-paragraph>
              </s-stack>
            </s-box>
            <s-box padding="base" border="base" borderRadius="base">
              <s-stack direction="block" gap="small-200">
                <s-badge tone="info">Step 3</s-badge>
                <s-heading>Add to theme</s-heading>
                <s-paragraph>The native theme editor opens with the block prepared.</s-paragraph>
              </s-stack>
            </s-box>
            <s-box padding="base" border="base" borderRadius="base">
              <s-stack direction="block" gap="small-200">
                <s-badge tone="success">Step 4</s-badge>
                <s-heading>Customise and save</s-heading>
                <s-paragraph>Connect content, drag into place, preview and publish.</s-paragraph>
              </s-stack>
            </s-box>
          </s-grid>
        </s-stack>
      </s-section>

      <s-section heading="What you edit in Shopify">
        <s-unordered-list>
          <s-list-item>Products, collections, images, headings and links</s-list-item>
          <s-list-item>Colours, spacing, alignment and mobile layout</s-list-item>
          <s-list-item>Animation preset, speed, direction and intensity</s-list-item>
          <s-list-item>Section order and page-template placement</s-list-item>
        </s-unordered-list>
      </s-section>

      <s-section heading="Theme compatibility">
        <s-banner tone="info" heading="Online Store 2.0 required">
          App blocks work with JSON templates and sections that support app blocks. The library adds
          full-width components to Shopify&apos;s Apps section for broad theme compatibility.
        </s-banner>
      </s-section>

      <s-section slot="aside" heading="Good to know">
        <s-paragraph>
          Clicking Add to theme only prepares the block in the editor. Nothing is published until
          you save the theme.
        </s-paragraph>
      </s-section>
    </s-page>
  );
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
