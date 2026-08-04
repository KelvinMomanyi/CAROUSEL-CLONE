/**
 * Preview route — returns a full standalone HTML page rendering the actual
 * extension slider with demo product data.  No Shopify auth required.
 */

const PRODUCTS = [
  {
    id: 1001,
    title: "Wireless Headphones Pro",
    price: "$129.00",
    comparePrice: "$179.00",
    vendor: "AudioTech",
    type: "Electronics",
    description:
      "Premium wireless headphones with active noise cancellation and 30-hour battery life for uninterrupted listening.",
    image: "https://picsum.photos/seed/prev1/800/1000",
    thumb: "https://picsum.photos/seed/prev1/300/300",
  },
  {
    id: 1002,
    title: "Smart Watch Series X",
    price: "$299.00",
    comparePrice: null,
    vendor: "TechWear",
    type: "Accessories",
    description:
      "Advanced smartwatch with health monitoring, built-in GPS and a 7-day battery that keeps up with your lifestyle.",
    image: "https://picsum.photos/seed/prev2/800/1000",
    thumb: "https://picsum.photos/seed/prev2/300/300",
  },
  {
    id: 1003,
    title: "Running Shoes Elite",
    price: "$89.00",
    comparePrice: "$119.00",
    vendor: "SportMax",
    type: "Footwear",
    description:
      "Lightweight performance running shoes with responsive cushioning and a breathable mesh upper.",
    image: "https://picsum.photos/seed/prev3/800/1000",
    thumb: "https://picsum.photos/seed/prev3/300/300",
  },
  {
    id: 1004,
    title: "Canvas Backpack",
    price: "$69.00",
    comparePrice: null,
    vendor: "UrbanGear",
    type: "Bags",
    description:
      "Durable waxed-canvas backpack with multiple compartments, a padded laptop sleeve and water-resistant finish.",
    image: "https://picsum.photos/seed/prev4/800/1000",
    thumb: "https://picsum.photos/seed/prev4/300/300",
  },
  {
    id: 1005,
    title: "Polarized Sunglasses",
    price: "$149.00",
    comparePrice: "$199.00",
    vendor: "VisionCo",
    type: "Accessories",
    description:
      "UV400 polarized lenses in a lightweight titanium frame with scratch-resistant coating.",
    image: "https://picsum.photos/seed/prev5/800/1000",
    thumb: "https://picsum.photos/seed/prev5/300/300",
  },
  {
    id: 1006,
    title: "Ceramic Pour-Over Set",
    price: "$45.00",
    comparePrice: null,
    vendor: "BrewHouse",
    type: "Kitchen",
    description:
      "Handcrafted ceramic pour-over set with matching carafe, perfect for a slow-brew morning ritual.",
    image: "https://picsum.photos/seed/prev6/800/1000",
    thumb: "https://picsum.photos/seed/prev6/300/300",
  },
];

// ---------- per-type slider HTML builders ----------

function sliderMain(products) {
  const slides = products
    .map(
      (p) => `
    <article class="shv-slide" data-carousel-slide aria-hidden="true" inert>
      <img src="${p.image}" class="slider-img" alt="${p.title}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">
      <div class="shv-slide-content">
        <div class="shv-slide-meta"><a href="#">${p.title}</a></div>
        <div class="shv-slide-title"><span class="price-span">${p.price}</span></div>
        <div class="buttons">
          <button type="button" class="shv-add-to-cart-btn"><span aria-hidden="true">+</span><span class="hide-on-mobile">Add to cart</span></button>
        </div>
      </div>
    </article>`
    )
    .join("");

  const thumbs = products
    .map(
      (p) => `
    <div class="shv-slide">
      <img src="${p.thumb}" class="thumbnail-img" alt="" loading="lazy">
    </div>`
    )
    .join("");

  return `
<div
  id="shv-carousel-demo"
  class="shv-main-slider shv-gradient-enabled shv-gradient-rounded"
  data-shv-main-slider
  data-carousel-root
  data-carousel-layout="slider-main"
  style="--theme-accent:#f1683a;--theme-text:#ffffff;--theme-bg:#111418;"
  role="region"
  aria-roledescription="carousel"
  aria-label="Featured products"
>
  <div class="shv-slider-track" aria-live="off">${slides}</div>
  <div class="shv-slider-thumbs" aria-hidden="true">${thumbs}</div>
  <div class="shv-slider-nav" role="group" aria-label="Carousel controls">
    <button type="button" class="shv-nav-prev" aria-label="Previous">&#8249;</button>
    <button type="button" class="shv-nav-next" aria-label="Next">&#8250;</button>
  </div>
  <div class="slider-progress" aria-hidden="true"></div>
</div>`;
}

