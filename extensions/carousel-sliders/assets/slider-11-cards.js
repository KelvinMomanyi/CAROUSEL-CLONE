(function () {
  const selector = '[data-slider-11]';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function init(root) {
    if (!root || root.dataset.slider11Ready === 'true') return;
    const track = root.querySelector('[data-slider-11-track]');
    const next = root.querySelector('[data-slider-11-next]');
    const previous = root.querySelector('[data-slider-11-prev]');
    if (!track || !next || !previous) return;
    const controller = new AbortController();
    const signal = controller.signal;
    let autoplayTimer;
    let animationTimer;
    let animating = false;
    let paused = false;

    function stopAutoplay() { window.clearTimeout(autoplayTimer); }
    function queueAutoplay() {
      stopAutoplay();
      if (paused || reduceMotion.matches || track.children.length < 2 || !root.isConnected) return;
      autoplayTimer = window.setTimeout(function () { next.click(); }, 4000);
    }
    function move(direction) {
      if (animating) return;
      const items = track.querySelectorAll('.item');
      if (items.length < 2) return;
      animating = true;
      if (direction > 0) track.appendChild(items[0]);
      else track.prepend(items[items.length - 1]);
      window.clearTimeout(animationTimer);
      animationTimer = window.setTimeout(function () { animating = false; }, reduceMotion.matches ? 0 : 950);
      queueAutoplay();
    }
    function pause() { paused = true; stopAutoplay(); }
    function resume() { paused = false; queueAutoplay(); }

    next.addEventListener('click', function () { move(1); }, { signal });
    previous.addEventListener('click', function () { move(-1); }, { signal });
    root.addEventListener('mouseenter', pause, { signal });
    root.addEventListener('mouseleave', resume, { signal });
    root.addEventListener('focusin', pause, { signal });
    root.addEventListener('focusout', function () { if (!root.contains(document.activeElement)) resume(); }, { signal });
    reduceMotion.addEventListener('change', queueAutoplay, { signal });

    next.hidden = track.children.length < 2;
    previous.hidden = track.children.length < 2;
    root.__carouselPause = pause;
    root.__carouselResume = resume;
    root.__carouselRefresh = queueAutoplay;
    root.__carouselDestroy = function () {
      stopAutoplay(); window.clearTimeout(animationTimer); controller.abort();
      delete root.dataset.slider11Ready; delete root.__carouselPause; delete root.__carouselResume; delete root.__carouselRefresh; delete root.__carouselDestroy;
    };
    root.dataset.slider11Ready = 'true';
    queueAutoplay();
  }

  function roots(scope) { const result = []; if (scope?.matches?.(selector)) result.push(scope); scope?.querySelectorAll?.(selector).forEach(function (root) { result.push(root); }); return result; }
  function initAll(scope) { roots(scope || document).forEach(init); }
  function destroyAll(scope) { roots(scope).forEach(function (root) { root.__carouselDestroy?.(); }); }
  function call(event, method) { event.target?.closest?.(selector)?.[method]?.(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { initAll(document); }, { once: true }); else initAll(document);
  document.addEventListener('shopify:section:load', function (event) { initAll(event.target); });
  document.addEventListener('shopify:section:unload', function (event) { destroyAll(event.target); });
  document.addEventListener('shopify:section:reorder', function (event) { roots(event.target).forEach(function (root) { root.__carouselRefresh?.(); }); });
  document.addEventListener('shopify:block:select', function (event) { call(event, '__carouselPause'); });
  document.addEventListener('shopify:block:deselect', function (event) { call(event, '__carouselResume'); });
})();

