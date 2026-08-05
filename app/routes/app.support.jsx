export default function Support() {
  return (
    <s-page heading="Support">
      <s-link slot="breadcrumb-actions" href="/app">Component library</s-link>
      <s-section heading="We can help">
        <s-stack direction="block" gap="base">
          <s-paragraph>
            Include your myshopify.com domain, the component name, the page template, and a screenshot when reporting a problem.
          </s-paragraph>
          <s-button href="mailto:support@carouselslider.app" variant="primary">
            Email support
          </s-button>
        </s-stack>
      </s-section>
    </s-page>
  );
}
