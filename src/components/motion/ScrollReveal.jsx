import { useRef, useEffect, useState } from 'react';
import './ScrollReveal.css';

/**
 * Scroll-driven reveal wrapper using IntersectionObserver.
 * Degrades gracefully when prefers-reduced-motion is set.
 *
 * Props:
 *   variant   – 'fade-up' | 'fade-in'  (default: 'fade-up')
 *   delay     – transition delay in ms   (default: 0)
 *   threshold – IO threshold 0–1         (default: 0.12)
 *   rootMargin – IO rootMargin           (default: '0px 0px -48px 0px')
 *   once      – unobserve after reveal   (default: true)
 *   className – extra class on wrapper
 */

// Detect reduced-motion once at module level (safe in Vite SPA)
const PREFERS_REDUCED_MOTION =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function ScrollReveal({
  children,
  variant = 'fade-up',
  delay = 0,
  threshold = 0.12,
  rootMargin = '0px 0px -48px 0px',
  once = true,
  className = '',
}) {
  const ref = useRef(null);
  // If reduced motion is preferred, start visible immediately (no setState in effect)
  const [visible, setVisible] = useState(PREFERS_REDUCED_MOTION);

  useEffect(() => {
    // Reduced-motion users already start in visible state – skip observer
    if (PREFERS_REDUCED_MOTION) return;

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  const cls = [
    'sr-reveal',
    `sr-reveal--${variant}`,
    visible ? 'sr-reveal--visible' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={ref}
      className={cls}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
