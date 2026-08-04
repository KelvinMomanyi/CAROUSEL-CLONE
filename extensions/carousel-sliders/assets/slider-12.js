(function () {
  const selector = '.shv-slider-wrapper';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function init(root) {
    if (!root || root.dataset.slider12Ready === 'true') return;
    const next = root.querySelector('.shv-nav-next');
    const previous = root.querySelector('.shv-nav-prev');
    const track = root.querySelector('.shv-slider-track');
    const thumbnails = root.querySelector('.shv-slider-thumbs');
    if (!next || !previous || !track || !thumbnails) return;

    const controller = new AbortController();
    const signal = controller.signal;
    let animationTimer;
    let autoplayTimer;
    let animating = false;
    let paused = false;

    const initialThumbnails = thumbnails.querySelectorAll('.shv-slide');
    if (initialThumbnails.length > 1) thumbnails.appendChild(initialThumbnails[0]);

    function setGeometry(prefix, slide) {
      const image = slide?.querySelector('img') || slide;
      const imageRect = image?.getBoundingClientRect();
      const trackRect = track.getBoundingClientRect();
      if (!imageRect || !trackRect.width) return;
      root.style.setProperty('--shv-' + prefix + '-left', imageRect.left - trackRect.left + 'px');
      root.style.setProperty('--shv-' + prefix + '-top', imageRect.top - trackRect.top + 'px');
      root.style.setProperty('--shv-' + prefix + '-width', imageRect.width + 'px');
      root.style.setProperty('--shv-' + prefix + '-height', imageRect.height + 'px');
      root.style.setProperty('--shv-' + prefix + '-transform', 'translate3d(0,0,0)');
    }
    function stopAutoplay() { window.clearTimeout(autoplayTimer); }
    function queueAutoplay() {
      stopAutoplay();
      if (paused || reduceMotion.matches || track.children.length < 2 || !root.isConnected) return;
      autoplayTimer = window.setTimeout(function () { next.click(); }, 7000);
    }
    function updateSlides() {
      Array.from(track.children).forEach(function (slide, index) {
        slide.setAttribute('aria-hidden', index === 0 ? 'false' : 'true');
        slide.inert = index !== 0;
      });
    }
    function show(direction) {
      if (animating) return;
      const slides = track.querySelectorAll('.shv-slide');
      const thumbSlides = thumbnails.querySelectorAll('.shv-slide');
      if (slides.length < 2 || thumbSlides.length < 2) return;
      animating = true;
      root.classList.remove('next', 'prev');
      if (direction === 'next') {
        setGeometry('next-from', thumbSlides[0]);
        track.appendChild(slides[0]);
        thumbnails.appendChild(thumbSlides[0]);
      } else {
        track.prepend(slides[slides.length - 1]);
        thumbnails.prepend(thumbSlides[thumbSlides.length - 1]);
        setGeometry('prev-target', thumbnails.querySelector('.shv-slide'));
      }
      updateSlides();
      window.requestAnimationFrame(function () { if (root.isConnected) root.classList.add(direction); });
      window.clearTimeout(animationTimer);
      animationTimer = window.setTimeout(function () {
        root.classList.remove('next', 'prev');
        animating = false;
      }, reduceMotion.matches ? 0 : 920);
      queueAutoplay();
    }
    function pause() { paused = true; track.setAttribute('aria-live', 'polite'); stopAutoplay(); }
    function resume() { paused = false; track.setAttribute('aria-live', 'off'); queueAutoplay(); }

    next.addEventListener('click', function () { show('next'); }, { signal });
    previous.addEventListener('click', function () { show('prev'); }, { signal });
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
      delete root.dataset.slider12Ready; delete root.__carouselPause; delete root.__carouselResume; delete root.__carouselRefresh; delete root.__carouselDestroy;
    };
    root.dataset.slider12Ready = 'true';
    track.setAttribute('aria-live', 'off');
    updateSlides();
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