function sliderModern(products) {
  const slides = products
    .map(
      (p) => `
    <article class="shv-slide" data-carousel-slide aria-hidden="true" inert>
      <img src="${p.image}" class="slider-img" alt="${p.title}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">
      <div class="shv-slide-content">
        <div class="shv-slide-meta"><a href="#">${p.title}</a></div>
        <div class="shv-slide-title">
          ${p.comparePrice ? `<span class="price-compare">${p.comparePrice}</span>` : ""}
          <span class="price-span">${p.price}</span>
        </div>
        <div class="buttons">
          <button type="button" class="shv-add-to-cart-btn"><span aria-hidden="true">+</span><span class="hide-on-mobile">Add to cart</span></button>
        </div>
      </div>
    </article>`
    )
    .join("");

  const thumbs = products
    .map(
      (p) => `
    <div class="shv-slide">
      <img src="${p.thumb}" class="thumbnail-img" alt="" loading="lazy">
    </div>`
    )
    .join("");

  return `
<div
  id="shv-modern-demo"
  class="shv-slider-wrapper gradient shv-gradient-enabled shv-gradient-rounded"
  data-carousel-root
  data-carousel-layout="slider-12"
  style="--shv-bg-rgb:17,20,24;--shv-bg:#111418;--shv-text:#ffffff;--shv-button:#f1683a;--shv-accent:#f1683a;"
  role="region"
  aria-roledescription="carousel"
  aria-label="Featured products"
>
  <div class="shv-slider-track" aria-live="off">${slides}</div>
  <div class="shv-slider-thumbs" aria-hidden="true">${thumbs}</div>
  <div class="shv-slider-nav" role="group" aria-label="Carousel controls">
    <button type="button" class="shv-nav-prev" aria-label="Previous">&#8249;</button>
    <button type="button" class="shv-nav-next" aria-label="Next">&#8250;</button>
  </div>
  <div class="slider-progress" aria-hidden="true"></div>
</div>`;
}

function sliderAerphone(products) {
  const items = products
    .map(
      (p) => `
    <div class="item">
      <img src="${p.image}" alt="${p.title}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">
      <div class="introduce">
        <div class="productName">${p.title}</div>
        <div class="productPrice">${p.price}</div>
        <div class="productActions">
          <button class="addToCart" type="button">Add to cart</button>
          <p class="cartFeedback" aria-live="polite"></p>
        </div>
      </div>
      <div class="detail">
        <div class="title">${p.title}</div>
        <div class="des">${p.description}</div>
        <div class="specifications">
          <div><p>Price</p><p>${p.price}</p></div>
          <div><p>Vendor</p><p>${p.vendor}</p></div>
          <div><p>Type</p><p>${p.type}</p></div>
          <div><p>Status</p><p>In stock</p></div>
        </div>
        <div class="checkout">
          <button type="button">View product</button>
        </div>
      </div>
    </div>`
    )
    .join("");

  return `
<div
  id="slider-03-demo"
  class="slider-03-root"
  data-slider-03
  data-carousel-root
  data-carousel-layout="slider-03"
  style="--slider-03-height:800px;"
  role="region"
  aria-roledescription="carousel"
  aria-label="Featured products"
>
  <div class="carousel">
    <div class="list">${items}</div>
    <div class="arrows">
      <button data-slider-03-prev type="button" aria-label="Previous">&#8249;</button>
      <button data-slider-03-next type="button" aria-label="Next">&#8250;</button>
    </div>
  </div>
</div>`;
}

