/* eslint-disable react/prop-types */
import { useMemo, useState } from "react";
import { useLoaderData } from "react-router";
import {
  getBillingConfig,
  hasPremiumFeatureAccess,
  requireBilling,
} from "../utils/billing.server";
import libraryStyles from "../styles/motion-library.css?url";

export const links = () => [{ rel: "stylesheet", href: libraryStyles }];

const templates = [
  { value: "index", label: "Home page" },
  { value: "product", label: "Product page" },
  { value: "collection", label: "Collection page" },
  { value: "page", label: "Custom page" },
];

const components = [
  {
    handle: "product-slideshow",
    name: "Product slideshow",
    eyebrow: "Best seller",
    category: "Carousels",
    description: "A focused product slideshow with thumbnails, variant controls, autoplay and quick add.",
    templates: ["index", "product", "collection", "page"],
    content: "Collection",
    performance: "Light",
    access: "Free",
    preview: "carousel",
    palette: "citrus",
  },
  {
    handle: "product_coverflow",
    name: "3D product coverflow",
    eyebrow: "Signature",
    category: "Carousels",
    description: "A dimensional centre-stage carousel with coverflow, stacked and editorial presets.",
    templates: ["index", "product", "collection", "page"],
    content: "Collection",
    performance: "Balanced",
    access: "Pro",
    preview: "coverflow",
    palette: "violet",
  },
  {
    handle: "carousel_slider",
    name: "Carousel Slider",
    eyebrow: "New",
    category: "Carousels",
    description: "A cinematic full-bleed product slider with animated copy, thumbnails and progress tracking.",
    templates: ["index", "product", "collection", "page"],
    content: "Collection",
    performance: "Balanced",
    access: "Free",
    preview: "editorial",
    palette: "ember",
  },
  {
    handle: "carousel_aerphone",
    name: "Carousel: Aerphone",
    eyebrow: "3D detail",
    category: "Carousels",
    description: "A layered product presentation pairing a dimensional hero card with detailed specifications.",
    templates: ["index", "product", "collection", "page"],
    content: "Collection + details",
    performance: "Balanced",
    access: "Pro",
    preview: "aerphone",
    palette: "steel",
  },
  {
    handle: "carousel_swift",
    name: "Carousel Swift Layout",
    eyebrow: "Cinematic",
    category: "Carousels",
    description: "An edge-to-edge campaign carousel with dramatic image transitions and staggered product copy.",
    templates: ["index", "product", "collection", "page"],
    content: "Collection",
    performance: "Balanced",
    access: "Pro",
    preview: "swift",
    palette: "sunset",
  },
  {
    handle: "carousel_orbit_ring",
    name: "Carousel: Orbit Ring",
    eyebrow: "Immersive",
    category: "Carousels",
    description: "A configurable 3D product ring with depth, tilt, keyboard navigation and touch rotation.",
    templates: ["index", "product", "collection", "page"],
    content: "Collection",
    performance: "Rich",
    access: "Pro",
    preview: "orbit",
    palette: "neon",
  },
  {
    handle: "carousel_elegance",
    name: "Carousel Elegance",
    eyebrow: "Art direction",
    category: "Carousels",
    description: "A colorful masked-image carousel with fluid shapes and a refined split composition.",
    templates: ["index", "product", "collection", "page"],
    content: "Collection",
    performance: "Balanced",
    access: "Pro",
    preview: "elegance",
    palette: "meadow",
  },
  {
    handle: "carousel_vanish",
    name: "Carousel Vanish",
    eyebrow: "Minimal",
    category: "Carousels",
    description: "A spacious product stage with blur-to-focus transitions and concise product specifications.",
    templates: ["index", "product", "collection", "page"],
    content: "Collection + details",
    performance: "Light",
    access: "Pro",
    preview: "vanish",
    palette: "porcelain",
  },
  {
    handle: "carousel_coverflow",
    name: "Carousel: Coverflow",
    eyebrow: "Depth",
    category: "Carousels",
    description: "An overlapping coverflow gallery that keeps the active product sharply in focus.",
    templates: ["index", "product", "collection", "page"],
    content: "Collection",
    performance: "Balanced",
    access: "Free",
    preview: "coverflow-cards",
    palette: "bronze",
  },
  {
    handle: "carousel_card_stack",
    name: "Carousel: Card Stack",
    eyebrow: "Tactile",
    category: "Carousels",
    description: "A tactile deck of shuffling product cards with autoplay, swipe and quick purchase actions.",
    templates: ["index", "product", "collection", "page"],
    content: "Collection",
    performance: "Balanced",
    access: "Pro",
    preview: "card-stack",
    palette: "lilac",
  },
  {
    handle: "carousel_modern",
    name: "Carousel: Modern",
    eyebrow: "Polished",
    category: "Carousels",
    description: "A modern glass-panel product showcase with animated gradients, thumbnails and progress.",
    templates: ["index", "product", "collection", "page"],
    content: "Collection",
    performance: "Balanced",
    access: "Pro",
    preview: "modern",
    palette: "plasma",
  },
  {
    handle: "animated_hero",
    name: "Split reveal hero",
    eyebrow: "New",
    category: "Heroes",
    description: "A cinematic image hero with staggered copy, configurable overlay and two actions.",
    templates: ["index", "collection", "page"],
    content: "Image + copy",
    performance: "Light",
    access: "Free",
    preview: "hero",
    palette: "ocean",
  },
  {
    handle: "infinite_marquee",
    name: "Infinite product marquee",
    eyebrow: "Popular",
    category: "Products",
    description: "A continuous product ribbon with pause-on-hover, direction and speed controls.",
    templates: ["index", "product", "collection", "page"],
    content: "Collection",
    performance: "Light",
    access: "Free",
    preview: "marquee",
    palette: "coral",
  },
  {
    handle: "product_story",
    name: "Horizontal product story",
    eyebrow: "Editorial",
    category: "Products",
    description: "A scrollable chapter layout that pairs product imagery with campaign storytelling.",
    templates: ["index", "product", "collection", "page"],
    content: "Collection + copy",
    performance: "Balanced",
    access: "Pro",
    preview: "story",
    palette: "ink",
  },
  {
    handle: "shoppable_gallery",
    name: "Shoppable gallery",
    eyebrow: "Conversion",
    category: "Galleries",
    description: "An editorial image grid with accessible product hotspots and mobile stacking.",
    templates: ["index", "product", "collection", "page"],
    content: "Images + products",
    performance: "Light",
    access: "Pro",
    preview: "gallery",
    palette: "rose",
  },
  {
    handle: "testimonials",
    name: "Testimonial spotlight",
    eyebrow: "Social proof",
    category: "Conversion",
    description: "A refined rotating quote feature with ratings, attribution and trust messaging.",
    templates: ["index", "product", "collection", "page"],
    content: "Quotes",
    performance: "Light",
    access: "Free",
    preview: "quotes",
    palette: "sand",
  },
  {
    handle: "image_reveal",
    name: "Image reveal",
    eyebrow: "Storytelling",
    category: "Galleries",
    description: "An interactive before-and-after comparison for product details and transformations.",
    templates: ["index", "product", "collection", "page"],
    content: "Two images",
    performance: "Light",
    access: "Free",
    preview: "reveal",
    palette: "mint",
  },
];

