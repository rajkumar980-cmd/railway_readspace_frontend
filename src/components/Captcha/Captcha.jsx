import { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import './Captcha.css';

/* ── Helpers ─────────────────────────────────────────────────── */

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';

function randomChar() {
  return CHARS[Math.floor(Math.random() * CHARS.length)];
}

function generateCode(len = 6) {
  return Array.from({ length: len }, randomChar).join('');
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

/* ── Hook ────────────────────────────────────────────────────── */

// eslint-disable-next-line react-refresh/only-export-components
export function useCaptcha() {
  const [code, setCode] = useState(() => generateCode());

  const refresh = useCallback(() => setCode(generateCode()), []);

  const verify = useCallback(
    (input) => input.trim() === code,
    [code],
  );

  return { code, refresh, verify };
}

/* ── Canvas renderer ─────────────────────────────────────────── */

function drawCaptcha(canvas, code) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  // Background
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-surface').trim() || '#ffffff';
  ctx.fillRect(0, 0, W, H);

  // Noise lines
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(rand(0, W), rand(0, H));
    ctx.lineTo(rand(0, W), rand(0, H));
    ctx.strokeStyle = `hsla(${rand(0, 360)},50%,60%,0.45)`;
    ctx.lineWidth = rand(1, 2);
    ctx.stroke();
  }

  // Noise arcs
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.arc(rand(0, W), rand(0, H), rand(20, 50), 0, Math.PI * 2);
    ctx.strokeStyle = `hsla(${rand(0, 360)},40%,70%,0.25)`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Noise dots
  for (let i = 0; i < 40; i++) {
    ctx.beginPath();
    ctx.arc(rand(0, W), rand(0, H), rand(0.5, 1.5), 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${rand(0, 360)},40%,50%,0.4)`;
    ctx.fill();
  }

  // Characters
  const charW = W / (code.length + 1);
  ctx.textBaseline = 'middle';

  code.split('').forEach((ch, i) => {
    const x = charW * (i + 0.8) + rand(-4, 4);
    const y = H / 2 + rand(-6, 6);
    const angle = rand(-0.3, 0.3);
    const size = Math.floor(rand(20, 26));

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.font = `${rand(0, 1) > 0.5 ? 'bold' : '600'} ${size}px 'Inter', monospace`;
    ctx.fillStyle = `hsl(${rand(200, 260)},${rand(50, 80)}%,${rand(25, 45)}%)`;

    // Slight shadow for depth
    ctx.shadowColor = 'rgba(0,0,0,0.15)';
    ctx.shadowBlur = 2;

    ctx.fillText(ch, 0, 0);
    ctx.restore();
  });
}

/* ── Component ───────────────────────────────────────────────── */

/**
 * @param {object}   props
 * @param {string}   props.code      - Current CAPTCHA code (from useCaptcha)
 * @param {Function} props.onRefresh - Called when user clicks refresh
 * @param {string}   props.value     - Controlled input value
 * @param {Function} props.onChange  - Called with new input string
 * @param {string}   [props.error]   - Error message to display
 */
export default function Captcha({ code, onRefresh, value, onChange, error }) {
  const canvasRef = useRef(null);

  // Redraw whenever code changes
  useEffect(() => {
    drawCaptcha(canvasRef.current, code);
  }, [code]);

  // Also redraw on theme change (data-theme attribute flip)
  useEffect(() => {
    const observer = new MutationObserver(() => {
      drawCaptcha(canvasRef.current, code);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, [code]);

  return (
    <div className="captcha">
      <label className="captcha__label">Verification Code</label>

      <div className="captcha__canvas-row">
        <canvas
          ref={canvasRef}
          className="captcha__canvas"
          width={200}
          height={56}
          aria-label="CAPTCHA image — type the characters shown"
        />
        <button
          type="button"
          className="captcha__refresh"
          onClick={onRefresh}
          aria-label="Refresh CAPTCHA"
          title="New code"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <input
        type="text"
        className={`form-input captcha__input${error ? ' form-input--error' : ''}`}
        placeholder="Enter the characters above…"
        value={value}
        onChange={e => onChange(e.target.value)}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        maxLength={8}
        aria-label="CAPTCHA input"
        aria-invalid={!!error}
      />

      {error && <span className="form-error captcha__error">{error}</span>}
    </div>
  );
}
