/**
 * BrandLogo — Single source of truth for ReadSpace branding.
 *
 * Props:
 *   size     {'sm'|'md'|'lg'}   – scales the icon + text  (default 'md')
 *   variant  {'auto'|'sidebar'} – 'sidebar' forces white-on-dark palette
 *   className {string}          – extra class on root element
 *
 * Usage:
 *   <BrandLogo />                  → auto-theme, medium
 *   <BrandLogo size="lg" />        → auth card hero
 *   <BrandLogo variant="sidebar"/> → always-dark admin sidebar
 */
import './BrandLogo.css';

const SIZES = {
  sm: { icon: 18, font: '0.92rem', gap: '0.4rem' },
  md: { icon: 24, font: '1.1rem',  gap: '0.5rem' },
  lg: { icon: 36, font: '1.5rem',  gap: '0.65rem' },
};

/* Filled open-book — matches the screenshot logo style */
function BookMark({ size, color }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {/* Left page — filled */}
      <path
        d="M2 6.5C2 5.4 2.9 4.5 4 4.5H11C11.6 4.5 12 4.9 12 5.5V19C12 19 9 18 6 18.5C4 18.8 2 17.5 2 17V6.5Z"
        fill={color}
        opacity="0.85"
      />
      {/* Right page — filled, slightly lighter */}
      <path
        d="M22 6.5C22 5.4 21.1 4.5 20 4.5H13C12.4 4.5 12 4.9 12 5.5V19C12 19 15 18 18 18.5C20 18.8 22 17.5 22 17V6.5Z"
        fill={color}
        opacity="0.65"
      />
      {/* Spine highlight */}
      <line x1="12" y1="5" x2="12" y2="19" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

export default function BrandLogo({ size = 'md', variant = 'auto', className = '' }) {
  const s = SIZES[size] ?? SIZES.md;
  const isSidebar = variant === 'sidebar';

  return (
    <div
      className={[
        'brand-logo',
        `brand-logo--${size}`,
        isSidebar && 'brand-logo--sidebar',
        className,
      ].filter(Boolean).join(' ')}
      style={{ gap: s.gap }}
      aria-label="ReadSpace"
    >
      <BookMark
        size={s.icon}
        color={isSidebar ? '#93c5fd' : 'var(--color-primary)'}
      />
      <span className="brand-logo__wordmark" style={{ fontSize: s.font }}>
        Read<strong>Space</strong>
      </span>
    </div>
  );
}
