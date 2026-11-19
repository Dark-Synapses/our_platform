import { useEffect, type RefObject } from 'react';

export const reducedMotion = '(prefers-reduced-motion: reduce)';

export function isPublicPath(pathname: string) {
  return /^\/(?:$|(?:about|contact|projects|tech-news|security-researcher|login|register|dashboard|team|system|service-requests|admin(?:\/[^/]+)*|services(?:\/[^/]+)?)\/?$)/.test(pathname);
}

function animateTitle(title: HTMLElement, animations: Set<Animation>) {
  // Highlight the existing glyph positions, keeping the title's text and wrapping intact.
  if (!('Highlight' in window) || !CSS.highlights) return;
  const walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT);
  const letters: Range[] = [];
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.textContent ?? '';
    let offset = 0;
    for (const letter of text) {
      if (/\S/.test(letter)) {
        const range = new Range();
        range.setStart(node, offset);
        range.setEnd(node, offset + letter.length);
        letters.push(range);
      }
      offset += letter.length;
    }
  }

  const duration = Math.max(1, letters.length) * 24 + 240;
  const animation = title.animate([], { duration });
  animations.add(animation);
  let frame = 0;
  const paint = () => {
    if (animation.playState !== 'running') return;
    const index = Math.floor(Number(animation.currentTime ?? 0) / 24);
    CSS.highlights.set('ds-title-glow', new Highlight(...letters.slice(Math.max(0, index - 8), index + 1)));
    frame = requestAnimationFrame(paint);
  };
  const clear = () => {
    animations.delete(animation);
    cancelAnimationFrame(frame);
    CSS.highlights.delete('ds-title-glow');
  };
  animation.onfinish = clear;
  animation.oncancel = clear;
  frame = requestAnimationFrame(paint);
}

