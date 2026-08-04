(function () {
  const selector = '.slider-07-root';

  function init(root) {
    if (!root || root.dataset.slider07Ready === 'true') return;
    const controller = new AbortController();
    const signal = controller.signal;
    let animationTimer;

    function close() {
      const panel = root.querySelector('.active-product-display');
      panel?.classList.remove('show');
      panel?.closest('.banner')?.classList.remove('ring-display-open');
    }
    function update(item) {
      const image = root.querySelector('.active-product-display img');
      const imagePlaceholder = root.querySelector('.active-product-placeholder');
      const title = root.querySelector('.product-info-panel h2');
      const price = root.querySelector('.product-info-panel p');
      const id = root.querySelector('.active-product-form input[name="id"]');
      const form = root.querySelector('.active-product-form');
      const panel = root.querySelector('.active-product-display');
      const button = root.querySelector('.active-product-form .btn');
      const optionsLink = root.querySelector('.active-product-options');
      const available = item.dataset.available === 'true';
      const hasOptions = item.dataset.hasOptions === 'true';
      const hasImage = Boolean(item.dataset.image);
      if (image) {
        image.hidden = !hasImage;
        if (hasImage) { image.src = item.dataset.image; image.alt = item.dataset.title || ''; }
      }
      if (imagePlaceholder) imagePlaceholder.hidden = hasImage;
      if (title) title.textContent = item.dataset.title || '';
      if (price) price.textContent = item.dataset.price || '';
      if (id) id.value = item.dataset.id || '';
      if (button) {
        button.disabled = !available;
        button.textContent = available ? root.dataset.addLabel : root.dataset.soldLabel;
      }
      if (form) form.hidden = hasOptions;
      if (optionsLink) {
        optionsLink.hidden = !hasOptions;
        optionsLink.href = item.dataset.url || '#';
        optionsLink.dataset.productId = item.dataset.productId || '';
        optionsLink.textContent = root.dataset.optionsLabel;
      }
      if (!panel) return;
      panel.classList.add('show');
      panel.closest('.banner')?.classList.add('ring-display-open');
      panel.style.transform = 'scale(.95)';
      window.clearTimeout(animationTimer);
      animationTimer = window.setTimeout(function () { panel.style.transform = 'scale(1)'; }, 50);
    }

    root.addEventListener('click', function (event) {
      const closeButton = event.target.closest('.close-display-btn');
      if (closeButton && root.contains(closeButton)) { close(); return; }
      const item = event.target.closest('.banner .slider .item');
      if (item && root.contains(item)) update(item);
    }, { signal });

    root.__carouselPause = function () { root.classList.add('is-editor-selected'); };
    root.__carouselResume = function () { root.classList.remove('is-editor-selected'); };
    root.__carouselRefresh = function () {};
    root.__carouselDestroy = function () {
      window.clearTimeout(animationTimer);
      controller.abort();
      delete root.dataset.slider07Ready;
      delete root.__carouselPause;
      delete root.__carouselResume;
      delete root.__carouselRefresh;
      delete root.__carouselDestroy;
    };
    root.dataset.slider07Ready = 'true';
  }

  function roots(scope) {
    const result = [];
    if (scope?.matches?.(selector)) result.push(scope);
    scope?.querySelectorAll?.(selector).forEach(function (root) { result.push(root); });
    return result;
  }
  function initAll(scope) { roots(scope || document).forEach(init); }
  function destroyAll(scope) { roots(scope).forEach(function (root) { root.__carouselDestroy?.(); }); }
  function call(event, method) { event.target?.closest?.(selector)?.[method]?.(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { initAll(document); }, { once: true });
  else initAll(document);
  document.addEventListener('shopify:section:load', function (event) { initAll(event.target); });
  document.addEventListener('shopify:section:unload', function (event) { destroyAll(event.target); });
  document.addEventListener('shopify:section:reorder', function (event) { roots(event.target).forEach(function (root) { root.__carouselRefresh?.(); }); });
  document.addEventListener('shopify:block:select', function (event) { call(event, '__carouselPause'); });
  document.addEventListener('shopify:block:deselect', function (event) { call(event, '__carouselResume'); });
})();

