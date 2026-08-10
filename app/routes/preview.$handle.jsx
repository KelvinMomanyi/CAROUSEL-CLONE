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
    image: "/demo-products/headphones.jpg",
    portrait: "/demo-products/headphones.jpg",
    square: "/demo-products/headphones.jpg",
    thumb: "/demo-products/headphones.jpg",
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
    image: "/demo-products/smartwatch.jpg",
    portrait: "/demo-products/smartwatch.jpg",
    square: "/demo-products/smartwatch.jpg",
    thumb: "/demo-products/smartwatch.jpg",
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
    image: "/demo-products/running-shoe.jpg",
    portrait: "/demo-products/running-shoe.jpg",
    square: "/demo-products/running-shoe.jpg",
    thumb: "/demo-products/running-shoe.jpg",
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
    image: "/demo-products/canvas-backpack.jpg",
    portrait: "/demo-products/canvas-backpack.jpg",
    square: "/demo-products/canvas-backpack.jpg",
    thumb: "/demo-products/canvas-backpack.jpg",
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
    image: "/demo-products/sunglasses.jpg",
    portrait: "/demo-products/sunglasses.jpg",
    square: "/demo-products/sunglasses.jpg",
    thumb: "/demo-products/sunglasses.jpg",
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
    image: "/demo-products/pour-over-set.jpg",
    portrait: "/demo-products/pour-over-set.jpg",
    square: "/demo-products/pour-over-set.jpg",
    thumb: "/demo-products/pour-over-set.jpg",
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
    image: "/demo-products/merino-sweater.jpg",
    portrait: "/demo-products/merino-sweater.jpg",
    square: "/demo-products/merino-sweater.jpg",
    thumb: "/demo-products/merino-sweater.jpg",
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
    image: "/demo-products/leather-wallet.jpg",
    portrait: "/demo-products/leather-wallet.jpg",
    square: "/demo-products/leather-wallet.jpg",
    thumb: "/demo-products/leather-wallet.jpg",
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
<section
  id="shv-carousel-demo"
  class="shv-main-slider shv-gradient-enabled shv-gradient-rounded"
  data-shv-main-slider
  data-carousel-root
  data-carousel-layout="slider-main"
  data-carousel-block-id="demo"
  data-carousel-count="${products.length}"
  data-carousel-status-template="Product __CURRENT__ of __TOTAL__"
  style="--theme-accent:#f1683a;--theme-text:#ffffff;--theme-bg:#111418;--section-height:700px;"
  role="region"
  aria-roledescription="carousel"
  aria-label="Featured products"
  aria-busy="false"
>
  <div class="shv-slider-track" aria-live="polite">${slides}</div>
  <div class="shv-slider-thumbs" aria-hidden="true">${thumbs}</div>
  <div class="shv-slider-nav" role="group" aria-label="Carousel controls">
    <button type="button" class="shv-nav-prev" aria-label="Previous">&#8249;</button>
    <button type="button" class="shv-nav-next" aria-label="Next">&#8250;</button>
  </div>
  <div class="slider-progress" aria-hidden="true"></div>
  <span class="shv-carousel-status" data-carousel-status aria-live="polite" aria-atomic="true"></span>
