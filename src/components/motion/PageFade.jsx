/**
 * PageFade — lightweight CSS-keyframe page-entry animation.
 *
 * Wraps page content with a subtle fade + translateY on mount.
 * Respects prefers-reduced-motion via CSS @media query.
 *
 * Props:
 *   className {string} – extra class names
 *   children  {node}   – page content
 */
import './PageFade.css';

export default function PageFade({ children, className = '' }) {
  return (
    <div className={['page-fade', className].filter(Boolean).join(' ')}>
      {children}
    </div>
  );
}