function sliderSwift(products) {
  const items = products
    .map(
      (p) => `
    <div class="item">
      <figure>
        <img src="${p.image}" alt="${p.title}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">
      </figure>
      <div class="content">
        <p class="category">${p.type}</p>
        <h2>${p.title}</h2>
        <p class="price">${p.price}</p>
        <p class="description">${p.description}</p>
        <div class="more">
          <button type="button">Add to cart</button>
          <button type="button">&#9654; View product</button>
          <p class="cart-feedback" aria-live="polite"></p>
        </div>
      </div>
    </div>`
    )
    .join("");

  const indicators = products
    .map(
      (_, i) =>
        `<li${i === 0 ? ' class="active"' : ""}><button type="button" aria-label="Slide ${i + 1}"></button></li>`
    )
    .join("");

  return `
<div
  id="slider-06-demo"
  class="slider-06-root"
  data-carousel-root
  data-carousel-layout="slider-06"
  style="--s06-height:700px;"
  role="region"
  aria-roledescription="carousel"
  aria-label="Featured products"
>
  <section class="carousel">
    <div class="list">${items}</div>
    <div class="arrows">
      <button data-slider-06-prev type="button" aria-label="Previous">&#8249;</button>
      <button data-slider-06-next type="button" aria-label="Next">&#8250;</button>
    </div>
    <div class="indicators"><ul>${indicators}</ul></div>
  </section>
</div>`;
}

function sliderOrbitRing(products) {
  const items = products
    .map(
      (p, i) => `
    <div
      class="item"
      style="--position:${i + 1}"
      data-image="${p.image}"
      data-title="${p.title}"
      data-price="${p.price}"
      data-id="${p.id}"
      data-product-id="${p.id}"
      data-available="true"
      data-has-options="false"
      data-url="#"
    >
      <img src="${p.image}" alt="${p.title}" loading="lazy" width="900" height="900" style="width:100%;height:100%;object-fit:cover;">
    </div>`
    )
    .join("");

  const first = products[0];
  return `
<div
  id="slider-07-demo"
  class="slider-07-root"
  data-slider-07-root
  data-carousel-root
  data-carousel-layout="slider-07"
  data-add-label="Add to cart"
  data-sold-label="Sold out"
  data-options-label="Choose options"
  style="--bg-color:#0b0c10;--slider-07-section-height:700px;--3d-perspective:1000px;--3d-tilt:-22deg;--3d-radius:420px;"
  role="region"
  aria-roledescription="carousel"
  aria-label="Featured products"
>
  <div class="banner">
    <div class="slider" style="--quantity:${products.length}">${items}</div>
    <div class="content display-content">
      <div class="active-product-display" id="activeDisplay-demo">
        <button type="button" class="close-display-btn" aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
        <img src="${first.image}" id="activeImg-demo" alt="${first.title}" width="600" height="600" style="object-fit:cover;">
        <div class="product-info-panel">
          <h2 id="activeTitle-demo">${first.title}</h2>
          <p id="activePrice-demo">${first.price}</p>
          <form id="activeForm-demo" class="active-product-form">
            <input type="hidden" name="id" id="activeId-demo" value="${first.id}">
            <input type="hidden" name="quantity" value="1">
            <button type="button" class="btn" id="activeButton-demo">Add to cart</button>
          </form>
          <p class="add-to-cart-feedback" id="activeFeedback-demo" aria-live="polite"></p>
        </div>
      </div>
    </div>
  </div>
</div>`;
}

