import { useEffect, useRef } from 'react';
import { reducedMotion } from './usePublicMotion';

export function HeroSignal() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const hero = canvas?.parentElement;
    if (!canvas || !hero || !window.matchMedia || !('ResizeObserver' in window)) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const reduced = window.matchMedia(reducedMotion);
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = true;
    let pointer: { x: number; y: number } | null = null;
    const particles = Array.from({ length: 1900 }, (_, index) => ({
      start: (index + Math.random()) / 1900,
      angle: Math.random() * 2 * Math.PI,
      lane: (index % 18) * Math.PI / 9 + (Math.random() - 0.5) * 0.13,
      speed: 0.035 + Math.random() * 0.07,
      scatter: 0.12 + Math.random() * 0.88,
      size: 0.45 + Math.random() * 0.85,
    }));

    function draw(time: number) {
      if (!context || !width || !height) return;
      const mobile = width < 701;
      const count = mobile ? 850 : particles.length;
      const focus = mobile ? 0.67 : 0.61;
      const end = mobile ? 0.98 : 0.975;
      const center = height * (mobile ? 0.73 : 0.55);
      context.clearRect(0, 0, width, height);
      context.fillStyle = '#80c8ff';

      for (let index = 0; index < count; index += 1) {
        const particle = particles[index];
        const phase = (particle.start * particles.length / count + time * particle.speed) % 1;
        const bulb = phase >= 0.61 && phase <= 0.95;
        const along = bulb ? (phase - 0.61) / 0.34 : 0;
        const distance = phase < 0.61 ? 1 - phase / 0.61 : (phase - 0.95) / 0.05;
        const radius = bulb
          ? Math.pow(Math.sin(along * Math.PI), 0.85) * Math.min(height * 0.24, width * 0.13)
          : Math.max(0, distance) ** 1.3 * height * 0.59 * particle.scatter;
        const angle = bulb ? particle.lane + time * 0.24 + along * 0.35 : particle.angle;
        const depth = (Math.cos(angle) + 1) / 2;
        const position = bulb ? focus + along * (end - focus)
          : phase < 0.61 ? -0.08 + phase / 0.61 * (focus + 0.08)
          : end + distance * 0.07;
        let x = position * width;
        let y = center + Math.sin(angle) * radius;

        if (mobile) {
          x = width * (0.53 + 0.3 * (position - 0.5)) + Math.sin(angle) * radius;
          y = height * (1 - position * 0.81) + Math.cos(angle) * radius * 0.22;
        }

        let influence = 0;
        if (pointer) {
          const dx = pointer.x - x;
          const dy = pointer.y - y;
          influence = Math.max(0, 1 - Math.hypot(dx, dy) / 195) ** 2;
          if (!bulb) {
            x += dx * influence * 0.69;
            y += dy * influence * 0.69;
          }
        }

        context.globalAlpha = Math.min(1, (bulb ? 0.32 : 0.14) + depth * 0.38 + influence * 0.62);
        context.beginPath();
        context.arc(x, y, particle.size + influence * 0.6, 0, Math.PI * 2);
        context.fill();
      }
    }

    function tick(now: number) {
      draw(now / 1000);
      frame = requestAnimationFrame(tick);
    }

    function sync() {
      cancelAnimationFrame(frame);
      if (visible && !document.hidden && !reduced.matches) {
        frame = requestAnimationFrame(tick);
      } else if (reduced.matches) {
        context?.clearRect(0, 0, width, height);
      }
    }

    const resize = new ResizeObserver(() => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      const scale = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = width * scale;
      canvas.height = height * scale;
      context.setTransform(scale, 0, 0, scale, 0, 0);
      sync();
    });
    const visibility = typeof IntersectionObserver === 'function'
      ? new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); })
      : null;

    const move = (event: PointerEvent) => {
      if (reduced.matches || !finePointer.matches || event.pointerType === 'touch' || !width || !height) return;
      const bounds = canvas.getBoundingClientRect();
      pointer = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    };
    const reset = () => { pointer = null; };
    const updatePreference = () => {
      reset();
      sync();
    };

    resize.observe(canvas);
    visibility?.observe(canvas);
    hero.addEventListener('pointermove', move, { passive: true });
    hero.addEventListener('pointerleave', reset);
    reduced.addEventListener('change', updatePreference);
    document.addEventListener('visibilitychange', sync);

    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      visibility?.disconnect();
      hero.removeEventListener('pointermove', move);
      hero.removeEventListener('pointerleave', reset);
      reduced.removeEventListener('change', updatePreference);
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);

  return <canvas ref={canvasRef} className="ds-hero-signal" aria-hidden="true" />;
}
