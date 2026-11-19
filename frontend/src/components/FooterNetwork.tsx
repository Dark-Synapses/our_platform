import { useEffect, useRef } from 'react';
import { reducedMotion } from './usePublicMotion';

const tracks = [
  { color: '88,169,233', height: 0.22, bend: 0.11, offset: 0 },
  { color: '115,186,242', height: 0.4, bend: 0.17, offset: 0.29 },
  { color: '130,193,249', height: 0.58, bend: 0.19, offset: 0.57 },
  { color: '72,148,212', height: 0.75, bend: 0.14, offset: 0.81 },
];

export function FooterNetwork() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !host || !ctx || !window.ResizeObserver || !window.IntersectionObserver) return;

    const reduced = window.matchMedia(reducedMotion);
    let width = 0;
    let height = 0;
    let visible = false;
    let frame = 0;

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      const segments = width < 700 ? 38 : 74;
      for (const track of tracks) {
        const trackY = (progress: number) =>
          height * (track.height + Math.sin(progress * 5.6 + track.offset * 2) * track.bend);
        ctx.strokeStyle = `rgba(${track.color}, 0.2)`;
        ctx.beginPath();
        for (let index = 0; index <= segments; index += 1) {
          const progress = index / segments;
          ctx.lineTo(progress * width, trackY(progress));
        }
        ctx.stroke();
        const pulse = (time / 5500 + track.offset) % 1;
        for (let index = 0; index <= segments; index += 1) {
          const progress = index / segments;
          const x = progress * width;
          const y = trackY(progress);
          const distance = Math.min(Math.abs(pulse - progress), 1 - Math.abs(pulse - progress));
          const glow = reduced.matches ? 0 : Math.max(0, 1 - distance / 0.12) ** 2;
          const node = index % 9 === 0;
          ctx.fillStyle = `rgba(${track.color}, ${(node ? 0.38 : 0.19) + glow * 0.59})`;
          ctx.beginPath();
          ctx.arc(x, y, (node ? 1.9 : 1.15) + glow * 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };
    const tick = (time: number) => {
      draw(time);
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      if (visible && !document.hidden && !reduced.matches) frame = requestAnimationFrame(tick);
      else if (reduced.matches) draw(0);
    };
    const resize = new ResizeObserver(() => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      const scale = Math.min(devicePixelRatio, 1.5);
      canvas.width = width * scale;
      canvas.height = height * scale;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      sync();
    });
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    resize.observe(canvas);
    intersection.observe(host);
    reduced.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);

    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      intersection.disconnect();
      document.removeEventListener('visibilitychange', sync);
      reduced.removeEventListener('change', sync);
    };
  }, []);

  return <canvas className="ds-footer-network" ref={ref} aria-hidden="true" />;
}