function sliderElegance(products) {
  const COLORS = ["#428372", "#EEAA19", "#e86c3f"];
  const items = products
    .map(
      (p, i) => `
    <div
      class="item${i === 0 ? " active" : ""}"
      data-title="${p.title}"
      style="--img-src:url('${p.image}');--bg-color:${COLORS[i % 3]};"
    >
      <div class="content">
        <div class="image">
          <div class="image-mask"></div>
          <img src="${p.image}" class="creative-product-img" alt="${p.title}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">
        </div>
        <div class="info">
          <div class="title">${p.title}</div>
          <div class="price">
            ${p.comparePrice ? `<span class="compare">${p.comparePrice}</span>` : ""}
            <span>${p.price}</span>
          </div>
          <div class="actions">
            <button class="add-to-cart" type="button">Add to cart</button>
            <p class="cart-feedback" aria-live="polite"></p>
          </div>
        </div>
      </div>
    </div>`
    )
    .join("");

  const dots = products
    .map(
      (p, i) =>
        `<li${i === 0 ? ' class="active"' : ""}><button type="button" aria-label="${p.title}"></button></li>`
    )
    .join("");

  return `
<div
  id="slider-09-demo"
  class="slider-09-root"
  data-carousel-root
  data-carousel-layout="slider-09"
  style="--s09-height:720px;"
  role="region"
  aria-roledescription="carousel"
  aria-label="Featured products"
>
  <div class="carousel">
    <div class="list">${items}</div>
    <div class="arrows">
      <button class="arrows-prev" type="button" aria-label="Previous">&#8249;</button>
      <button class="arrows-next" type="button" aria-label="Next">&#8250;</button>
    </div>
    <ul class="dots">${dots}</ul>
  </div>
</div>`;
}

function sliderVanish(products) {
  const items = products
    .map(
      (p) => `
    <div class="item">
      <div class="image">
        <img src="${p.image}" alt="${p.title}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">
      </div>
      <div class="content">
        <div class="left">
          <h2>${p.title}</h2>
          <div class="des">${p.description}</div>
          <button class="add-to-cart" type="button">Add to cart</button>
          <button class="see-more" type="button">View product <span aria-hidden="true">&#8250;&#8250;&#8250;</span></button>
        </div>
        <div class="right">
          <h2>Details</h2>
          <ul>
            <li><p>Price</p><p>${p.price}</p></li>
            <li><p>Vendor</p><p>${p.vendor}</p></li>
            <li><p>Type</p><p>${p.type}</p></li>
          </ul>
        </div>
      </div>
    </div>`
    )
    .join("");

  return `
<div
  id="slider-10-demo"
  class="slider-10-root gradient"
  data-carousel-root
  data-carousel-layout="slider-10"
  style="--s10-height:700px;"
  role="region"
  aria-roledescription="carousel"
  aria-label="Featured products"
>
  <div class="container">
    <div id="slide-demo">${items}</div>
    <div class="directional">
      <button id="prev-demo" type="button" aria-label="Previous">&#8249;</button>
      <button id="next-demo" type="button" aria-label="Next">&#8250;</button>
    </div>
  </div>
</div>`;
}

function sliderCoverflow(products) {
  const items = products
    .map(
      (p) => `
    <article class="item" style="background-image:url('${p.image}');" data-carousel-slide>
      <div class="content">
        <div class="name">${p.title}</div>
        <div class="price">
          ${p.comparePrice ? `<span class="compare">${p.comparePrice}</span>` : ""}
          <span>${p.price}</span>
        </div>
        <div class="actions">
          <button class="add-to-cart" type="button">Add to cart</button>
        </div>
      </div>
    </article>`
    )
    .join("");

  return `
<div
  id="slider-11-demo"
  class="slider-11-root gradient"
  data-slider-11
  data-carousel-root
  data-carousel-layout="slider-11"
  style="--slider-11-height:700px;"
  role="region"
  aria-roledescription="carousel"
  aria-label="Featured products"
>
  <div class="container">
    <div id="slide-demo" data-slider-11-track>${items}</div>
    <div class="buttons">
      <button type="button" data-slider-11-prev aria-label="Previous">&#8249;</button>
      <button type="button" data-slider-11-next aria-label="Next">&#8250;</button>
    </div>
  </div>
</div>`;
}

