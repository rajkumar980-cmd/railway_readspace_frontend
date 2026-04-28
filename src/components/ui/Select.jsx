/**
 * Select.jsx — Custom accessible dropdown for ReadSpace Admin
 * Replaces all native <select> elements for a consistent SaaS look.
 *
 * Props:
 *   value        {string}              – currently selected value
 *   onChange     {(value: string)=>void} – called with the new value
 *   options      {Array<{value, label}>} – dropdown items
 *   label        {string}              – aria-label for the trigger button
 *   LeadIcon     {React component}     – optional lucide icon before the label
 *   size         {'sm'|'md'}           – 'sm' = compact, 'md' = default
 *   compact      {boolean}             – tighter pill style (date range usage)
 *   className    {string}              – extra class on root element
 *   menuPlacement {'down'|'up'}        – where to open the menu
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import './ui.css';

export default function Select({
  value,
  onChange,
  options = [],
  label = 'Select',
  LeadIcon,
  size = 'md',
  compact = false,
  className = '',
  menuPlacement = 'down',
}) {
  const [open, setOpen] = useState(false);
  const [focusedIdx, setFocusedIdx] = useState(-1);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const selectedOption = options.find(o => o.value === value) ?? options[0];

  /* ── Close on outside click ── */
  useEffect(() => {
    if (!open) return;
    function onMouseDown(e) {
      if (
        !triggerRef.current?.contains(e.target) &&
        !menuRef.current?.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [open]);

  /* ── Focus the highlighted item when index changes ── */
  useEffect(() => {
    if (!open || focusedIdx < 0) return;
    menuRef.current?.querySelector(`[data-idx="${focusedIdx}"]`)?.focus();
  }, [open, focusedIdx]);

  const openMenu = useCallback(() => {
    setOpen(true);
    const idx = options.findIndex(o => o.value === value);
    setFocusedIdx(idx >= 0 ? idx : 0);
  }, [options, value]);

  const closeMenu = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  const select = useCallback((val) => {
    onChange(val);
    setOpen(false);
    triggerRef.current?.focus();
  }, [onChange]);

  /* ── Keyboard handler on trigger ── */
  function onTriggerKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault();
      openMenu();
    }
  }

  /* ── Keyboard handler on menu items ── */
  function onItemKeyDown(e, idx) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setFocusedIdx(Math.min(idx + 1, options.length - 1)); }
    else if (e.key === 'ArrowUp')  { e.preventDefault(); setFocusedIdx(Math.max(idx - 1, 0)); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(options[idx].value); }
    else if (e.key === 'Escape' || e.key === 'Tab') { e.preventDefault(); closeMenu(); }
  }

  const rootClass = [
    'ui-select',
    `ui-select--${size}`,
    compact && 'ui-select--compact',
    open && 'ui-select--open',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={rootClass}>
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        className="ui-select__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => open ? closeMenu() : openMenu()}
        onKeyDown={onTriggerKeyDown}
      >
        {LeadIcon && <LeadIcon size={size === 'sm' ? 12 : 14} strokeWidth={2} className="ui-select__lead-icon" />}
        <span className="ui-select__value">{selectedOption?.label ?? '—'}</span>
        <ChevronDown
          size={size === 'sm' ? 12 : 14}
          strokeWidth={2.5}
          className="ui-select__chevron"
          aria-hidden="true"
        />
      </button>

      {/* Menu */}
      {open && (
        <ul
          ref={menuRef}
          role="listbox"
          aria-label={label}
          className={`ui-select__menu ui-select__menu--${menuPlacement}`}
        >
          {options.map((opt, idx) => {
            const isSelected = opt.value === value;
            const isFocused  = idx === focusedIdx;
            return (
              <li
                key={opt.value}
                role="option"
                data-idx={idx}
                tabIndex={isFocused ? 0 : -1}
                aria-selected={isSelected}
                className={[
                  'ui-select__option',
                  isSelected && 'ui-select__option--selected',
                  isFocused  && 'ui-select__option--focused',
                ].filter(Boolean).join(' ')}
                onMouseEnter={() => setFocusedIdx(idx)}
                onMouseDown={(e) => { e.preventDefault(); select(opt.value); }}
                onKeyDown={(e) => onItemKeyDown(e, idx)}
              >
                {opt.label}
                {isSelected && (
                  <span className="ui-select__tick" aria-hidden="true">✓</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
