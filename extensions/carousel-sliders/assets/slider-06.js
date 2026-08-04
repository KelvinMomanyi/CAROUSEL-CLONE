(function () {
  const selector = '.slider-06-root';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function init(root) {
    if (!root || root.dataset.slider06Ready === 'true') return;
    const previous = root.querySelector('[data-slider-06-prev]');
    const next = root.querySelector('[data-slider-06-next]');
    const items = Array.from(root.querySelectorAll('.list .item'));
    const indicator = root.querySelector('.indicators');
    const dots = Array.from(indicator?.querySelectorAll('ul li') || []);
    if (!previous || !next || !items.length || !indicator) return;

    const controller = new AbortController();
    const signal = controller.signal;
    let active = Math.max(0, items.findIndex(function (item) { return item.classList.contains('active'); }));
    let autoplayTimer;
    let paused = false;

    function stopAutoplay() { window.clearTimeout(autoplayTimer); }
    function queueAutoplay() {
      stopAutoplay();
      if (paused || reduceMotion.matches || items.length < 2 || !root.isConnected) return;
      autoplayTimer = window.setTimeout(function () { next.click(); }, 5000);
    }
    function render() {
      items.forEach(function (item, index) {
        item.classList.toggle('active', index === active);
        item.setAttribute('aria-hidden', index === active ? 'false' : 'true');
        item.inert = index !== active;
      });
      dots.forEach(function (dot, index) {
        dot.classList.toggle('active', index === active);
        dot.querySelector('button')?.setAttribute('aria-current', index === active ? 'true' : 'false');
      });
      const number = indicator.querySelector('.number');
      if (number) number.textContent = String(active + 1).padStart(2, '0');
      queueAutoplay();
    }
    function move(change) {
      active = (active + change + items.length) % items.length;
      root.style.setProperty('--calculation', change > 0 ? '1' : '-1');
      render();
    }
    function pause() { paused = true; stopAutoplay(); }
    function resume() { paused = false; queueAutoplay(); }

    next.addEventListener('click', function () { move(1); }, { signal });
    previous.addEventListener('click', function () { move(-1); }, { signal });
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () { active = index; render(); }, { signal });
    });
    root.addEventListener('click', function (event) {
      const button = event.target.closest('button[data-url]');
      if (button && root.contains(button)) window.location.assign(button.dataset.url);
    }, { signal });
    root.addEventListener('mouseenter', pause, { signal });
    root.addEventListener('mouseleave', resume, { signal });
    root.addEventListener('focusin', pause, { signal });
    root.addEventListener('focusout', function () { if (!root.contains(document.activeElement)) resume(); }, { signal });
    reduceMotion.addEventListener('change', queueAutoplay, { signal });

    previous.hidden = items.length < 2;
    next.hidden = items.length < 2;
    root.__carouselPause = pause;
    root.__carouselResume = resume;
    root.__carouselRefresh = render;
    root.__carouselDestroy = function () {
      stopAutoplay();
      controller.abort();
      delete root.dataset.slider06Ready;
      delete root.__carouselPause;
      delete root.__carouselResume;
      delete root.__carouselRefresh;
      delete root.__carouselDestroy;
    };
    root.dataset.slider06Ready = 'true';
    render();
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