export function usePublicMotion(
  mainRef: RefObject<HTMLElement | null>,
  headerRef: RefObject<HTMLElement | null>,
  footerRef: RefObject<HTMLElement | null>,
  pathname: string,
) {
  useEffect(() => {
    if (!isPublicPath(pathname)) return;
    const main = mainRef.current;
    const header = headerRef.current;
    const footer = footerRef.current;
    if (!main || !header || !footer || !window.matchMedia || !('IntersectionObserver' in window)) return;
    const nav = header.querySelector<HTMLElement>('.ds-nav-links');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const ctaSelector = '[data-public-cta]';
    let pressed: HTMLElement | null = null;
    let pressTimeout: ReturnType<typeof setTimeout> | undefined;
    const clearPress = () => {
      clearTimeout(pressTimeout);
      pressed?.removeAttribute('data-activated');
      pressed = null;
    };
    const activate = (event: Event) => {
      if (event instanceof KeyboardEvent && !['Enter', ' '].includes(event.key)) return;
      const target = event.target instanceof Element
        ? event.target.closest<HTMLElement>(ctaSelector)
        : null;
      if (!target || target.matches(':disabled, [aria-disabled="true"]')) return;
      clearPress();
      pressed = target;
      target.dataset.activated = '';
      pressTimeout = setTimeout(clearPress, 650);
    };
    const halo = main.querySelector<HTMLElement>('.ds-pointer-halo');
    let haloFrame = 0;
    let pointerX = 0;
    let pointerY = 0;
    const hideHalo = () => {
      cancelAnimationFrame(haloFrame);
      haloFrame = 0;
      halo?.removeAttribute('data-visible');
    };
    const moveHalo = (event: PointerEvent) => {
      if (!halo || reduced.matches || !finePointer.matches || event.pointerType === 'touch') return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (haloFrame) return;
      haloFrame = requestAnimationFrame(() => {
        haloFrame = 0;
        halo.style.translate = `${pointerX}px ${pointerY}px`;
        halo.dataset.visible = '';
      });
    };
    const updateNav = (target: Element | null) => {
      const active = target ?? nav?.querySelector('a[aria-current="page"], a.active');
      if (!(active instanceof HTMLElement) || !nav || !active.offsetWidth) {
        nav?.removeAttribute('data-nav-highlight');
        return;
      }
      nav.style.setProperty('--ds-nav-x', `${active.offsetLeft}px`);
      nav.style.setProperty('--ds-nav-width', `${active.offsetWidth}px`);
      nav.dataset.navHighlight = '';
    };
    const resetNav = () => updateNav(null);
    const highlightNav = (event: Event) => {
      if (event.target instanceof Element) updateNav(event.target.closest('.ds-nav-links > a'));
    };
    let button: HTMLElement | null = null;
    const clearButton = () => {
      button?.removeAttribute('data-pointer-shine');
      button = null;
    };
    const shine = (event: PointerEvent) => {
      if (reduced.matches || !finePointer.matches || event.pointerType === 'touch') return;
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>(ctaSelector) : null;
      if (target !== button) clearButton();
      if (!target || target.matches(':disabled')) return;
      button = target;
      const bounds = target.getBoundingClientRect();
      target.style.setProperty('--ds-shine-x', `${event.clientX - bounds.left}px`);
      target.style.setProperty('--ds-shine-y', `${event.clientY - bounds.top}px`);
      target.dataset.pointerShine = '';
    };
    const reduced = window.matchMedia(reducedMotion);
    const animations = new Set<Animation>();
    const title = main.querySelector('.ds-final-cta h2');
    const steps = [...main.querySelectorAll<HTMLElement>('.ds-step-marker > span')];
    const approach = main.querySelector('.ds-approach-v2');
    let frame = 0;

    const fadeBlocks = [
      ...main.querySelectorAll<HTMLElement>(pathname === '/'
        ? '.ds-hero-v3-inner, .ds-services-heading, .ds-services-grid > article, .ds-approach-heading, .ds-steps-grid > article, .ds-final-cta > div'
        : 'section:not(:has(section, .ds-services-grid)), .ds-services-grid > article'),
      ...footer.querySelectorAll<HTMLElement>('.ds-footer-v7-main > div'),
    ];
    const visibleBlocks = new Set<HTMLElement>();
    const fadeObserver = new IntersectionObserver((entries) => {
      for (const { target, isIntersecting } of entries) {
        const block = target as HTMLElement;
        if (isIntersecting) visibleBlocks.add(block);
        else {
          visibleBlocks.delete(block);
          block.style.removeProperty('--ds-viewport-opacity');
        }
      }
      schedule();
    }, { rootMargin: '180px 0px' });

    const titleObserver = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || reduced.matches || !(title instanceof HTMLElement)) return;
      titleObserver.unobserve(title);
      animateTitle(title, animations);
    }, { threshold: 0.35 });

    const clearFade = () => {
      fadeObserver.disconnect();
      visibleBlocks.clear();
      for (const block of fadeBlocks) {
        block.removeAttribute('data-viewport-fade');
        block.style.removeProperty('--ds-viewport-opacity');
      }
    };

    const update = () => {
      frame = 0;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? Math.max(0, Math.min(1, window.scrollY / maxScroll)) : 0;
      header.style.setProperty('--ds-page-progress', String(progress));
      main.style.setProperty('--ds-node-progress', `${progress * 100}%`);
      header.toggleAttribute('data-scrolled', window.scrollY > 24);
      if (reduced.matches) return;

      const viewportBottom = window.innerHeight;
      const viewportTop = Math.max(0, header.getBoundingClientRect().bottom);
      const fadeDepth = Math.min(220, (viewportBottom - viewportTop) * 0.37);
      if (fadeDepth > 0) {
        const opacityUpdates = [...visibleBlocks].map((block) => {
          const { top, bottom, height } = block.getBoundingClientRect();
          const travel = Math.min(height * 0.48, fadeDepth * 0.55);
          const depth = Math.min(fadeDepth, Math.max(100, height * 0.7));
          const entering = (viewportBottom - top - travel * 0.45) / depth;
          const leaving = (bottom - viewportTop - travel) / depth;
          const fraction = Math.min(1, Math.max(0, entering), Math.max(0, leaving));
          const eased = fraction * fraction * (3 - 2 * fraction);
          const minimum = 0.16;
          return { block, opacity: (minimum + (1 - minimum) * eased).toFixed(3) };
        });
        for (const { block, opacity } of opacityUpdates) {
          block.style.setProperty('--ds-viewport-opacity', opacity);
          block.dataset.viewportFade = '';
        }
      }

      if (!approach) return;
      const bounds = approach.getBoundingClientRect();
      const approachProgress = (window.innerHeight * 0.78 - bounds.top) / (bounds.height + window.innerHeight * 0.4);
      steps.forEach((step, index) => {
        const distance = Math.abs(approachProgress - (index + 1) / (steps.length + 1));
        const glow = Math.max(0, 1 - distance * (steps.length + 1));
        step.style.setProperty('--ds-scroll-glow', glow.toFixed(3));
      });
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const refresh = () => {
      clearFade();
      titleObserver.disconnect();
      for (const animation of animations) animation.cancel();
      for (const step of steps) step.style.removeProperty('--ds-scroll-glow');
      clearButton();
      hideHalo();
      if (reduced.matches) return;
      for (const block of fadeBlocks) fadeObserver.observe(block);
      if (title) titleObserver.observe(title);
      schedule();
    };

    const resize = () => {
      resetNav();
      schedule();
    };
    nav?.addEventListener('pointerover', highlightNav);
    nav?.addEventListener('focusin', highlightNav);
    nav?.addEventListener('pointerleave', resetNav);
    nav?.addEventListener('focusout', resetNav);
    document.addEventListener('pointermove', shine, { passive: true });
    document.addEventListener('pointerdown', activate);
    document.addEventListener('keydown', activate);
    main.addEventListener('pointermove', moveHalo, { passive: true });
    main.addEventListener('pointerleave', hideHalo);
    window.addEventListener('blur', hideHalo);
    window.addEventListener('blur', clearButton);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', resize);
    reduced.addEventListener('change', refresh);
    const layoutObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(resize) : null;
    if (nav) layoutObserver?.observe(nav);
    layoutObserver?.observe(main);
    refresh();
    resize();

    return () => {
      clearFade();
      titleObserver.disconnect();
      layoutObserver?.disconnect();
      cancelAnimationFrame(frame);
      for (const animation of animations) animation.cancel();
      for (const step of steps) step.style.removeProperty('--ds-scroll-glow');
      clearButton();
      nav?.removeEventListener('pointerover', highlightNav);
      nav?.removeEventListener('focusin', highlightNav);
      nav?.removeEventListener('pointerleave', resetNav);
      nav?.removeEventListener('focusout', resetNav);
      nav?.removeAttribute('data-nav-highlight');
      header.removeAttribute('data-scrolled');
      header.style.removeProperty('--ds-page-progress');
      main.style.removeProperty('--ds-node-progress');
      hideHalo();
      clearPress();
      document.removeEventListener('pointermove', shine);
      document.removeEventListener('pointerdown', activate);
      document.removeEventListener('keydown', activate);
      main.removeEventListener('pointermove', moveHalo);
      main.removeEventListener('pointerleave', hideHalo);
      window.removeEventListener('blur', hideHalo);
      window.removeEventListener('blur', clearButton);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', resize);
      reduced.removeEventListener('change', refresh);
    };
  }, [mainRef, headerRef, footerRef, pathname]);
}
