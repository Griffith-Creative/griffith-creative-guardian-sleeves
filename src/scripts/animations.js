/**
 * Guardian Sleeves - Animation System
 * All animations respect prefers-reduced-motion: reduce
 */

(function () {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ─── 1. Fade-up on scroll ───
  function initFadeUp(afterSwap) {
    const elements = document.querySelectorAll('[data-animate="fade-up"]');
    if (!elements.length) return;

    // After a client-side page swap the new page is already painted, so
    // hiding it again just produces a second flash. Show it and move on.
    if (prefersReducedMotion || afterSwap) {
      elements.forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    elements.forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 600ms ease-out, transform 600ms ease-out';
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    elements.forEach((el) => observer.observe(el));
  }

  // ─── 6. Number count-up ───
  function initCountUp() {
    const elements = document.querySelectorAll('[data-count-up]');
    if (!elements.length) return;

    if (prefersReducedMotion) {
      elements.forEach((el) => {
        el.textContent = el.getAttribute('data-count-up');
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseFloat(el.getAttribute('data-count-up'));
            const suffix = el.getAttribute('data-count-suffix') || '';
            const prefix = el.getAttribute('data-count-prefix') || '';
            const decimals = (el.getAttribute('data-count-up').split('.')[1] || '').length;
            const duration = 1200;
            const startTime = performance.now();

            function easeOutCubic(t) {
              return 1 - Math.pow(1 - t, 3);
            }

            function update(now) {
              const elapsed = now - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const eased = easeOutCubic(progress);
              const current = eased * target;

              el.textContent = prefix + current.toFixed(decimals) + suffix;

              if (progress < 1) {
                requestAnimationFrame(update);
              }
            }

            requestAnimationFrame(update);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.3 }
    );

    elements.forEach((el) => observer.observe(el));
  }

  // ─── 7. Letter-by-letter reveal ───
  function initLetterReveal() {
    const elements = document.querySelectorAll('[data-hero-headline]');
    if (!elements.length) return;

    if (prefersReducedMotion) return;

    elements.forEach((el) => {
      const text = el.textContent.trim();
      el.textContent = '';
      el.style.overflow = 'hidden';

      const wrapper = document.createElement('span');
      wrapper.style.display = 'inline-block';

      // Group per word so a word never breaks mid-letter: each word is a
      // nowrap inline-block of animated char spans, with a real (breakable)
      // space between words. This is the only place lines may wrap.
      let i = 0;
      text.split(' ').forEach((word, w) => {
        if (w > 0) wrapper.appendChild(document.createTextNode(' '));
        const wordSpan = document.createElement('span');
        wordSpan.style.display = 'inline-block';
        wordSpan.style.whiteSpace = 'nowrap';
        word.split('').forEach((char) => {
          const span = document.createElement('span');
          span.textContent = char;
          span.style.display = 'inline-block';
          span.style.transform = 'translateY(100%)';
          span.style.transition = `transform 400ms cubic-bezier(0.16, 1, 0.3, 1) ${i * 30}ms`;
          wordSpan.appendChild(span);
          i++;
        });
        wrapper.appendChild(wordSpan);
      });

      el.appendChild(wrapper);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          wrapper.querySelectorAll('span').forEach((span) => {
            span.style.transform = 'translateY(0)';
          });
        });
      });
    });
  }

  // ─── 4. Cursor-follow vignette on hero ───
  function initCursorVignette() {
    const hero = document.querySelector('[data-cursor-vignette]');
    if (!hero) return;
    if (prefersReducedMotion) return;

    // Disable on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const vignette = document.createElement('div');
    vignette.style.cssText =
      'position:absolute;inset:0;pointer-events:none;z-index:5;opacity:0;transition:opacity 300ms;';
    hero.style.position = 'relative';
    hero.appendChild(vignette);

    let targetX = 50;
    let targetY = 50;
    let currentX = 50;
    let currentY = 50;
    let rafId = null;

    function lerp(a, b, t) {
      return a + (b - a) * t;
    }

    function updateVignette() {
      currentX = lerp(currentX, targetX, 0.08);
      currentY = lerp(currentY, targetY, 0.08);
      vignette.style.background = `radial-gradient(circle at ${currentX}% ${currentY}%, transparent 20%, rgba(0,0,0,0.2) 100%)`;
      rafId = requestAnimationFrame(updateVignette);
    }

    hero.addEventListener('mouseenter', () => {
      vignette.style.opacity = '1';
      rafId = requestAnimationFrame(updateVignette);
    });

    hero.addEventListener('mouseleave', () => {
      vignette.style.opacity = '0';
      if (rafId) cancelAnimationFrame(rafId);
    });

    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      targetX = ((e.clientX - rect.left) / rect.width) * 100;
      targetY = ((e.clientY - rect.top) / rect.height) * 100;
    });
  }

  // ─── Init ───
  function init(afterSwap = false) {
    initFadeUp(afterSwap === true);
    initCountUp();
    initLetterReveal();
    initCursorVignette();
  }

  // Run on initial load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-run after Astro page transitions
  document.addEventListener('astro:after-swap', () => init(true));
})();