</section>`;
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
  const cutoutImages = {
    "wireless-headphones-pro": "/vanish/headphones.png",
    "smart-watch-series-x": "/vanish/watch.png",
    "running-shoes-elite": "/vanish/shoe.png",
    "canvas-backpack": "/vanish/backpack.png",
  };

  const items = products
    .map(
      (p, i) => `
  <div class="item">
    <div class="image">
      <img src="${cutoutImages[p.handle] ?? p.portrait}" class="vanish-product-cutout" alt="${p.title}" loading="${i === 0 ? "eager" : "lazy"}" width="618" height="618">
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
  data-block-id="demo"
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
    .slice(0, 6)
    .map(
      (p, i) => `
  <article class="pss__slide" data-slide data-index="${i}" data-product-id="${p.id}">
    <button class="pss__image-button" type="button" data-activate aria-label="Focus: ${p.title}">
      <span class="pss__image-frame">
        <img src="${p.portrait}" class="pss__image" alt="${p.title}" loading="${i === 0 ? "eager" : "lazy"}" width="700" height="900">
      </span>
    </button>
    <div class="pss__thumbnails" data-thumbnails aria-label="Product images for ${p.title}">
      <button class="pss__thumbnail is-active" type="button" data-thumbnail data-image-url="${p.portrait}" data-image-alt="${p.title}" aria-label="Show image 1 for ${p.title}" aria-pressed="true">
        <img src="${p.thumb}" alt="${p.title}" loading="lazy" width="128" height="128">
      </button>
      <button class="pss__thumbnail" type="button" data-thumbnail data-image-url="${p.square}" data-image-alt="${p.title}" aria-label="Show image 2 for ${p.title}" aria-pressed="false">
        <img src="${p.square}" alt="${p.title}" loading="lazy" width="128" height="128">
      </button>
      <button class="pss__thumbnail" type="button" data-thumbnail data-image-url="${p.image}" data-image-alt="${p.title}" aria-label="Show image 3 for ${p.title}" aria-pressed="false">
        <img src="${p.image}" alt="${p.title}" loading="lazy" width="128" height="128">
      </button>
    </div>
    <div class="pss__details" data-details>
      <div class="pss__copy">
        <h3 class="pss__title"><a href="#">${p.title}</a></h3>
        <p class="pss__description">${p.description}</p>
        <p class="pss__price-row">
          <span class="pss__price" data-price>${p.price}</span>
          <s class="pss__compare-price${p.comparePrice ? "" : " is-hidden"}" data-compare-price>${p.comparePrice || ""}</s>
        </p>
      </div>
      <form class="pss__form" data-product-form>
        <input type="hidden" name="id" value="${p.id}" data-variant-id>
        <input type="hidden" name="quantity" value="1">
        <button class="pss__button pss__button--primary" type="submit" data-add-button data-default-label="Add to cart">
          <span data-button-label>Add to cart</span>
        </button>
      </form>
      <script type="application/json" data-variants>[{"id":${p.id},"available":true,"options":["Default Title"],"price":"${p.price}","compareAtPrice":${p.comparePrice ? `"${p.comparePrice}"` : "null"},"imageUrl":"${p.portrait}","imageAlt":"${p.title}"}]</script>
      <span class="visually-hidden" data-product-message aria-live="polite"></span>
    </div>
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
  data-adding-label="Adding…"
  data-error-label="Error"
  data-sold-out-label="Sold out"
  data-unavailable-label="Unavailable"
  style="
    --pss-background:#ffffff;
    --pss-text:#000000;
    --pss-muted:#575757;
    --pss-backdrop:#f0f0f0;
    --pss-backdrop-size:120px;
    --pss-stage-height:640px;
    --pss-image-height:250px;
    --pss-focus-width:200px;
    --pss-gap:16px;
    --pss-radius:8px;
    --pss-transition:500ms;
    --pss-easing:ease-in-out;
    --pss-thumbnail-size:32px;
    --pss-thumbnail-gap:8px;
    --pss-thumbnail-radius:4px;
    --pss-thumbnail-opacity:0.5;
    --pss-details-width:300px;
    --pss-details-background:transparent;
    --pss-details-padding:20px;
    --pss-details-gap:20px;
    --pss-details-radius:8px;
    --pss-variant-text:#bcb7c9;
    --pss-variant-border:#bcb7c9;
    --pss-variant-active-text:#ffffff;
    --pss-variant-active-border:#000000;
    --pss-button-background:transparent;
    --pss-button-text:#ffffff;
    --pss-button-border:#000000;
    --pss-button-hover-background:#333333;
    --pss-button-hover-text:#ffffff;
  "
>
  <section class="pss__section" aria-label="Featured products">
    <div class="pss__backdrop" aria-hidden="true">FEATURED</div>
    <div class="pss__viewport" data-viewport tabindex="0">
      <div class="pss__track" data-track>${slides}</div>
    </div>
    <p class="pss__status visually-hidden" data-status aria-live="polite"></p>
  </section>
</carousel-product-slideshow>`;
}

