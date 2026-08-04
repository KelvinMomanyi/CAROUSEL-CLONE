/**
 * Preview route — returns a full standalone HTML page rendering the actual
 * extension slider with real CSS/JS and demo product data that mirrors
 * what the Liquid templates output.  No Shopify auth required.
 */

// ---------------------------------------------------------------------------
// Demo product data
// Each product has both a landscape image (for full-bleed hero sliders) and a
// portrait image (for card / stack layouts).  Same picsum seed → same photo,
// just different crop so the pairing stays visually consistent.
// ---------------------------------------------------------------------------
const PRODUCTS = [
  {
    id: 1001,
    title: "Wireless Headphones Pro",
    price: "$129.00",
    comparePrice: "$179.00",
    vendor: "AudioTech",
    type: "Electronics",
    handle: "wireless-headphones-pro",
    description:
      "Premium wireless headphones with active noise cancellation and 30-hour battery life for uninterrupted listening.",
    image: "https://picsum.photos/seed/pd01/1400/900",
    portrait: "https://picsum.photos/seed/pd01/700/900",
    square: "https://picsum.photos/seed/pd01/640/640",
    thumb: "https://picsum.photos/seed/pd01/300/380",
  },
  {
    id: 1002,
    title: "Smart Watch Series X",
    price: "$299.00",
    comparePrice: null,
    vendor: "TechWear",
    type: "Accessories",
    handle: "smart-watch-series-x",
    description:
      "Advanced smartwatch with health monitoring, built-in GPS and a 7-day battery that keeps up with your lifestyle.",
    image: "https://picsum.photos/seed/pd02/1400/900",
    portrait: "https://picsum.photos/seed/pd02/700/900",
    square: "https://picsum.photos/seed/pd02/640/640",
    thumb: "https://picsum.photos/seed/pd02/300/380",
  },
  {
    id: 1003,
    title: "Running Shoes Elite",
    price: "$89.00",
    comparePrice: "$119.00",
    vendor: "SportMax",
    type: "Footwear",
    handle: "running-shoes-elite",
    description:
      "Lightweight performance running shoes with responsive cushioning and a breathable mesh upper.",
    image: "https://picsum.photos/seed/pd03/1400/900",
    portrait: "https://picsum.photos/seed/pd03/700/900",
    square: "https://picsum.photos/seed/pd03/640/640",
    thumb: "https://picsum.photos/seed/pd03/300/380",
  },
  {
    id: 1004,
    title: "Canvas Backpack",
    price: "$69.00",
    comparePrice: null,
    vendor: "UrbanGear",
    type: "Bags",
    handle: "canvas-backpack",
    description:
      "Durable waxed-canvas backpack with multiple compartments, a padded laptop sleeve and water-resistant finish.",
    image: "https://picsum.photos/seed/pd04/1400/900",
    portrait: "https://picsum.photos/seed/pd04/700/900",
    square: "https://picsum.photos/seed/pd04/640/640",
    thumb: "https://picsum.photos/seed/pd04/300/380",
  },
  {
    id: 1005,
    title: "Polarized Sunglasses",
    price: "$149.00",
    comparePrice: "$199.00",
    vendor: "VisionCo",
    type: "Accessories",
    handle: "polarized-sunglasses",
    description:
      "UV400 polarized lenses in a lightweight titanium frame with scratch-resistant coating.",
    image: "https://picsum.photos/seed/pd05/1400/900",
    portrait: "https://picsum.photos/seed/pd05/700/900",
    square: "https://picsum.photos/seed/pd05/640/640",
    thumb: "https://picsum.photos/seed/pd05/300/380",
  },
  {
    id: 1006,
    title: "Ceramic Pour-Over Set",
    price: "$45.00",
    comparePrice: null,
    vendor: "BrewHouse",
    type: "Kitchen",
    handle: "ceramic-pour-over-set",
    description:
      "Handcrafted ceramic pour-over set with matching carafe, perfect for a slow-brew morning ritual.",
    image: "https://picsum.photos/seed/pd06/1400/900",
    portrait: "https://picsum.photos/seed/pd06/700/900",
    square: "https://picsum.photos/seed/pd06/640/640",
    thumb: "https://picsum.photos/seed/pd06/300/380",
  },
  {
    id: 1007,
    title: "Merino Wool Sweater",
    price: "$165.00",
    comparePrice: "$210.00",
    vendor: "WoolCo",
    type: "Clothing",
    handle: "merino-wool-sweater",
    description:
      "Soft 100% merino wool sweater in a relaxed fit — warm, breathable and naturally odour-resistant.",
    image: "https://picsum.photos/seed/pd07/1400/900",
    portrait: "https://picsum.photos/seed/pd07/700/900",
    square: "https://picsum.photos/seed/pd07/640/640",
    thumb: "https://picsum.photos/seed/pd07/300/380",
  },
  {
    id: 1008,
    title: "Leather Wallet Slim",
    price: "$55.00",
    comparePrice: null,
    vendor: "CraftCo",
    type: "Accessories",
    handle: "leather-wallet-slim",
    description:
      "Full-grain leather slim wallet with RFID protection and space for 6 cards plus a cash slot.",
    image: "https://picsum.photos/seed/pd08/1400/900",
    portrait: "https://picsum.photos/seed/pd08/700/900",
    square: "https://picsum.photos/seed/pd08/640/640",
    thumb: "https://picsum.photos/seed/pd08/300/380",
  },
];

