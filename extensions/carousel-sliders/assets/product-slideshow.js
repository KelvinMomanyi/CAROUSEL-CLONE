"use strict";

class ProductSlideshow extends HTMLElement {
	connectedCallback() {
		if (this.ready) return;
		this.section = this.querySelector(".pss__section");
		this.viewport = this.querySelector("[data-viewport]");
		this.track = this.querySelector("[data-track]");
		this.slides = [...this.querySelectorAll("[data-slide]")];
		if (!this.section || !this.viewport || !this.track || !this.slides.length)
			return;

		this.ready = true;
		this.active = -1;
		this.hovered = -1;
		this.focusWidth = this.number("focusWidth", 200, 1);
		this.gap = this.number("gap", 16);
		this.maxScale = this.number("maxScale", 200, 110) / 100;
		this.decrement = this.number("sizeDecrement", 15) / 100;
		this.hoverScale = this.number("hoverScale", 105, 100) / 100;
		this.inactiveOpacity = this.clamp(this.number("inactiveOpacity", 20) / 100);
		this.siblingOpacity = this.clamp(
			this.number("hoverSiblingOpacity", 50) / 100,
		);
		this.detailsInset = this.number("detailsInset", 20);
		this.imageHeight = this.number("imageHeight", 250, 1);
		this.controller = new AbortController();
		this.bind();
		this.render();

		if (window.ResizeObserver) {
			this.observer = new ResizeObserver(() => this.align());
			this.observer.observe(this.viewport);
		}
	}

	disconnectedCallback() {
		this.controller?.abort();
		this.observer?.disconnect();
		this.ready = false;
	}

	number(name, fallback, min = 0) {
		const value = Number(this.dataset[name]);
		return Number.isFinite(value) ? Math.max(min, value) : fallback;
	}

	clamp(value) {
		return Math.min(1, Math.max(0, value));
	}

	bind() {
		const options = { signal: this.controller.signal };
		this.addEventListener("click", (event) => this.onClick(event), options);
		this.addEventListener("change", (event) => this.onChange(event), options);
		this.addEventListener("submit", (event) => this.onSubmit(event), options);

		this.slides.forEach((slide, index) => {
			const variants = slide.querySelector("[data-variants]");
			try {
				slide.variants = variants ? JSON.parse(variants.textContent) : [];
			} catch {
				slide.variants = [];
			}
			slide.addEventListener(
				"mouseenter",
				() => {
					this.hovered = index;
					if (this.active < 0) this.render();
				},
				options,
			);
			slide.addEventListener(
				"mouseleave",
				() => {
					if (this.hovered === index) this.hovered = -1;
					if (this.active < 0) this.render();
				},
				options,
			);
		});

		this.querySelectorAll(".pss__image:not(.pss__placeholder)").forEach(
			(image) => {
				if (!image.complete)
					image.addEventListener("load", () => this.align(), {
						...options,
						once: true,
					});
			},
		);
	}

	onClick(event) {
		if (event.target.closest("[data-previous]")) return this.step(-1);
		if (event.target.closest("[data-next]")) return this.step(1);
		const thumbnail = event.target.closest("[data-thumbnail]");
		if (thumbnail) return this.selectThumbnail(thumbnail);
		const trigger = event.target.closest("[data-activate]");
		if (!trigger) return;
		const index = this.slides.indexOf(trigger.closest("[data-slide]"));
		if (index >= 0) {
			this.hovered = index;
			this.setActive(index === this.active ? -1 : index, true);
		}
	}

	step(direction) {
		const index =
			this.active < 0
				? Math.floor(this.slides.length / 2)
				: this.normalize(this.active + direction);
		this.setActive(index, true);
	}

	setActive(index) {
		this.active = index < 0 ? -1 : this.normalize(index);
		this.render();
	}

	render() {
		const selected = this.active >= 0;
		const scale = selected ? this.maxScale : 1;
		const extraSpace = (this.focusWidth + this.gap) * (scale - 1);
		const overhang = selected ? (this.imageHeight * (scale - 1)) / 2 : 0;
		this.classList.toggle("has-active", selected);
		this.dataset.activeIndex = String(this.active);
		this.style.setProperty("--pss-active-overhang-y", `${overhang}px`);
		this.style.setProperty("--pss-thumbnail-offset", `${-overhang}px`);

		this.slides.forEach((slide, index) => {
			const active = index === this.active;
			const distance = selected ? Math.abs(index - this.active) : 0;
			let itemScale = 1;
			let opacity = 1;
			let shift = 0;
			if (selected) {
				itemScale = active
					? scale
					: Math.max(0.55, scale - this.decrement * (distance + 2));
				opacity = active ? 1 : this.inactiveOpacity;
				shift = (index - this.active) * extraSpace;
			} else if (this.hovered >= 0) {
				const hovered = index === this.hovered;
				itemScale = hovered ? this.hoverScale : 1;
				opacity = hovered ? 1 : this.siblingOpacity;
			}
			slide.style.setProperty("--pss-item-scale", itemScale);
			slide.style.setProperty("--pss-item-opacity", opacity);
			slide.style.setProperty("--pss-item-shift", `${shift}px`);
			slide.classList.toggle("is-active", active);
			const trigger = slide.querySelector("[data-activate]");
			const details = slide.querySelector("[data-details]");
			trigger?.setAttribute("aria-pressed", String(active));
			trigger?.setAttribute("aria-expanded", String(active));
			details?.setAttribute("aria-hidden", String(!active));
		});

		this.positionDetails();
		requestAnimationFrame(() => this.align());
	}

