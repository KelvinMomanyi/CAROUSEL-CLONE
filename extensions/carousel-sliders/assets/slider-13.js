(function () {
  const selector = '.slider-13-root';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function init(root) {
    if (!root || root.dataset.slider13Ready === 'true') return;
    const slider = root.querySelector('.slider');
    const items = Array.from(root.querySelectorAll('.slider .item'));
    const next = root.querySelector('.slider-13-next');
    const previous = root.querySelector('.slider-13-prev');
    if (!slider || !items.length || !next || !previous) return;
    const controller = new AbortController();
    const signal = controller.signal;
    const itemCount = items.length;
    const speed = Math.max(2000, (parseFloat(root.dataset.autoplaySpeed) || 4) * 1000);
    let active = Math.min(3, itemCount - 1);
    let autoplayTimer;
    let animationTimer;
    let touchTimer;
    let animating = false;
    let paused = false;

    function signedOffset(index) {
      const raw = (index - active + itemCount) % itemCount;
      return raw === 0 ? 0 : raw <= itemCount / 2 ? raw : raw - itemCount;
    }
    function position(item, offset, step, scaleStep) {
      const depth = Math.abs(offset);
      item.style.pointerEvents = depth <= 2 ? 'auto' : 'none';
      item.classList.toggle('is-active', depth === 0);
      if (depth === 0) {
        item.style.transform = 'translate3d(0,0,0) scale(1)';
        item.style.zIndex = String(itemCount + 2);
        item.style.filter = 'none';
        item.style.opacity = '1';
        return;
      }
      const slot = Math.min(depth, 3);
      const direction = offset > 0 ? 1 : -1;
      const distance = step * (slot === 3 ? 3.2 : slot);
      const scale = slot === 1 ? Math.max(.8, 1 - scaleStep) : slot === 2 ? Math.max(.72, 1 - scaleStep * 2) : .72;
      const rotation = slot === 1 ? 8 : slot === 2 ? 11 : 14;
      item.style.transform = 'translate3d(' + direction * distance + 'px,0,0) scale(' + scale + ') perspective(900px) rotateY(' + (direction > 0 ? -rotation : rotation) + 'deg)';
      item.style.zIndex = String(itemCount - slot);
      item.style.filter = slot > 1 ? 'blur(1px) saturate(.8)' : 'saturate(.9)';
      item.style.opacity = slot === 1 ? '.78' : slot === 2 ? '.34' : '0';
    }
    function render() {
      const width = slider.getBoundingClientRect().width;
      const step = width < 640 ? 76 : width < 1024 ? 102 : 134;
      const scaleStep = width < 640 ? .18 : .14;
      items.forEach(function (item, index) { position(item, signedOffset(index), step, scaleStep); });
    }
    function stopAutoplay() { window.clearTimeout(autoplayTimer); }
    function queueAutoplay() {
      stopAutoplay();
      if (paused || reduceMotion.matches || itemCount < 2 || !root.isConnected) return;
      autoplayTimer = window.setTimeout(function () { next.click(); }, speed);
    }
    function move(change) {
      if (animating || itemCount < 2) return;
      active = (active + change + itemCount) % itemCount;
      animating = true;
      render();
      window.clearTimeout(animationTimer);
      animationTimer = window.setTimeout(function () { animating = false; }, reduceMotion.matches ? 0 : 580);
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
    root.addEventListener('touchstart', pause, { passive: true, signal });
    root.addEventListener('touchend', function () { window.clearTimeout(touchTimer); touchTimer = window.setTimeout(resume, 1000); }, { signal });
    reduceMotion.addEventListener('change', queueAutoplay, { signal });
    const observer = new ResizeObserver(render);
    observer.observe(slider);

    next.hidden = itemCount < 2;
    previous.hidden = itemCount < 2;
    root.__carouselPause = pause;
    root.__carouselResume = resume;
    root.__carouselRefresh = render;
    root.__carouselDestroy = function () {
      stopAutoplay(); window.clearTimeout(animationTimer); window.clearTimeout(touchTimer); observer.disconnect(); controller.abort();
      delete root.dataset.slider13Ready; delete root.dataset.sliderReady; delete root.__carouselPause; delete root.__carouselResume; delete root.__carouselRefresh; delete root.__carouselDestroy;
    };
    root.dataset.slider13Ready = 'true';
    root.dataset.sliderReady = 'true';
    render();
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