// ---------------------------------------------------------------------------
// Per-type HTML builders — each mirrors the Liquid template output exactly
// ---------------------------------------------------------------------------

/** carousel_slider — slider-main.css / slider-main.js */
function sliderMain(products) {
  const slides = products
    .map(
      (p, i) => `
  <article class="shv-slide" data-carousel-slide>
    <img src="${p.image}" class="slider-img" alt="${p.title}" loading="${i === 0 ? "eager" : "lazy"}" width="1400" height="900" style="width:100%;height:100%;object-fit:cover;">
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
    <img src="${p.thumb}" class="thumbnail-img" alt="" loading="lazy" width="300" height="380">
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
  style="--theme-accent:#f1683a;--theme-text:#ffffff;--theme-bg:#111418;--section-height:700px;"
  role="region"
  aria-roledescription="carousel"
  aria-label="Featured products"
>
  <div class="shv-slider-track" aria-live="polite">${slides}</div>
  <div class="shv-slider-thumbs" aria-hidden="true">${thumbs}</div>
  <div class="shv-slider-nav" role="group" aria-label="Carousel controls">
    <button type="button" class="shv-nav-prev" aria-label="Previous">&#8249;</button>
    <button type="button" class="shv-nav-next" aria-label="Next">&#8250;</button>
  </div>
  <div class="slider-progress" aria-hidden="true"></div>
</div>`;
}

/** carousel_modern — slider-12.css / slider-12.js */
function sliderModern(products) {
  const slides = products
    .map(
      (p, i) => `
  <article class="shv-slide" data-carousel-slide>
    <img src="${p.image}" class="slider-img" alt="${p.title}" loading="${i === 0 ? "eager" : "lazy"}" width="1400" height="900" style="width:100%;height:100%;object-fit:cover;">
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
    <img src="${p.thumb}" class="thumbnail-img" alt="" loading="lazy" width="300" height="380">
  </div>`
    )
    .join("");

  return `
<div
  id="shv-modern-demo"
  class="shv-slider-wrapper gradient shv-gradient-enabled shv-gradient-rounded"
  data-carousel-root
  data-carousel-layout="slider-12"
  style="
    --shv-bg-rgb:17,20,24;--shv-bg:#111418;
    --shv-text-rgb:255,255,255;--shv-text:#ffffff;
    --shv-button-rgb:241,104,58;--shv-button:#f1683a;--shv-accent:#f1683a;
    --shv-button-text-rgb:17,20,24;--shv-button-text:#111418;
    --shv-outline-rgb:255,255,255;--shv-outline:#ffffff;
    --shv-shadow-rgb:0,0,0;
    --section-height:700px;
    --custom-text-color:#ffffff;
  "
  role="region"
  aria-roledescription="carousel"
  aria-label="Featured products"
>
  <div class="shv-slider-track" aria-live="polite">${slides}</div>
  <div class="shv-slider-thumbs" aria-hidden="true">${thumbs}</div>
  <div class="shv-slider-nav" role="group" aria-label="Carousel controls">
    <button type="button" class="shv-nav-prev" aria-label="Previous">&#8249;</button>
    <button type="button" class="shv-nav-next" aria-label="Next">&#8250;</button>
  </div>
  <div class="slider-progress" aria-hidden="true"></div>
</div>`;
}

/** carousel_aerphone — slider-03-aerphone.css / slider-03-aerphone.js */
function sliderAerphone(products) {
  const items = products
    .map(
      (p, i) => `
  <div class="item">
    <img src="${p.portrait}" alt="${p.title}" loading="${i === 0 ? "eager" : "lazy"}" width="700" height="900" style="width:100%;height:100%;object-fit:cover;">
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
        <div><p>Handle</p><p>${p.handle}</p></div>
      </div>
      <div class="checkout">
        <button type="button">View product</button>
        <p class="cartFeedback cartFeedback--detail" aria-live="polite"></p>
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

/** carousel_swift — slider-06.css / slider-06.js */
function sliderSwift(products) {
  const items = products
    .map(
      (p, i) => `
  <div class="item">
    <figure>
      <img src="${p.image}" alt="${p.title}" loading="${i === 0 ? "eager" : "lazy"}" width="1400" height="900" style="width:100%;height:100%;object-fit:cover;">
    </figure>
    <div class="content">
      ${p.type ? `<p class="category">${p.type}</p>` : ""}
      <h2>${p.title}</h2>
      <p class="price">${p.price}</p>
      <p class="description">${p.description}</p>
      <div class="more">
        <button type="button">Add to cart</button>
        <button type="button" data-url="#"><span aria-hidden="true">&#9654;</span> View product</button>
        <p class="cart-feedback" aria-live="polite"></p>
      </div>
    </div>
  </div>`
    )
    .join("");

  const indicators = products
    .map(
      (p, i) =>
        `<li${i === 0 ? ' class="active"' : ""}><button type="button" aria-label="${p.title}"></button></li>`
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
      <button id="prev-demo" data-slider-06-prev type="button" aria-label="Previous">&#8249;</button>
      <button id="next-demo" data-slider-06-next type="button" aria-label="Next">&#8250;</button>
    </div>
    <div class="indicators"><ul>${indicators}</ul></div>
  </section>
</div>`;
}

/** carousel_orbit_ring — slider-07.css / slider-07.js */
function sliderOrbitRing(products) {
  const items = products
    .map(
      (p, i) => `
  <div
    class="item"
    style="--position:${i + 1}"
    data-image="${p.square}"
    data-title="${p.title}"
    data-price="${p.price}"
    data-id="${p.id}"
    data-product-id="${p.id}"
    data-available="true"
    data-has-options="false"
    data-url="#"
  >
    <img src="${p.square}" alt="${p.title}" loading="${i === 0 ? "eager" : "lazy"}" width="640" height="640" style="width:100%;height:100%;object-fit:cover;">
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
  style="--bg-color:#0b0c10;--slider-07-section-height:700px;--3d-perspective:1000px;--3d-tilt:-22deg;--3d-radius:420px;--bg-image-opacity:1;--bg-image-blur:0px;"
  role="region"
  aria-roledescription="carousel"
  aria-label="Featured products"
>
  <div class="banner">
    <div class="slider" style="--quantity:${products.length}">${items}</div>
    <div class="content display-content">
      <div class="active-product-display" id="activeDisplay-demo">
        <button type="button" class="close-display-btn" aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
        <img src="${first.square}" id="activeImg-demo" alt="${first.title}" width="600" height="600" style="object-fit:cover;">
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

/** carousel_elegance — slider-09.css / slider-09.js */
function sliderElegance(products) {
  const COLORS = ["#428372", "#EEAA19", "#e86c3f"];
  const items = products
    .map(
      (p, i) => `
  <div
    class="item${i === 0 ? " active" : ""}"
    data-title="${p.title}"
    style="--img-src:url('${p.portrait}');--bg-color:${COLORS[i % 3]};"
  >
    <div class="content">
      <div class="image">
        <div class="image-mask"></div>
        <img src="${p.portrait}" class="creative-product-img" alt="${p.title}" loading="${i === 0 ? "eager" : "lazy"}" width="700" height="900" style="width:100%;height:100%;object-fit:cover;">
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

/** carousel_vanish — slider-10.css / slider-10.js */
function sliderVanish(products) {
  const items = products
    .map(
      (p, i) => `
  <div class="item">
    <div class="image">
      <img src="${p.portrait}" alt="${p.title}" loading="${i === 0 ? "eager" : "lazy"}" width="700" height="900" style="width:100%;height:100%;object-fit:cover;">
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

/** carousel_coverflow — slider-11-cards.css / slider-11-cards.js */
function sliderCoverflow(products) {
  const items = products
    .map(
      (p, i) => `
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
      <button id="prev-demo" type="button" data-slider-11-prev aria-label="Previous">&#8249;</button>
      <button id="next-demo" type="button" data-slider-11-next aria-label="Next">&#8250;</button>
    </div>
  </div>
</div>`;
}

/** carousel_card_stack — slider-13.css / slider-13.js */
function sliderCardStack(products) {
  const items = products
    .map(
      (p, i) => `
  <article class="item">
    <a href="#" class="item__media" aria-label="${p.title}">
      <img src="${p.portrait}" class="item__image" alt="${p.title}" loading="${i === 0 ? "eager" : "lazy"}" width="700" height="900">
    </a>
    <div class="item__body">
      <h2>${p.title}</h2>
      <div class="item__price-row">
        ${p.comparePrice ? `<span class="item__compare">${p.comparePrice}</span>` : ""}
        <span class="item__price">${p.price}</span>
      </div>
      <div class="item__footer">
        <div class="item__actions">
          <form class="item__cart-form" data-slider-13-cart-form data-carousel-cart-form>
            <input type="hidden" name="id" value="${p.id}">
            <input type="hidden" name="quantity" value="1">
            <button class="item__cart-button" type="button">
              <span class="item__cart-button-icon" aria-hidden="true">+</span>
              <span class="item__cart-button-copy">
                <span class="item__cart-button-label" data-slider-13-cart-label>Add to cart</span>
              </span>
            </button>
          </form>
          <p class="item__cart-feedback" data-slider-13-cart-feedback aria-live="polite"></p>
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

/** product-slideshow — product-slideshow.css / product-slideshow.js */
function sliderProductSlideshow(products) {
  const slides = products
    .map(
      (p, i) => `
  <article class="pss__slide" data-slide data-index="${i}" data-product-id="${p.id}">
    <button class="pss__image-button" type="button" data-activate aria-label="Focus: ${p.title}">
      <span class="pss__image-frame">
        <img src="${p.portrait}" class="pss__image" alt="${p.title}" loading="${i === 0 ? "eager" : "lazy"}" width="700" height="900">
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
  data-image-height="280"
  data-gap="18"
  data-max-scale="200"
  data-size-decrement="15"
  data-hover-scale="105"
  data-inactive-opacity="25"
  data-hover-sibling-opacity="55"
  data-details-inset="20"
  data-status-template="Showing {product}"
  data-added-label="Added"
  data-adding-label="Adding…"
  data-error-label="Error"
  data-sold-out-label="Sold out"
  data-unavailable-label="Unavailable"
  style="
    --pss-background:#f8f7f4;
    --pss-text:#1a1a1a;
    --pss-muted:#888888;
    --pss-backdrop:#e8e4df;
    --pss-backdrop-size:140px;
    --pss-stage-height:660px;
    --pss-image-height:280px;
    --pss-focus-width:200px;
    --pss-gap:18px;
    --pss-radius:12px;
    --pss-transition:500ms;
    --pss-easing:cubic-bezier(0.22,1,0.36,1);
    --pss-thumbnail-size:36px;
    --pss-thumbnail-gap:8px;
    --pss-thumbnail-radius:6px;
    --pss-thumbnail-opacity:0.5;
    --pss-details-width:320px;
    --pss-details-background:rgba(255,255,255,0.85);
    --pss-details-padding:24px;
    --pss-details-gap:18px;
    --pss-details-radius:16px;
    --pss-variant-text:#999999;
    --pss-variant-border:#cccccc;
    --pss-variant-active-text:#1a1a1a;
    --pss-variant-active-border:#1a1a1a;
    --pss-button-background:#1a1a1a;
    --pss-button-text:#ffffff;
    --pss-button-border:#1a1a1a;
    --pss-button-hover-background:#333333;
    --pss-button-hover-text:#ffffff;
  "
>
  <section class="pss__section" aria-label="Featured products">
    <div class="pss__backdrop" aria-hidden="true">FEATURED</div>
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

/** product_coverflow — motion-sections.css / motion-sections.js */
function sliderProductCoverflow(products) {
  const cards = products
    .map(
      (p) => `
  <div data-coverflow-card>
    <article class="ms-product-card">
      <a class="ms-product-card__link" href="#" aria-label="${p.title}">
        <div class="ms-product-card__media">
          <img src="${p.portrait}" alt="${p.title}" loading="lazy" width="700" height="900" style="width:100%;height:100%;object-fit:cover;">
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

/** animated_hero — motion-sections.css (no JS) */
function sliderAnimatedHero() {
  return `
<section
  class="ms-hero"
  style="--ms-height:720px;--ms-align:center;--ms-overlay:0.52;--ms-accent:#c5ffdf;"
>
  <div class="ms-hero__media">
    <img src="https://picsum.photos/seed/hero01/1600/800" alt="Hero image" loading="eager" width="1600" height="800" style="width:100%;height:100%;object-fit:cover;">
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

/** infinite_marquee — motion-sections.css / motion-sections.js */
function sliderMarquee(products) {
  const makeCard = (p) => `
  <article class="ms-product-card">
    <a class="ms-product-card__link" href="#" aria-label="${p.title}">
      <div class="ms-product-card__media">
        <img src="${p.portrait}" alt="${p.title}" loading="lazy" width="700" height="900">
      </div>
      <div class="ms-product-card__meta">
        <h3 class="ms-product-card__title">${p.title}</h3>
        <p class="ms-product-card__price">${p.price}</p>
      </div>
    </a>
  </article>`;

  const set = products.map(makeCard).join("");

  return `
<section
  class="ms-section"
  style="--ms-bg:#f4c8b8;--ms-text:#341c20;--ms-accent:#9d263e;--ms-padding:64px;--ms-gap:18px;--ms-radius:18px;"
>
  <div class="ms-section__header">
    <div>
      <p class="ms-section__eyebrow">On repeat</p>
      <h2 class="ms-section__heading">The pieces everyone wants</h2>
    </div>
  </div>
  <div class="ms-marquee" style="--ms-duration:30s;--ms-direction:normal;">
    <div class="ms-marquee__set">${set}</div>
    <div class="ms-marquee__set" aria-hidden="true">${set}</div>
  </div>
</section>`;
}

/** product_story — motion-sections.css (scroll-driven horizontal story) */
function sliderProductStory(products) {
  const chapters = products
    .slice(0, 5)
    .map(
      (p, i) => `
  <article class="ms-story__chapter">
    <img src="${p.image}" loading="${i === 0 ? "eager" : "lazy"}" width="1400" height="900" alt="${p.title}" style="width:100%;height:100%;object-fit:cover;">
    <div class="ms-story__caption">
      <div>
        <h3>${p.title}</h3>
        <p>${p.price}</p>
      </div>
      <a class="ms-button" href="#">Explore piece</a>
    </div>
  </article>`
    )
    .join("");

  return `
<section
  class="ms-section"
  style="--ms-bg:#e9e7df;--ms-text:#171820;--ms-accent:#5750b8;--ms-padding:72px;--ms-radius:24px;"
>
  <div class="ms-story" tabindex="0">
    <article class="ms-story__intro">
      <p class="ms-section__eyebrow">Chapter one</p>
      <h2>A collection with a point of view</h2>
      <p>Move sideways through a story built from the products, textures and details that make this edit distinct.</p>
    </article>
    ${chapters}
  </div>
</section>`;
}

/** shoppable_gallery — motion-sections.css */
function sliderShoppableGallery(products) {
  const HOTSPOTS = [
    { x: 55, y: 55 },
    { x: 60, y: 50 },
    { x: 45, y: 60 },
  ];

  const items = [0, 1, 2]
    .map(
      (i) => `
  <article class="ms-gallery__item">
    <img src="${products[i].image}" loading="${i === 0 ? "eager" : "lazy"}" width="1400" height="900" alt="${products[i].title}" style="width:100%;height:100%;object-fit:cover;">
    <a
      class="ms-hotspot"
      href="#"
      style="--ms-hotspot-x:${HOTSPOTS[i].x}%;--ms-hotspot-y:${HOTSPOTS[i].y}%;"
      data-label="${products[i].title}"
      aria-label="Shop: ${products[i].title}"
    >+</a>
  </article>`
    )
    .join("");

  return `
<section
  class="ms-section"
  style="--ms-bg:#f6eceb;--ms-text:#3b202c;--ms-accent:#a44365;--ms-padding:72px;--ms-gap:14px;--ms-radius:20px;"
>
  <div class="ms-section__header">
    <div>
      <p class="ms-section__eyebrow">Shop the scene</p>
      <h2 class="ms-section__heading">A weekend, well considered</h2>
      <p class="ms-section__copy">Pair campaign imagery with direct paths to the products inside it.</p>
    </div>
  </div>
  <div class="ms-gallery">
    ${items}
  </div>
</section>`;
}

/** testimonials — motion-sections.css / motion-sections.js */
function sliderTestimonials() {
  const quotes = [
    {
      quote:
        "The quality is obvious the second you hold it. It feels considered, useful and made to last.",
      author: "Amara K. · Verified buyer",
    },
    {
      quote:
        "Beautifully simple, surprisingly versatile and now part of my everyday routine.",
      author: "Maya T. · Verified buyer",
    },
    {
      quote:
        "It arrived quickly, looked even better in person and the details are exceptional.",
      author: "Leo R. · Verified buyer",
    },
  ];

  const slides = quotes
    .map(
      (q, i) => `
  <article class="ms-testimonials__slide${i === 0 ? " is-active" : ""}" data-testimonial-slide>
    <div class="ms-testimonials__stars" aria-hidden="true">★★★★★</div>
    <blockquote>"${q.quote}"</blockquote>
    <cite>${q.author}</cite>
  </article>`
    )
    .join("");

  const dots = quotes
    .map(
      (_, i) =>
        `<button class="ms-testimonials__dot${i === 0 ? " is-active" : ""}" type="button" data-testimonial-dot aria-label="Testimonial ${i + 1}"></button>`
    )
    .join("");

  return `
<section
  class="ms-section"
  style="--ms-bg:#eee3cd;--ms-text:#302519;--ms-accent:#9e5d36;--ms-padding:96px;"
>
  <motion-testimonials class="ms-testimonials" data-autoplay="6">
    <p class="ms-section__eyebrow">Loved in the wild</p>
    <div class="ms-testimonials__viewport" aria-live="polite">
      ${slides}
    </div>
    <div class="ms-testimonials__dots">
      ${dots}
    </div>
  </motion-testimonials>
</section>`;
}

/** image_reveal — motion-sections.css / motion-sections.js */
function sliderImageReveal() {
  return `
<section
  class="ms-section"
  style="--ms-bg:#e0eee5;--ms-text:#19372f;--ms-accent:#287b62;--ms-padding:72px;--ms-radius:22px;"
>
  <div class="ms-section__header">
    <div>
      <p class="ms-section__eyebrow">See the difference</p>
      <h2 class="ms-section__heading">A transformation you can feel</h2>
      <p class="ms-section__copy">Drag the handle to compare materials, finishes, results or product details.</p>
    </div>
  </div>
  <motion-image-reveal class="ms-reveal" style="--ms-reveal:50%;">
    <img src="https://picsum.photos/seed/before01/1400/720" class="ms-reveal__image" loading="eager" width="1400" height="720" alt="Before">
    <div class="ms-reveal__after">
      <img src="https://picsum.photos/seed/after01/1400/720" class="ms-reveal__image" loading="eager" width="1400" height="720" alt="After">
    </div>
    <div class="ms-reveal__divider">
      <span class="ms-reveal__handle">↔</span>
    </div>
    <span class="ms-reveal__label ms-reveal__label--before">Before</span>
    <span class="ms-reveal__label ms-reveal__label--after">After</span>
    <label class="ms-sr-only" for="MotionReveal-demo">Reveal slider</label>
    <input class="ms-reveal__range" id="MotionReveal-demo" type="range" min="0" max="100" value="50" aria-label="Image reveal position">
  </motion-image-reveal>
</section>`;
}

// ---------------------------------------------------------------------------
// handle → { css, js, render }
// ---------------------------------------------------------------------------
const CONFIGS = {
  carousel_slider: {
    css: "slider-main.css",
    js: "slider-main.js",
    bg: "#111418",
    render: (p) => sliderMain(p),
  },
  carousel_modern: {
    css: "slider-12.css",
    js: "slider-12.js",
    bg: "#111418",
    render: (p) => sliderModern(p),
  },
  carousel_aerphone: {
    css: "slider-03-aerphone.css",
    js: "slider-03-aerphone.js",
    bg: "#0f0f0f",
    render: (p) => sliderAerphone(p),
  },
  carousel_swift: {
    css: "slider-06.css",
    js: "slider-06.js",
    bg: "#ffffff",
    render: (p) => sliderSwift(p.slice(0, 4)),
  },
  carousel_orbit_ring: {
    css: "slider-07.css",
    js: "slider-07.js",
    bg: "#0b0c10",
    render: (p) => sliderOrbitRing(p),
  },
  carousel_elegance: {
    css: "slider-09.css",
    js: "slider-09.js",
    bg: "#1a1a1a",
    render: (p) => sliderElegance(p.slice(0, 5)),
  },
  carousel_vanish: {
    css: "slider-10.css",
    js: "slider-10.js",
    bg: "#f0ece6",
    render: (p) => sliderVanish(p.slice(0, 4)),
  },
  carousel_coverflow: {
    css: "slider-11-cards.css",
    js: "slider-11-cards.js",
    bg: "#18181b",
    render: (p) => sliderCoverflow(p),
  },
  carousel_card_stack: {
    css: "slider-13.css",
    js: "slider-13.js",
    bg: "#f0ece6",
    render: (p) => sliderCardStack(p),
  },
  "product-slideshow": {
    css: "product-slideshow.css",
    js: "product-slideshow.js",
    bg: "#f8f7f4",
    render: (p) => sliderProductSlideshow(p),
  },
  product_coverflow: {
    css: "motion-sections.css",
    js: "motion-sections.js",
    bg: "#1d1725",
    render: (p) => sliderProductCoverflow(p),
  },
  animated_hero: {
    css: "motion-sections.css",
    js: null,
    bg: "#111111",
    render: () => sliderAnimatedHero(),
  },
  infinite_marquee: {
    css: "motion-sections.css",
    js: "motion-sections.js",
    bg: "#f4c8b8",
    render: (p) => sliderMarquee(p),
  },
  product_story: {
    css: "motion-sections.css",
    js: null,
    bg: "#e9e7df",
    render: (p) => sliderProductStory(p),
  },
  shoppable_gallery: {
    css: "motion-sections.css",
    js: "motion-sections.js",
    bg: "#f6eceb",
    render: (p) => sliderShoppableGallery(p),
  },
  testimonials: {
    css: "motion-sections.css",
    js: "motion-sections.js",
    bg: "#eee3cd",
    render: () => sliderTestimonials(),
  },
  image_reveal: {
    css: "motion-sections.css",
    js: "motion-sections.js",
    bg: "#e0eee5",
    render: () => sliderImageReveal(),
  },
};

// ---------------------------------------------------------------------------
// Full-page wrapper
// ---------------------------------------------------------------------------
function buildPreviewHtml(handle) {
  const config = CONFIGS[handle];
  if (!config) {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Preview</title></head>
<body style="display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:sans-serif;background:#111;color:#666;">
<p>No preview available for &ldquo;${handle}&rdquo;.</p>
</body></html>`;
  }

  const sliderHtml = config.render(PRODUCTS);
  const jsTag = config.js
    ? `<script src="/extension-assets/${config.js}"></script>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview — ${handle}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html {
      font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 16px;
      -webkit-text-size-adjust: 100%;
    }
    body {
      margin: 0;
      padding: 0;
      overflow-x: hidden;
      background: ${config.bg};
      /* prevent layout shift while JS hydrates */
      min-height: 100dvh;
    }
    /* Disable navigation and cart submissions — keep slider interactions */
    a { pointer-events: none; cursor: default; }
    form[data-carousel-cart-form] button[type="submit"],
    form[data-slider-13-cart-form] button,
    form.item__cart-form button,
    form.active-product-form button,
    form.addToCartForm button { pointer-events: none; }
    /* Smooth image loading */
    img { display: block; max-width: 100%; }
  </style>
  <link rel="stylesheet" href="/extension-assets/${config.css}">
</head>
<body>
${sliderHtml}
${jsTag}
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Route loader
// ---------------------------------------------------------------------------
export const loader = ({ params }) => {
  const html = buildPreviewHtml(params.handle);
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
};