function sliderCardStack(products) {
  const items = products
    .map(
      (p) => `
    <article class="item">
      <a href="#" class="item__media" aria-label="${p.title}">
        <img src="${p.image}" class="item__image" alt="${p.title}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">
      </a>
      <div class="item__body">
        <h2>${p.title}</h2>
        <div class="item__price-row">
          ${p.comparePrice ? `<span class="item__compare">${p.comparePrice}</span>` : ""}
          <span class="item__price">${p.price}</span>
        </div>
        <div class="item__footer">
          <div class="item__actions">
            <button class="item__cart-button" type="button">
              <span class="item__cart-button-icon" aria-hidden="true">+</span>
              <span class="item__cart-button-copy">
                <span class="item__cart-button-label">Add to cart</span>
              </span>
            </button>
            <p class="item__cart-feedback" aria-live="polite"></p>
          </div>
        </div>
      </div>
    </article>`
    )
    .join("");

  return `
<div
  id="slider-13-demo"
  class="slider-13-root"
  data-carousel-root
  data-carousel-layout="slider-13"
  data-autoplay-speed="4"
  style="--slider-13-height:560px;"
  role="region"
  aria-roledescription="carousel"
  aria-label="Featured products"
>
  <div class="slider">
    ${items}
    <div class="slider__controls" role="group" aria-label="Carousel controls">
      <button class="slider-13-prev" type="button" aria-label="Previous">&#8249;</button>
      <button class="slider-13-next" type="button" aria-label="Next">&#8250;</button>
    </div>
  </div>
</div>`;
}

function sliderProductSlideshow(products) {
  const slides = products
    .map(
      (p, i) => `
    <article class="pss__slide" data-slide data-index="${i}" data-product-id="${p.id}">
      <button class="pss__image-button" type="button" data-activate aria-label="Focus: ${p.title}">
        <span class="pss__image-frame">
          <img src="${p.image}" class="pss__image" alt="${p.title}" loading="${i === 0 ? "eager" : "lazy"}">
        </span>
      </button>
    </article>`
    )
    .join("");

  return `
<carousel-product-slideshow
  id="ProductSlideshow-demo"
  class="pss"
  data-initial-index="-1"
  data-autoplay="0"
  data-focus-width="200"
  data-image-height="250"
  data-gap="16"
  data-max-scale="200"
  data-size-decrement="15"
  data-hover-scale="105"
  data-inactive-opacity="20"
  data-hover-sibling-opacity="50"
  data-details-inset="20"
  data-status-template="Showing {product}"
  data-added-label="Added"
  data-adding-label="Adding..."
  data-error-label="Error"
  data-sold-out-label="Sold out"
  data-unavailable-label="Unavailable"
  style="
    --pss-background:#ffffff;--pss-text:#000000;--pss-muted:#575757;
    --pss-backdrop:#f0f0f0;--pss-backdrop-size:120px;
    --pss-stage-height:640px;--pss-image-height:250px;--pss-focus-width:200px;
    --pss-gap:16px;--pss-radius:8px;--pss-transition:500ms;--pss-easing:ease-in-out;
    --pss-thumbnail-size:32px;--pss-thumbnail-gap:8px;--pss-thumbnail-radius:4px;
    --pss-thumbnail-opacity:0.5;--pss-details-width:300px;--pss-details-background:transparent;
    --pss-details-padding:20px;--pss-details-gap:20px;--pss-details-radius:8px;
    --pss-variant-text:#bcb7c9;--pss-variant-border:#bcb7c9;--pss-variant-active-text:#ffffff;
    --pss-variant-active-border:#000000;--pss-button-background:transparent;
    --pss-button-text:#ffffff;--pss-button-border:#000000;
    --pss-button-hover-background:#333333;--pss-button-hover-text:#ffffff;
  "
>
  <section class="pss__section" aria-label="Featured products">
    <div class="pss__backdrop" aria-hidden="true">PREVIEW</div>
    <div class="pss__viewport" data-viewport tabindex="0">
      <div class="pss__track" data-track>${slides}</div>
    </div>
    <div class="pss__controls">
      <button class="pss__arrow pss__arrow--previous" type="button" data-previous aria-label="Previous">&#8592;</button>
      <button class="pss__arrow pss__arrow--next" type="button" data-next aria-label="Next">&#8594;</button>
    </div>
    <p class="pss__status visually-hidden" data-status aria-live="polite"></p>
  </section>
</carousel-product-slideshow>`;
}

