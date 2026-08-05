(function () {
  const selector = '[data-shv-main-slider]';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const autoplayDelay = 7000;
  const animationDuration = 3000;

  function init(root) {
    if (!root || root.dataset.shvMainInitialized === 'true') return;

    const next = root.querySelector('.shv-nav-next');
    const previous = root.querySelector('.shv-nav-prev');
    const track = root.querySelector('.shv-slider-track');
    const thumbnails = root.querySelector('.shv-slider-thumbs');
    const status = root.querySelector('[data-carousel-status]');
    if (!next || !previous || !track || !thumbnails) return;

    const controller = new AbortController();
    const signal = controller.signal;
    const pauseReasons = new Set();
    const statusTemplate = root.dataset.carouselStatusTemplate || 'Product __CURRENT__ of __TOTAL__';
    let animationTimer = null;
    let autoplayTimer = null;
    let intersectionObserver = null;

    const initialSlides = Array.from(track.children);
    const initialThumbnails = thumbnails.querySelectorAll('.shv-slide');
    initialSlides.forEach(function (slide, index) {
      slide.dataset.carouselIndex = String(index + 1);
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', 'slide');
    });
    if (initialThumbnails.length > 1) thumbnails.appendChild(initialThumbnails[0]);

    track.id = track.id || `${root.id}-track`;
    track.setAttribute('aria-live', 'off');
    next.setAttribute('aria-controls', track.id);
    previous.setAttribute('aria-controls', track.id);

    function stopAutoplay() {
      window.clearTimeout(autoplayTimer);
      autoplayTimer = null;
    }

    function queueAutoplay() {
      stopAutoplay();
      if (pauseReasons.size || reduceMotion.matches || track.children.length < 2 || !root.isConnected) return;
      autoplayTimer = window.setTimeout(function () {
        if (root.isConnected) show('next');
      }, autoplayDelay);
    }

    function setPaused(reason, paused) {
      if (paused) pauseReasons.add(reason);
      else pauseReasons.delete(reason);
      queueAutoplay();
    }

    function slideStatus(slide) {
      const current = slide?.dataset.carouselIndex || '1';
      return statusTemplate
        .replace('__CURRENT__', current)
        .replace('__TOTAL__', String(initialSlides.length));
    }

    function updateSlides(announce) {
      Array.from(track.children).forEach(function (slide, index) {
        const active = index === 0;
        const label = slideStatus(slide);
        slide.setAttribute('aria-hidden', String(!active));
        slide.setAttribute('aria-label', label);
        slide.inert = !active;
      });

      if (announce && status) {
        const activeSlide = track.firstElementChild;
        const title = activeSlide?.querySelector('[data-product-url]')?.textContent?.trim();
        status.textContent = title ? `${slideStatus(activeSlide)} — ${title}` : slideStatus(activeSlide);
      }
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

      updateSlides(true);
      root.classList.add(direction);
      root.setAttribute('aria-busy', 'true');
      window.clearTimeout(animationTimer);
      animationTimer = window.setTimeout(function () {
        root.classList.remove('next', 'prev');
        root.setAttribute('aria-busy', 'false');
      }, reduceMotion.matches ? 0 : animationDuration);
      queueAutoplay();
    }

    next.addEventListener('click', function () { show('next'); }, { signal });
    previous.addEventListener('click', function () { show('prev'); }, { signal });
    root.addEventListener('keydown', function (event) {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      show(event.key === 'ArrowRight' ? 'next' : 'prev');
    }, { signal });
    root.addEventListener('mouseenter', function () { setPaused('hover', true); }, { signal });
    root.addEventListener('mouseleave', function () { setPaused('hover', false); }, { signal });
    root.addEventListener('focusin', function () { setPaused('focus', true); }, { signal });
    root.addEventListener('focusout', function () {
      window.requestAnimationFrame(function () {
        setPaused('focus', root.contains(document.activeElement));
      });
    }, { signal });
    document.addEventListener('visibilitychange', function () {
      setPaused('document', document.hidden);
    }, { signal });
    reduceMotion.addEventListener('change', queueAutoplay, { signal });

    if (typeof IntersectionObserver !== 'undefined') {
      intersectionObserver = new IntersectionObserver(function ([entry]) {
        setPaused('viewport', !entry.isIntersecting);
      }, { rootMargin: '120px' });
      intersectionObserver.observe(root);
    }

    root.__carouselPause = function () { setPaused('editor', true); };
    root.__carouselResume = function () { setPaused('editor', false); };
    root.__carouselRefresh = queueAutoplay;
    root.__carouselDestroy = function () {
      stopAutoplay();
      window.clearTimeout(animationTimer);
      intersectionObserver?.disconnect();
      controller.abort();
      root.classList.remove('next', 'prev');
      root.setAttribute('aria-busy', 'false');
      delete root.dataset.shvMainInitialized;
      delete root.__carouselPause;
      delete root.__carouselResume;
      delete root.__carouselRefresh;
      delete root.__carouselDestroy;
    };
    root.dataset.shvMainInitialized = 'true';
    updateSlides(false);
    setPaused('document', document.hidden);
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
