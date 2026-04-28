/**
 * PageTransition — Framer Motion route-entry/exit animation wrapper.
 *
 * Enter : fade in + translateY 14px → 0, 480ms ease-out
 * Exit  : fade out + translateY 0 → -8px, 200ms ease-in
 *
 * Respects prefers-reduced-motion via Framer Motion's built-in
 * reduced-motion detection (useReducedMotion hook internally).
 *
 * Props:
 *   children  {node}   – page content
 *   className {string} – extra class names
 */
import { motion as Motion, useReducedMotion } from 'framer-motion';

const VARIANTS = {
  initial: { opacity: 0, y: 14 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.48, ease: [0.22, 0.61, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

/** Reduced-motion variant: instant mount/unmount, no transform */
const REDUCED_VARIANTS = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.15 } },
  exit:    { opacity: 0, transition: { duration: 0.1 } },
};

export default function PageTransition({ children, className = '' }) {
  const prefersReduced = useReducedMotion();
  const variants = prefersReduced ? REDUCED_VARIANTS : VARIANTS;

  return (
    <Motion.div
      className={['page-transition', className].filter(Boolean).join(' ')}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ isolation: 'isolate' }}
    >
      {children}
    </Motion.div>
  );
}