function sliderProductCoverflow(products) {
  const cards = products
    .map(
      (p) => `
    <div data-coverflow-card>
      <article class="ms-product-card">
        <a class="ms-product-card__link" href="#" aria-label="${p.title}">
          <div class="ms-product-card__media">
            <img src="${p.image}" alt="${p.title}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">
          </div>
          <div class="ms-product-card__meta">
            <h3 class="ms-product-card__title">${p.title}</h3>
            <p class="ms-product-card__price">${p.price}</p>
          </div>
        </a>
      </article>
    </div>`
    )
    .join("");

  return `
<section
  class="ms-section"
  style="--ms-bg:#1d1725;--ms-text:#f6f0ff;--ms-accent:#c8a7ff;--ms-padding:72px;--ms-radius:24px;"
>
  <div class="ms-section__header">
    <div>
      <p class="ms-section__eyebrow">Centre stage</p>
      <h2 class="ms-section__heading">Meet the icons</h2>
      <p class="ms-section__copy">A dimensional showcase for the products that define your collection.</p>
    </div>
  </div>
  <motion-coverflow class="ms-coverflow" data-autoplay="5">
    <div class="ms-coverflow__stage">${cards}</div>
    <div class="ms-coverflow__controls">
      <button class="ms-icon-button" type="button" data-coverflow-previous aria-label="Previous">&#8592;</button>
      <button class="ms-icon-button" type="button" data-coverflow-next aria-label="Next">&#8594;</button>
    </div>
  </motion-coverflow>
</section>`;
}

function sliderAnimatedHero() {
  return `
<section
  class="ms-hero"
  style="--ms-height:720px;--ms-align:center;--ms-overlay:0.55;--ms-accent:#c5ffdf;"
>
  <div class="ms-hero__media">
    <img src="https://picsum.photos/seed/hero1/1400/720" alt="Hero image" loading="eager" style="width:100%;height:100%;object-fit:cover;">
  </div>
  <div class="ms-hero__overlay"></div>
  <div class="ms-hero__content">
    <div class="ms-hero__content-inner">
      <p class="ms-hero__eyebrow">Spring / Summer 2026</p>
      <h2 class="ms-hero__heading">Made for the long way home</h2>
      <p class="ms-hero__copy">Lightweight layers and quiet details for the moments between here and there.</p>
      <div class="ms-hero__actions">
        <a class="ms-button" href="#">Shop the collection</a>
        <a class="ms-button ms-button--secondary" href="#">Our story</a>
      </div>
    </div>
  </div>
</section>`;
}

function sliderMarquee(products) {
  const card = (p) => `
    <article class="ms-product-card">
      <a class="ms-product-card__link" href="#" aria-label="${p.title}">
        <div class="ms-product-card__media">
          <img src="${p.thumb}" alt="${p.title}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">
        </div>
        <div class="ms-product-card__meta">
          <h3 class="ms-product-card__title">${p.title}</h3>
          <p class="ms-product-card__price">${p.price}</p>
        </div>
      </a>
    </article>`;

  return `
<section
  class="ms-section"
  style="--ms-bg:#ffffff;--ms-text:#000000;--ms-accent:#f1683a;--ms-padding:60px;--ms-gap:16px;--ms-radius:12px;"
>
  <div class="ms-section__header">
    <div>
      <p class="ms-section__eyebrow">Popular</p>
      <h2 class="ms-section__heading">The whole collection</h2>
    </div>
  </div>
  <div class="ms-marquee" style="--ms-duration:30s;--ms-direction:normal;">
    <div class="ms-marquee__set">${products.map(card).join("")}</div>
    <div class="ms-marquee__set" aria-hidden="true">${products.map(card).join("")}</div>
  </div>
</section>`;
}