/** product_coverflow — motion-sections.css / motion-sections.js */
function sliderProductCoverflow(products) {
  const cards = products
    .slice(0, 6)
    .map(
      (p, i) => `
  <article class="ms-helix__card" data-helix-card data-title="${p.title}" role="group" aria-label="${i + 1} of 6: ${p.title}" aria-hidden="${i === 0 ? "false" : "true"}">
    <a class="ms-helix__link" href="#" tabindex="${i === 0 ? "0" : "-1"}">
      <span class="ms-helix__media">
        <img src="${p.portrait}" alt="${p.title}" loading="lazy" width="700" height="900">
      </span>
      <span class="ms-helix__title">${p.title}</span>
    </a>
  </article>`
    )
    .join("");

  return `
<section
  class="ms-section ms-section--helix"
  style="--ms-helix-height:560px;--ms-helix-card-w:190px;--ms-helix-card-h:250px;--ms-helix-radius:240px;--ms-helix-perspective:1400px;--ms-helix-card-radius:18px;--ms-helix-edge-fade:22%;--ms-helix-bg:#0A0A10;--ms-helix-text:#FFFFFF;--ms-helix-accent:#8C6BFF;--ms-helix-title-size:14px;"
>
  <motion-helix-spiral
    class="ms-helix"
    data-arc-span="360"
    data-radius="240"
    data-path-spacing="42"
    data-perspective="1400"
    data-card-width="190"
    data-card-height="250"
    data-focus-scale="1.2"
    data-focus-falloff="3"
    data-depth-blur="6"
    data-scroll-behavior="wheel"
    data-scroll-loops="1"
    data-auto-rotation="true"
    data-rotation-speed="0.18"
    data-reverse="false"
    data-drag-swipe="true"
    data-scroll-control="true"
    data-card-count="6"
    tabindex="0"
    role="region"
    aria-roledescription="carousel"
    aria-label="Featured products"
  >
    <div class="ms-helix__stage" data-helix-stage>${cards}</div>
    <span class="ms-sr-only" data-helix-status aria-live="polite"></span>
  </motion-helix-spiral>
</section>`;
}

