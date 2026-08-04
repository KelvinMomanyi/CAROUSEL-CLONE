(function () {
  const selector = '.slider-09-root';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function init(root) {
    if (!root || root.dataset.slider09Ready === 'true') return;
    const items = Array.from(root.querySelectorAll('.carousel .list .item'));
    const carousel = root.querySelector('.carousel');
    const dots = Array.from(root.querySelectorAll('.dots li'));
    const next = root.querySelector('.arrows-next');
    const previous = root.querySelector('.arrows-prev');
    if (!items.length || !carousel || !next || !previous) return;

    const controller = new AbortController();
    const signal = controller.signal;
    let active = Math.max(0, items.findIndex(function (item) { return item.classList.contains('active'); }));
    let zIndex = 2;
    let effectTimer;
    let autoplayTimer;
    let paused = false;

    function stopAutoplay() { window.clearTimeout(autoplayTimer); }
    function queueAutoplay() {
      stopAutoplay();
      if (paused || reduceMotion.matches || items.length < 2 || !root.isConnected) return;
      autoplayTimer = window.setTimeout(function () { next.click(); }, 5000);
    }
    function show(direction) {
      carousel.style.pointerEvents = 'none';
      items.forEach(function (item, index) {
        item.classList.toggle('active', index === active);
        item.setAttribute('aria-hidden', index === active ? 'false' : 'true');
        item.inert = index !== active;
      });
      zIndex += 1;
      items[active].style.zIndex = String(zIndex);
      if (direction === 'previous') {
        carousel.style.setProperty('--slider09-active-from', '-300px');
        carousel.style.setProperty('--slider09-item-to', '300px');
        carousel.style.setProperty('--slider09-clip-edge', '0%');
      } else {
        carousel.style.setProperty('--slider09-active-from', '300px');
        carousel.style.setProperty('--slider09-item-to', '-300px');
        carousel.style.setProperty('--slider09-clip-edge', '100%');
      }
      carousel.classList.add('effect');
      dots.forEach(function (dot, index) {
        dot.classList.toggle('active', index === active);
        dot.querySelector('button')?.setAttribute('aria-current', index === active ? 'true' : 'false');
      });
      window.clearTimeout(effectTimer);
      effectTimer = window.setTimeout(function () {
        carousel.classList.remove('effect');
        carousel.style.pointerEvents = '';
      }, reduceMotion.matches ? 0 : 1500);
      queueAutoplay();
    }
    function move(change) {
      const newActive = (active + change + items.length) % items.length;
      if (newActive === active) return;
      active = newActive;
      show(change < 0 ? 'previous' : 'next');
    }
    function pause() { paused = true; stopAutoplay(); }
    function resume() { paused = false; queueAutoplay(); }

    next.addEventListener('click', function () { move(1); }, { signal });
    previous.addEventListener('click', function () { move(-1); }, { signal });
    dots.forEach(function (dot, index) { dot.addEventListener('click', function () { active = index; show('next'); }, { signal }); });
    root.addEventListener('mouseenter', pause, { signal });
    root.addEventListener('mouseleave', resume, { signal });
    root.addEventListener('focusin', pause, { signal });
    root.addEventListener('focusout', function () { if (!root.contains(document.activeElement)) resume(); }, { signal });
    reduceMotion.addEventListener('change', queueAutoplay, { signal });

    next.hidden = items.length < 2;
    previous.hidden = items.length < 2;
    root.__carouselPause = pause;
    root.__carouselResume = resume;
    root.__carouselRefresh = queueAutoplay;
    root.__carouselDestroy = function () {
      stopAutoplay();
      window.clearTimeout(effectTimer);
      controller.abort();
      delete root.dataset.slider09Ready;
      delete root.__carouselPause;
      delete root.__carouselResume;
      delete root.__carouselRefresh;
      delete root.__carouselDestroy;
    };
    root.dataset.slider09Ready = 'true';
    show('next');
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

