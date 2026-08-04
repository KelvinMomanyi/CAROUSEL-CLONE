(function () {
  const selector = '[data-shv-main-slider]';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function init(root) {
    if (!root || root.dataset.shvMainInitialized === 'true') return;

    const next = root.querySelector('.shv-nav-next');
    const previous = root.querySelector('.shv-nav-prev');
    const track = root.querySelector('.shv-slider-track');
    const thumbnails = root.querySelector('.shv-slider-thumbs');
    if (!next || !previous || !track || !thumbnails) return;

    const controller = new AbortController();
    const signal = controller.signal;
    let animationTimer = null;
    let autoplayTimer = null;
    let paused = false;

    const initialThumbnails = thumbnails.querySelectorAll('.shv-slide');
    if (initialThumbnails.length > 1) thumbnails.appendChild(initialThumbnails[0]);

    function stopAutoplay() {
      window.clearTimeout(autoplayTimer);
      autoplayTimer = null;
    }

    function queueAutoplay() {
      stopAutoplay();
      if (paused || reduceMotion.matches || track.children.length < 2 || !root.isConnected) return;
      autoplayTimer = window.setTimeout(function () {
        if (root.isConnected) next.click();
      }, 7000);
    }

    function updateSlides() {
      Array.from(track.children).forEach(function (slide, index) {
        slide.setAttribute('aria-hidden', index === 0 ? 'false' : 'true');
        slide.inert = index !== 0;
      });
    }

    function show(direction) {
      const slides = track.querySelectorAll('.shv-slide');
      const thumbnailSlides = thumbnails.querySelectorAll('.shv-slide');
      if (slides.length < 2 || thumbnailSlides.length < 2) return;

      root.classList.remove('next', 'prev');
      if (direction === 'next') {
        track.appendChild(slides[0]);
        thumbnails.appendChild(thumbnailSlides[0]);
      } else {
        track.prepend(slides[slides.length - 1]);
        thumbnails.prepend(thumbnailSlides[thumbnailSlides.length - 1]);
      }
      updateSlides();
      root.classList.add(direction);
      window.clearTimeout(animationTimer);
      animationTimer = window.setTimeout(function () {
        root.classList.remove('next', 'prev');
      }, reduceMotion.matches ? 0 : 3000);
      queueAutoplay();
    }

    function pause() {
      paused = true;
      track.setAttribute('aria-live', 'polite');
      stopAutoplay();
    }

    function resume() {
      paused = false;
      track.setAttribute('aria-live', 'off');
      queueAutoplay();
    }

    next.addEventListener('click', function () { show('next'); }, { signal });
    previous.addEventListener('click', function () { show('prev'); }, { signal });
    root.addEventListener('mouseenter', pause, { signal });
    root.addEventListener('mouseleave', resume, { signal });
    root.addEventListener('focusin', pause, { signal });
    root.addEventListener('focusout', function () {
      if (!root.contains(document.activeElement)) resume();
    }, { signal });
    reduceMotion.addEventListener('change', queueAutoplay, { signal });

    root.__carouselPause = pause;
    root.__carouselResume = resume;
    root.__carouselRefresh = queueAutoplay;
    root.__carouselDestroy = function () {
      stopAutoplay();
      window.clearTimeout(animationTimer);
      controller.abort();
      delete root.dataset.shvMainInitialized;
      delete root.__carouselPause;
      delete root.__carouselResume;
      delete root.__carouselRefresh;
      delete root.__carouselDestroy;
    };
    root.dataset.shvMainInitialized = 'true';
    track.setAttribute('aria-live', 'off');
    updateSlides();
    queueAutoplay();
  }

  function roots(scope) {
    const found = [];
    if (scope && scope.matches && scope.matches(selector)) found.push(scope);
    if (scope && scope.querySelectorAll) scope.querySelectorAll(selector).forEach(function (root) { found.push(root); });
    return found;
  }

  function initAll(scope) { roots(scope || document).forEach(init); }
  function destroyAll(scope) { roots(scope).forEach(function (root) { if (root.__carouselDestroy) root.__carouselDestroy(); }); }
  function callOnRoot(event, method) {
    const root = event.target && event.target.closest ? event.target.closest(selector) : null;
    if (root && root[method]) root[method]();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { initAll(document); }, { once: true });
  else initAll(document);

  document.addEventListener('shopify:section:load', function (event) { initAll(event.target); });
  document.addEventListener('shopify:section:unload', function (event) { destroyAll(event.target); });
  document.addEventListener('shopify:section:reorder', function (event) { roots(event.target).forEach(function (root) { root.__carouselRefresh?.(); }); });
  document.addEventListener('shopify:block:select', function (event) { callOnRoot(event, '__carouselPause'); });
  document.addEventListener('shopify:block:deselect', function (event) { callOnRoot(event, '__carouselResume'); });
})();