const categories = ["All", "Carousels", "Heroes", "Products", "Galleries", "Conversion"];

const liveBlockHandles = {
  carousel_slider: "slider",
  carousel_aerphone: "slide2",
  carousel_swift: "slide4",
  carousel_orbit_ring: "slide5",
  carousel_elegance: "slide7",
  carousel_vanish: "slide8",
  carousel_coverflow: "slide9",
  carousel_card_stack: "slide11",
  carousel_modern: "slide12",
};

export const loader = async ({ request }) => {
  const { session, billing } = await requireBilling(request);

  return {
    // @ts-ignore -- process is provided by the Node server runtime.
    // eslint-disable-next-line no-undef
    apiKey: process.env.SHOPIFY_API_KEY || "",
    shop: session.shop,
    billing,
    billingConfig: getBillingConfig(),
    isPro: hasPremiumFeatureAccess(billing),
  };
};

function createThemeEditorLink({ shop, apiKey, blockHandle, template }) {
  const params = new URLSearchParams({
    template,
    addAppBlockId: `${apiKey}/${blockHandle}`,
    target: "newAppsSection",
  });

  return `https://${shop}/admin/themes/current/editor?${params.toString()}`;
}

function ComponentPreview({ component }) {
  return (
    <div className="motion-card-preview">
      <iframe
        src={`/preview/${component.handle}`}
        title={`${component.name} interactive preview`}
        className="motion-card-preview__frame"
        loading="lazy"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}

function PreviewModal({ component, onAfterHide }) {
  return (
    <s-modal
      id="component-preview-modal"
      heading={component ? `${component.name} preview` : "Component preview"}
      accessibilityLabel={component ? `${component.name} full-size preview` : "Component preview"}
      size="large-100"
      padding="none"
      onAfterHide={onAfterHide}
    >
      {component && (
        <div className="motion-modal-preview">
          <iframe
            key={component.handle}
            src={`/preview/${component.handle}`}
            title={`${component.name} full-size interactive preview`}
            className="motion-modal-preview__frame"
            loading="eager"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      )}
      <s-button
        slot="secondary-actions"
        command="--hide"
        commandFor="component-preview-modal"
      >
        Close
      </s-button>
    </s-modal>
  );
}

function ComponentCard({ component, template, shop, apiKey, isPro, onPreview }) {
  const supported = component.templates.includes(template);
  const locked = component.access === "Pro" && !isPro;
  const editorUrl = createThemeEditorLink({
    shop,
    apiKey,
    blockHandle: liveBlockHandles[component.handle] || component.handle,
    template,
  });

  return (
    <article className="component-card">
      <ComponentPreview component={component} />
      <div className="component-card__body">
        <div className="component-card__title-row">
          <div>
            <p className="component-card__eyebrow">{component.eyebrow}</p>
            <h2>{component.name}</h2>
          </div>
          <s-badge tone={component.access === "Free" ? "success" : "info"}>
            {component.access}
          </s-badge>
        </div>
        <p className="component-card__description">{component.description}</p>
        <dl className="component-card__facts">
          <div>
            <dt>Content</dt>
            <dd>{component.content}</dd>
          </div>
          <div>
            <dt>Performance</dt>
            <dd>{component.performance}</dd>
          </div>
        </dl>
        {!supported && (
          <div className="component-card__notice" role="status">
            Choose a supported page to add this component.
          </div>
        )}
        {locked && (
          <div className="component-card__notice component-card__notice--locked" role="status">
            Upgrade to Pro to add this component to your theme.
          </div>
        )}
        <div className="component-card__actions">
          <s-button
            variant="secondary"
            command="--show"
            commandFor="component-preview-modal"
            onClick={() => onPreview(component.handle)}
          >
            Preview
          </s-button>
          <s-button
            variant="primary"
            href={locked ? "/app/pricing" : editorUrl}
            target="_top"
            disabled={!supported || !apiKey}
          >
            {locked ? "Upgrade to Pro" : "Add to theme"}
          </s-button>
        </div>
      </div>
    </article>
  );
}

export default function Index() {
  const { apiKey, shop, billing, billingConfig, isPro } = useLoaderData();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [template, setTemplate] = useState("index");
  const [preview, setPreview] = useState(null);

  const visibleComponents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return components.filter((component) => {
      const matchesCategory = category === "All" || component.category === category;
      const matchesQuery =
        !normalizedQuery ||
        [component.name, component.description, component.category, component.content]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  const selectedTemplate = templates.find((item) => item.value === template)?.label;

  const previewComponent = components.find((component) => component.handle === preview) || null;

  return (
    <s-page heading="Motion sections">
      <s-button slot="primary-action" href="/app/additional">
        Theme setup
      </s-button>
      <s-button slot="secondary-actions" href="/app/pricing">
        Pricing
      </s-button>

      <PreviewModal component={previewComponent} onAfterHide={() => setPreview(null)} />

      <div className="library-shell">
        {billing.isDevStore ? (
          <s-banner heading="Development store" tone="info">
            All Pro components are unlocked while this store is on a Shopify development plan.
          </s-banner>
        ) : billing.hasActiveSubscription ? (
          <s-banner heading="Pro Plan active" tone="success">
            All motion sections are unlocked for this store.
          </s-banner>
        ) : billing.isTrialActive ? (
          <s-banner heading={`Pro trial: ${billing.trialDaysRemaining} days remaining`} tone="info">
            All Pro components are unlocked during your {billingConfig.trialDays}-day trial. <s-link href="/app/pricing">View pricing</s-link>
          </s-banner>
        ) : (
          <s-banner heading="Free Plan" tone="info">
            Free components remain available. <s-link href="/app/pricing">Upgrade to Pro</s-link> to unlock the complete library.
          </s-banner>
        )}

        <section className="library-hero" aria-labelledby="library-title">
          <div>
            <span className="library-hero__kicker">Storefront motion, made native</span>
            <h1 id="library-title">Build a store that moves people.</h1>
            <p>
              Discover premium animated sections here, then place, customise and preview them in
              Shopify&apos;s theme editor.
            </p>
          </div>
          <div className="library-hero__orbit" aria-hidden="true">
            <span className="library-hero__orb library-hero__orb--one" />
            <span className="library-hero__orb library-hero__orb--two" />
            <span className="library-hero__orb library-hero__orb--three" />
            <span className="library-hero__spark" />
          </div>
        </section>

        <section className="library-toolbar" aria-label="Component filters">
          <div className="library-toolbar__search">
            <s-search-field
              label="Search components"
              labelAccessibilityVisibility="exclusive"
              placeholder="Search components"
              value={query}
              onInput={(event) => setQuery(event.currentTarget.value)}
            />
          </div>
          <div className="library-toolbar__template">
            <s-select
              label="Add to"
              value={template}
              onChange={(event) => {
                setTemplate(event.currentTarget.value);
              }}
            >
              {templates.map((item) => (
                <s-option key={item.value} value={item.value}>
                  {item.label}
                </s-option>
              ))}
            </s-select>
          </div>
        </section>

        <div className="category-list" aria-label="Component categories">
          {categories.map((item) => (
            <button
              key={item}
              className={`category-chip ${category === item ? "is-active" : ""}`}
              type="button"
              aria-pressed={category === item}
              onClick={() => {
                setCategory(item);
              }}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="library-results-heading">
          <div>
            <p className="library-results-heading__eyebrow">Curated collection</p>
            <h2>{category === "All" ? "All components" : category}</h2>
          </div>
          <span>
            {visibleComponents.length} {visibleComponents.length === 1 ? "component" : "components"} · {selectedTemplate}
          </span>
        </div>

        {visibleComponents.length > 0 ? (
          <div className="component-grid">
            {visibleComponents.map((component) => (
              <ComponentCard
                key={component.handle}
                component={component}
                template={template}
                shop={shop}
                apiKey={apiKey}
                isPro={isPro}
                onPreview={setPreview}
              />
            ))}
          </div>
        ) : (
          <div className="library-empty">
            <span aria-hidden="true">✦</span>
            <h2>No components found</h2>
            <p>Try another search or category.</p>
            <s-button
              onClick={() => {
                setQuery("");
                setCategory("All");
              }}
            >
              Clear filters
            </s-button>
          </div>
        )}

        <aside className="editor-handoff">
          <div className="editor-handoff__icon" aria-hidden="true">↗</div>
          <div>
            <h2>Designed here. Finished in Shopify.</h2>
            <p>
              Add a component, then use the native editor to drag it into position, connect store
              content, tune the motion, preview every breakpoint and publish.
            </p>
          </div>
          <s-button href="/app/additional" variant="secondary">How it works</s-button>
        </aside>
      </div>
    </s-page>
  );
}