/** animated_hero — motion-sections.css (no JS) */
function sliderAnimatedHero(products) {
  return `
<section
  class="ms-hero"
  style="--ms-height:720px;--ms-align:center;--ms-overlay:0.52;--ms-accent:#c5ffdf;"
>
  <div class="ms-hero__media">
    <img src="${products[6].image}" alt="${products[6].title}" loading="eager" width="1600" height="800" style="width:100%;height:100%;object-fit:cover;">
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
  const cards = products
    .slice(0, 6)
    .map(
      (p, i) => `
  <article class="ms-depth-story__card" data-depth-card data-caption="${p.title}" aria-hidden="${i === 0 ? "false" : "true"}">
    <a class="ms-depth-story__link" href="#" tabindex="${i === 0 ? "0" : "-1"}">
      <img src="${p.image}" loading="lazy" width="1200" height="772" alt="${p.title}">
      <span class="ms-depth-story__reflection" aria-hidden="true">
        <img src="${p.image}" loading="lazy" width="1200" height="772" alt="">
      </span>
    </a>
  </article>`
    )
    .join("");

  return `
<section
  class="ms-section ms-section--depth-story"
  style="--ms-bg:#ECE5D8;--ms-text:#161413;--ms-padding:0px;--ms-depth-height:560px;--ms-depth-card-w:460px;--ms-depth-card-h:300px;--ms-depth-side-scale:0.66;--ms-depth-spacing:40px;--ms-depth:150px;--ms-depth-curve:42deg;--ms-depth-perspective:1300px;--ms-depth-stiffness:170;--ms-depth-damping:34;--ms-depth-radius:6px;--ms-depth-blur:5px;--ms-depth-reflect:0.3;--ms-depth-vignette:0%;--ms-depth-edge-width:22px;--ms-depth-edge-blur:14px;"
>
  <motion-depth-story class="ms-depth-story" data-hint="Scroll / Drag" aria-roledescription="carousel" aria-label="Horizontal product story">
    <div class="ms-depth-story__stage" data-depth-stage>${cards}</div>
    <div class="ms-depth-story__vignette" aria-hidden="true"></div>
    <p class="ms-depth-story__meta" data-depth-meta aria-live="polite">
      <span data-depth-caption></span><span class="ms-depth-story__counter" data-depth-counter></span>
    </p>
    <p class="ms-sr-only" data-depth-hint>Scroll / Drag</p>
  </motion-depth-story>
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
function sliderImageReveal(products) {
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
    <img src="${products[2].image}" class="ms-reveal__image" loading="eager" width="1400" height="720" alt="Product in a muted finish" style="filter:grayscale(1) saturate(.55) brightness(.82);">
    <div class="ms-reveal__after">
      <img src="${products[2].image}" class="ms-reveal__image" loading="eager" width="1400" height="720" alt="Product in its original finish">
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
    bg: "#ffffff",
    render: (p) => sliderProductSlideshow(p),
  },
  product_coverflow: {
    css: "motion-sections.css",
    js: "motion-helix.js",
    bg: "#0A0A10",
    render: (p) => sliderProductCoverflow(p),
  },
  animated_hero: {
    css: "motion-sections.css",
    js: null,
    bg: "#111111",
    render: (p) => sliderAnimatedHero(p),
  },
  infinite_marquee: {
    css: "motion-sections.css",
    js: "motion-sections.js",
    bg: "#f4c8b8",
    render: (p) => sliderMarquee(p),
  },
  product_story: {
    css: "motion-sections.css",
    js: "motion-depth-story.js",
    bg: "#ECE5D8",
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
    render: (p) => sliderImageReveal(p),
  },
};

// ---------------------------------------------------------------------------
// Full-page wrapper
// ---------------------------------------------------------------------------
function buildLibraryPreviewHtml(handle, config) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Interactive preview — ${handle}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body { width: 100%; height: 100%; margin: 0; overflow: hidden; background: ${config.bg}; }
    .preview-stage {
      position: absolute;
      left: 50%;
      top: 50%;
      width: 1440px;
      height: 810px;
      transform: translate(-50%, -50%) scale(var(--preview-scale, 1));
      transform-origin: center;
    }
    .preview-stage iframe { display: block; width: 100%; height: 100%; border: 0; background: ${config.bg}; }
  </style>
</head>
<body>
  <div class="preview-stage">
    <iframe src="/preview/${handle}" title="${handle} live section preview"></iframe>
  </div>
  <script>
    (() => {
      const width = 1440;
      const height = 810;
      const fit = () => {
        const scale = Math.min(window.innerWidth / width, window.innerHeight / height);
        document.documentElement.style.setProperty("--preview-scale", String(scale));
      };
      fit();
      window.addEventListener("resize", fit, { passive: true });
    })();
  </script>
</body>
</html>`;
}

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
    form.addToCartForm button,
    form[data-product-form] button { pointer-events: none; }
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
export const loader = ({ params, request }) => {
  const config = CONFIGS[params.handle];
  const surface = new URL(request.url).searchParams.get("surface");
  const html = surface === "library" && config
    ? buildLibraryPreviewHtml(params.handle, config)
    : buildPreviewHtml(params.handle);
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
};