	align() {
		if (!this.track || !this.viewport) return;
		let center = this.track.scrollWidth / 2;
		if (this.active >= 0) {
			const slide = this.slides[this.active];
			center = slide.offsetLeft + slide.offsetWidth / 2;
		}
		this.track.style.transform = `translate3d(${this.viewport.clientWidth / 2 - center}px,0,0)`;
		this.positionDetails();
	}

	positionDetails() {
		if (this.active < 0) return;
		const slide = this.slides[this.active];
		if (!slide?.querySelector("[data-details]")) return;
		const section = this.section.getBoundingClientRect();
		const viewport = this.viewport.getBoundingClientRect();
		const width = slide.offsetWidth || this.focusWidth;
		const height = slide.offsetHeight || this.imageHeight;
		const slideLeft = viewport.left + viewport.width / 2 - width / 2;
		const slideTop = viewport.top + viewport.height / 2 - height / 2;
		slide.style.setProperty(
			"--pss-details-shift-x",
			`${section.left + this.detailsInset - slideLeft}px`,
		);
		slide.style.setProperty(
			"--pss-details-shift-y",
			`${section.top + this.detailsInset - slideTop}px`,
		);
	}

	normalize(index) {
		return (
			((index % this.slides.length) + this.slides.length) % this.slides.length
		);
	}

	selectThumbnail(button) {
		const slide = button.closest("[data-slide]");
		const image = slide?.querySelector(".pss__image:not(.pss__placeholder)");
		if (!slide || !image) return;
		image.src = button.dataset.imageUrl;
		slide.querySelectorAll("[data-thumbnail]").forEach((item) => {
			const active = item === button;
			item.classList.toggle("is-active", active);
			item.setAttribute("aria-pressed", String(active));
		});
	}

	onChange(event) {
		if (!event.target.matches("[data-option-input]")) return;
		const slide = event.target.closest("[data-slide]");
		if (!slide?.variants?.length) return;
		const options = [...slide.querySelectorAll("[data-option-group]")].map(
			(group) => group.querySelector("[data-option-input]:checked")?.value,
		);
		const variant = slide.variants.find((item) =>
			item.options.every((value, index) => value === options[index]),
		);
		this.updateVariant(slide, variant);
	}

	updateVariant(slide, variant) {
		const input = slide.querySelector("[data-variant-id]");
		const price = slide.querySelector("[data-price]");
		const compare = slide.querySelector("[data-compare-price]");
		const button = slide.querySelector("[data-add-button]");
		const label = slide.querySelector("[data-button-label]");
		if (!variant) {
			if (input) input.value = "";
			if (button) button.disabled = true;
			if (label)
				label.textContent = this.dataset.unavailableLabel || "Unavailable";
			return;
		}
		if (input) input.value = variant.id;
		if (price) price.textContent = variant.price;
		if (compare) {
			compare.textContent = variant.compareAtPrice || "";
			compare.classList.toggle("is-hidden", !variant.compareAtPrice);
		}
		if (button) button.disabled = !variant.available;
		if (label)
			label.textContent = variant.available
				? button?.dataset.defaultLabel || "Add to Cart"
				: this.dataset.soldOutLabel || "Sold out";
	}

	async onSubmit(event) {
		const form = event.target.closest("[data-product-form]");
		if (!form) return;
		event.preventDefault();
		const button = form.querySelector("[data-add-button]");
		const label = form.querySelector("[data-button-label]");
		const message = form
			.closest("[data-slide]")
			?.querySelector("[data-product-message]");
		if (!button || button.disabled) return;
		button.disabled = true;
		button.setAttribute("aria-busy", "true");
		if (label) label.textContent = this.dataset.addingLabel || "Adding…";
		try {
			const root = window.Shopify?.routes?.root || "/";
			const response = await fetch(`${root}cart/add.js`, {
				method: "POST",
				headers: { Accept: "application/json" },
				body: new FormData(form),
			});
			const product = await response.json();
			if (!response.ok)
				throw new Error(
					product.description || product.message || this.dataset.errorLabel,
				);
			if (label) label.textContent = this.dataset.addedLabel || "Added";
			if (message)
				message.textContent = this.dataset.addedLabel || "Added to cart";
			this.dispatchEvent(
				new CustomEvent("cart:refresh", { bubbles: true, detail: { product } }),
			);
			setTimeout(() => {
				button.disabled = false;
				if (label) label.textContent = button.dataset.defaultLabel;
			}, 1600);
		} catch (error) {
			button.disabled = false;
			if (label) label.textContent = button.dataset.defaultLabel;
			if (message)
				message.textContent =
					error.message ||
					this.dataset.errorLabel ||
					"Unable to add this item.";
		} finally {
			button.removeAttribute("aria-busy");
		}
	}
}

if (!customElements.get("carousel-product-slideshow")) {
	customElements.define("carousel-product-slideshow", ProductSlideshow);
}