function sliderGenericMotion(name, products) {
  const cards = products
    .map(
      (p) => `
    <article class="ms-product-card">
      <a class="ms-product-card__link" href="#" aria-label="${p.title}">
        <div class="ms-product-card__media">
          <img src="${p.image}" alt="${p.title}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">
        </div>
        <div class="ms-product-card__meta">
          <h3 class="ms-product-card__title">${p.title}</h3>
          <p class="ms-product-card__price">${p.price}</p>
        </div>
      </a>
    </article>`
    )
    .join("");

  return `
<section
  class="ms-section"
  style="--ms-bg:#ffffff;--ms-text:#000000;--ms-accent:#f1683a;--ms-padding:60px;--ms-radius:12px;"
>
  <div class="ms-section__header">
    <div>
      <h2 class="ms-section__heading">${name}</h2>
      <p class="ms-section__copy">Live preview with sample products.</p>
    </div>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:16px;padding:0 24px 40px;">${cards}</div>
</section>`;
}

// ---------- handle → { css, js, html } ----------

const CONFIGS = {
  carousel_slider: {
    css: "slider-main.css",
    js: "slider-main.js",
    render: (p) => sliderMain(p),
  },
  carousel_modern: {
    css: "slider-12.css",
    js: "slider-12.js",
    render: (p) => sliderModern(p),
  },
  carousel_aerphone: {
    css: "slider-03-aerphone.css",
    js: "slider-03-aerphone.js",
    render: (p) => sliderAerphone(p),
  },
  carousel_swift: {
    css: "slider-06.css",
    js: "slider-06.js",
    render: (p) => sliderSwift(p.slice(0, 4)),
  },
  carousel_orbit_ring: {
    css: "slider-07.css",
    js: "slider-07.js",
    render: (p) => sliderOrbitRing(p),
  },
  carousel_elegance: {
    css: "slider-09.css",
    js: "slider-09.js",
    render: (p) => sliderElegance(p.slice(0, 4)),
  },
  carousel_vanish: {
    css: "slider-10.css",
    js: "slider-10.js",
    render: (p) => sliderVanish(p.slice(0, 4)),
  },
  carousel_coverflow: {
    css: "slider-11-cards.css",
    js: "slider-11-cards.js",
    render: (p) => sliderCoverflow(p),
  },
  carousel_card_stack: {
    css: "slider-13.css",
    js: "slider-13.js",
    render: (p) => sliderCardStack(p),
  },
  "product-slideshow": {
    css: "product-slideshow.css",
    js: "product-slideshow.js",
    render: (p) => sliderProductSlideshow(p),
  },
  product_coverflow: {
    css: "motion-sections.css",
    js: "motion-sections.js",
    render: (p) => sliderProductCoverflow(p),
  },
  animated_hero: {
    css: "motion-sections.css",
    js: "motion-sections.js",
    render: () => sliderAnimatedHero(),
  },
  infinite_marquee: {
    css: "motion-sections.css",
    js: "motion-sections.js",
    render: (p) => sliderMarquee(p),
  },
  product_story: {
    css: "motion-sections.css",
    js: "motion-sections.js",
    render: (p) => sliderGenericMotion("Horizontal product story", p),
  },
  shoppable_gallery: {
    css: "motion-sections.css",
    js: "motion-sections.js",
    render: (p) => sliderGenericMotion("Shoppable gallery", p),
  },
  testimonials: {
    css: "motion-sections.css",
    js: "motion-sections.js",
    render: () => `
<section class="ms-section" style="--ms-bg:#fafaf8;--ms-text:#1a1a1a;--ms-accent:#bd9b6e;--ms-padding:80px;">
  <motion-testimonials class="ms-testimonials" data-autoplay="5">
    <p class="ms-section__eyebrow">Social proof</p>
    <div class="ms-testimonials__viewport" aria-live="polite">
      <article class="ms-testimonials__slide" data-testimonial-slide>
        <div class="ms-testimonials__stars" aria-hidden="true">★★★★★</div>
        <blockquote>"Absolutely love this product. The quality exceeded my expectations and the delivery was super fast."</blockquote>
        <cite>Alex M. — Verified buyer</cite>
      </article>
      <article class="ms-testimonials__slide" data-testimonial-slide aria-hidden="true" inert>
        <div class="ms-testimonials__stars" aria-hidden="true">★★★★★</div>
        <blockquote>"Best purchase I've made this year. Will definitely be buying more from this store."</blockquote>
        <cite>Jordan T. — Verified buyer</cite>
      </article>
      <article class="ms-testimonials__slide" data-testimonial-slide aria-hidden="true" inert>
        <div class="ms-testimonials__stars" aria-hidden="true">★★★★★</div>
        <blockquote>"Incredibly well designed. Looks exactly as pictured and feels premium in person."</blockquote>
        <cite>Sam K. — Verified buyer</cite>
      </article>
    </div>
    <div class="ms-testimonials__controls">
      <button class="ms-icon-button" type="button" data-testimonials-previous aria-label="Previous">&#8592;</button>
      <button class="ms-icon-button" type="button" data-testimonials-next aria-label="Next">&#8594;</button>
    </div>
  </motion-testimonials>
</section>`,
  },
  image_reveal: {
    css: "motion-sections.css",
    js: "motion-sections.js",
    render: () => `
<section class="ms-section" style="--ms-bg:#f5f5f5;--ms-text:#1a1a1a;--ms-accent:#227c68;--ms-padding:60px;">
  <div class="ms-section__header">
    <div>
      <p class="ms-section__eyebrow">Storytelling</p>
      <h2 class="ms-section__heading">See the difference</h2>
    </div>
  </div>
  <motion-image-reveal class="ms-reveal" data-orientation="horizontal">
    <div class="ms-reveal__before">
      <img src="https://picsum.photos/seed/reveal-before/900/600" alt="Before" loading="eager" style="width:100%;height:100%;object-fit:cover;">
      <span class="ms-reveal__label">Before</span>
    </div>
    <div class="ms-reveal__after">
      <img src="https://picsum.photos/seed/reveal-after/900/600" alt="After" loading="eager" style="width:100%;height:100%;object-fit:cover;">
      <span class="ms-reveal__label">After</span>
    </div>
    <div class="ms-reveal__handle" aria-hidden="true"></div>
    <input class="ms-reveal__range" type="range" min="0" max="100" value="50" aria-label="Reveal slider">
  </motion-image-reveal>
</section>`,
  },
};

function buildPreviewHtml(handle) {
  const config = CONFIGS[handle];
  if (!config) {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Preview</title></head>
<body style="display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:sans-serif;background:#111;color:#666;">
<p>No preview available for "${handle}".</p>
</body></html>`;
  }

  const sliderHtml = config.render(PRODUCTS);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; overflow-x: hidden; min-height: 100vh; }
    a { pointer-events: none; }
    form button[type="submit"], form { pointer-events: none; }
  </style>
  <link rel="stylesheet" href="/extension-assets/${config.css}">
</head>
<body>
${sliderHtml}
<script src="/extension-assets/${config.js}"></script>
</body>
</html>`;
}

export const loader = ({ params }) => {
  const html = buildPreviewHtml(params.handle);
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
};
