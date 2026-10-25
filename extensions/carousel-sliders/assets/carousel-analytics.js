(function () {
  if (window.Shopify && window.Shopify.designMode) return;
  if (window.__carouselAnalytics) return;

  var queue = [];
  var timer = null;
  var seen = new WeakSet();
  var observer = null;
  var endpoint = '/apps/carousel/analytics';
  var flushDelay = 15000;

  function rootFor(el) {
    return el && el.closest ? el.closest('[data-carousel-root]') : null;
  }

  function eventId() {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    return null; // Older browsers still work; the server supplies their IDs.
  }

  function schedule() {
    if (timer === null) timer = window.setTimeout(flush, flushDelay);
  }

  function track(type, data) {
    queue.push({
      id: eventId(), type: type,
      blockName: (data.blockName || 'unknown').slice(0, 64),
      productId: (data.productId || '').slice(0, 128),
      variantId: (data.variantId || '').slice(0, 128),
      pageUrl: window.location.pathname.slice(0, 512)
    });
    if (queue.length >= 50) flush();
    else schedule();
  }

  function deliver(batch, exiting, retried) {
    var body = JSON.stringify({ events: batch });
    try {
      if (exiting && navigator.sendBeacon &&
          navigator.sendBeacon(endpoint, new Blob([body], { type: 'application/json' }))) return;
      window.fetch(endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: body, keepalive: true
      }).then(function (response) {
        if (!response.ok && (response.status === 429 || response.status >= 500)) {
          throw new Error('Analytics temporarily unavailable');
        }
      }).catch(function () {
        // Stable IDs make one retry safe, without double-counting or retry storms.
        if (!exiting && !retried && batch.every(function (event) { return event.id; })) {
          window.setTimeout(function () { deliver(batch, false, true); }, 5000);
        }
      });
    } catch (e) {
      // Analytics must never interrupt storefront interactions.
    }
  }

  function flush(exiting) {
    window.clearTimeout(timer);
    timer = null;
    while (queue.length) deliver(queue.splice(0, 50), exiting === true, false);
  }

  function observe(scope) {
    if (!observer || !scope) return;
    var roots = [];
    if (scope.matches && scope.matches('[data-carousel-root]')) roots.push(scope);
    if (scope.querySelectorAll) scope.querySelectorAll('[data-carousel-root]').forEach(function (root) {
      roots.push(root);
    });
    roots.forEach(function (root) { if (!seen.has(root)) observer.observe(root); });
  }

  if (window.IntersectionObserver) {
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || seen.has(entry.target)) return;
        seen.add(entry.target);
        track('impression', { blockName: entry.target.dataset.carouselLayout });
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.3 });
  }

  document.addEventListener('click', function (event) {
    var target = event.target && event.target.closest
      ? event.target.closest('[data-product-id],[data-product-url]') : null;
    var root = rootFor(target);
    if (target && root) track('click', {
      blockName: root.dataset.carouselLayout, productId: target.dataset.productId || ''
    });
  }, true);
  document.addEventListener('submit', function (event) {
    var form = event.target;
    var root = rootFor(form);
    if (!root || !form.matches('[data-carousel-cart-form]')) return;
    var input = form.querySelector('input[name="id"]');
    track('add_to_cart', { blockName: root.dataset.carouselLayout, variantId: input ? input.value : '' });
  }, true);
  document.addEventListener('shopify:section:load', function (event) { observe(event.target); });
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') flush(true);
  });
  window.addEventListener('pagehide', function () { flush(true); });
  window.__carouselAnalytics = { track: track, flush: flush, observe: observe };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { observe(document); }, { once: true });
  } else observe(document);
})();
