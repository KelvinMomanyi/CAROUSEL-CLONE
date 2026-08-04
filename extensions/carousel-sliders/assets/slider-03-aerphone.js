(function () {
  const selector = '[data-slider-03]';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function init(root) {
    if (!root || root.dataset.slider03Ready === 'true') return;
    const next = root.querySelector('[data-slider-03-next]');
    const previous = root.querySelector('[data-slider-03-prev]');
    const carousel = root.querySelector('.carousel');
    const list = root.querySelector('.carousel .list');
    if (!next || !previous || !carousel || !list) return;

    const controller = new AbortController();
    const signal = controller.signal;
    let animationTimer;
    let autoplayTimer;
    let paused = false;

    function stopAutoplay() {
      window.clearTimeout(autoplayTimer);
    }

    function queueAutoplay() {
      stopAutoplay();
      if (paused || reduceMotion.matches || list.children.length < 2 || !root.isConnected) return;
      autoplayTimer = window.setTimeout(function () { next.click(); }, 5000);
    }

    function show(direction) {
      const items = list.querySelectorAll('.item');
      if (items.length < 2) return;
      carousel.classList.remove('next', 'prev');
      if (direction === 'next') list.appendChild(items[0]);
      else list.prepend(items[items.length - 1]);
      carousel.classList.add(direction);
      next.disabled = true;
      previous.disabled = true;
      window.clearTimeout(animationTimer);
      animationTimer = window.setTimeout(function () {
        carousel.classList.remove('next', 'prev');
        next.disabled = false;
        previous.disabled = false;
      }, reduceMotion.matches ? 0 : 2000);
      queueAutoplay();
    }

    function pause() { paused = true; stopAutoplay(); }
    function resume() { paused = false; queueAutoplay(); }

    next.addEventListener('click', function () { show('next'); }, { signal });
    previous.addEventListener('click', function () { show('prev'); }, { signal });
    root.addEventListener('click', function (event) {
      const linkButton = event.target.closest('button[data-url]');
      if (linkButton && root.contains(linkButton)) window.location.assign(linkButton.dataset.url);
    }, { signal });
    root.addEventListener('mouseenter', pause, { signal });
    root.addEventListener('mouseleave', resume, { signal });
    root.addEventListener('focusin', pause, { signal });
    root.addEventListener('focusout', function () {
      if (!root.contains(document.activeElement)) resume();
    }, { signal });
    reduceMotion.addEventListener('change', queueAutoplay, { signal });

    const hasMultiple = list.children.length > 1;
    next.hidden = !hasMultiple;
    previous.hidden = !hasMultiple;
    root.__carouselPause = pause;
    root.__carouselResume = resume;
    root.__carouselRefresh = queueAutoplay;
    root.__carouselDestroy = function () {
      stopAutoplay();
      window.clearTimeout(animationTimer);
      controller.abort();
      delete root.dataset.slider03Ready;
      delete root.__carouselPause;
      delete root.__carouselResume;
      delete root.__carouselRefresh;
      delete root.__carouselDestroy;
    };
    root.dataset.slider03Ready = 'true';
    queueAutoplay();
  }

  function roots(scope) {
    const result = [];
    if (scope?.matches?.(selector)) result.push(scope);
    scope?.querySelectorAll?.(selector).forEach(function (root) { result.push(root); });
    return result;
  }
  function initAll(scope) { roots(scope || document).forEach(init); }
  function destroyAll(scope) { roots(scope).forEach(function (root) { root.__carouselDestroy?.(); }); }
  function call(event, method) {
    const root = event.target?.closest?.(selector);
    root?.[method]?.();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { initAll(document); }, { once: true });
  else initAll(document);
  document.addEventListener('shopify:section:load', function (event) { initAll(event.target); });
  document.addEventListener('shopify:section:unload', function (event) { destroyAll(event.target); });
  document.addEventListener('shopify:section:reorder', function (event) { roots(event.target).forEach(function (root) { root.__carouselRefresh?.(); }); });
  document.addEventListener('shopify:block:select', function (event) { call(event, '__carouselPause'); });
  document.addEventListener('shopify:block:deselect', function (event) { call(event, '__carouselResume'); });
})();

