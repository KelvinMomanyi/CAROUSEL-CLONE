class MotionHoverAccordion extends HTMLElement {
  connectedCallback() {
    if (this.dataset.ready === "true") return;
    this.panels = [...this.querySelectorAll("[data-accordion-panel]")];
    if (!this.panels.length) return;
    this.dataset.ready = "true";
    this.controller = new AbortController();
    const signal = this.controller.signal;
    const requestedIndex = Number.parseInt(this.dataset.startIndex || "0", 10);
    this.activeIndex = Math.min(Math.max(Number.isNaN(requestedIndex) ? 0 : requestedIndex, 0), this.panels.length - 1);
    this.canHover = window.matchMedia("(hover: hover) and (pointer: fine)");

    this.panels.forEach((panel, index) => {
      panel.addEventListener("pointerenter", () => {
        if (this.canHover.matches) this.setActive(index);
      }, { signal });
      panel.addEventListener("focus", () => this.setActive(index), { signal });
      panel.addEventListener("click", () => this.setActive(index), { signal });
      panel.addEventListener("keydown", (event) => this.handleKeydown(event, index), { signal });
    });

    this.update();
  }

  disconnectedCallback() {
    this.controller?.abort();
    delete this.dataset.ready;
  }

  setActive(index, moveFocus = false) {
    const nextIndex = (index + this.panels.length) % this.panels.length;
    if (nextIndex === this.activeIndex && !moveFocus) return;
    this.activeIndex = nextIndex;
    this.update();
    if (moveFocus) this.panels[nextIndex].focus({ preventScroll: true });
  }

  handleKeydown(event, index) {
    let nextIndex;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = index + 1;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = index - 1;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = this.panels.length - 1;
    if (nextIndex === undefined) return;
    event.preventDefault();
    this.setActive(nextIndex, true);
  }

  update() {
    this.panels.forEach((panel, index) => {
      panel.setAttribute("aria-expanded", String(index === this.activeIndex));
    });
  }
}

if (!customElements.get("motion-hover-accordion")) {
  customElements.define("motion-hover-accordion", MotionHoverAccordion);
}
