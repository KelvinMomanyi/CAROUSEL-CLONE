class MotionCarousel extends HTMLElement {
  connectedCallback() {
    if (this.dataset.ready === "true") return;
    this.dataset.ready = "true";
    this.viewport = this.querySelector("[data-carousel-viewport]");
    this.previousButton = this.querySelector("[data-carousel-previous]");
    this.nextButton = this.querySelector("[data-carousel-next]");
    if (!this.viewport) return;
    this.previousButton?.addEventListener("click", () => this.move(-1));
    this.nextButton?.addEventListener("click", () => this.move(1));
    const delay = Number(this.dataset.autoplay || 0) * 1000;
    if (delay > 0 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      this.timer = window.setInterval(() => this.move(1), delay);
      this.addEventListener("mouseenter", () => window.clearInterval(this.timer), { once: true });
    }
  }

  disconnectedCallback() {
    window.clearInterval(this.timer);
  }

  move(direction) {
    const card = this.viewport.querySelector(".ms-product-card");
    const gap = Number.parseFloat(getComputedStyle(this.viewport.firstElementChild).gap || 0);
    const distance = (card?.getBoundingClientRect().width || this.viewport.clientWidth * 0.8) + gap;
    const atEnd = this.viewport.scrollLeft + this.viewport.clientWidth >= this.viewport.scrollWidth - 4;
    if (direction > 0 && atEnd) {
      this.viewport.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }
    this.viewport.scrollBy({ left: distance * direction, behavior: "smooth" });
  }
}

class MotionCoverflow extends HTMLElement {
  connectedCallback() {
    if (this.dataset.ready === "true") return;
    this.dataset.ready = "true";
    this.cards = [...this.querySelectorAll("[data-coverflow-card]")];
    this.activeIndex = 0;
    this.querySelector("[data-coverflow-previous]")?.addEventListener("click", () => this.move(-1));
    this.querySelector("[data-coverflow-next]")?.addEventListener("click", () => this.move(1));
    this.cards.forEach((card, index) => card.addEventListener("click", (event) => {
      if (index !== this.activeIndex) {
        event.preventDefault();
        this.activeIndex = index;
        this.update();
      }
    }));
    this.update();
    const delay = Number(this.dataset.autoplay || 0) * 1000;
    if (delay > 0 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      this.timer = window.setInterval(() => this.move(1), delay);
    }
  }

  disconnectedCallback() {
    window.clearInterval(this.timer);
  }

  move(direction) {
    if (!this.cards.length) return;
    this.activeIndex = (this.activeIndex + direction + this.cards.length) % this.cards.length;
    this.update();
  }

  update() {
    this.cards.forEach((card, index) => {
      let distance = index - this.activeIndex;
      if (distance > this.cards.length / 2) distance -= this.cards.length;
      if (distance < -this.cards.length / 2) distance += this.cards.length;
      card.dataset.position = Math.abs(distance) > 2 ? "hidden" : String(distance);
      card.setAttribute("aria-hidden", distance === 0 ? "false" : "true");
    });
  }
}

class MotionTestimonials extends HTMLElement {
  connectedCallback() {
    if (this.dataset.ready === "true") return;
    this.dataset.ready = "true";
    this.slides = [...this.querySelectorAll("[data-testimonial-slide]")];
    this.dots = [...this.querySelectorAll("[data-testimonial-dot]")];
    this.activeIndex = 0;
    this.dots.forEach((dot, index) => dot.addEventListener("click", () => {
      this.activeIndex = index;
      this.update();
    }));
    this.update();
    const delay = Number(this.dataset.autoplay || 0) * 1000;
    if (delay > 0 && this.slides.length > 1 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      this.timer = window.setInterval(() => {
        this.activeIndex = (this.activeIndex + 1) % this.slides.length;
        this.update();
      }, delay);
    }
  }

  disconnectedCallback() {
    window.clearInterval(this.timer);
  }

  update() {
    this.slides.forEach((slide, index) => {
      const active = index === this.activeIndex;
      slide.classList.toggle("is-active", active);
      slide.setAttribute("aria-hidden", String(!active));
    });
    this.dots.forEach((dot, index) => {
      const active = index === this.activeIndex;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-current", active ? "true" : "false");
    });
  }
}

class MotionImageReveal extends HTMLElement {
  connectedCallback() {
    if (this.dataset.ready === "true") return;
    this.dataset.ready = "true";
    const range = this.querySelector("input[type='range']");
    if (!range) return;
    const update = () => this.style.setProperty("--ms-reveal", `${range.value}%`);
    range.addEventListener("input", update);
    update();
  }
}

if (!customElements.get("motion-carousel")) customElements.define("motion-carousel", MotionCarousel);
if (!customElements.get("motion-coverflow")) customElements.define("motion-coverflow", MotionCoverflow);
if (!customElements.get("motion-testimonials")) customElements.define("motion-testimonials", MotionTestimonials);
if (!customElements.get("motion-image-reveal")) customElements.define("motion-image-reveal", MotionImageReveal);
