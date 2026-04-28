import { useState } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import './SearchBar.css';

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search resources…',
  showFilter = false,
  onFilter,
  filterActive = false,
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className={`search-bar${focused ? ' search-bar--focused' : ''}${showFilter ? ' search-bar--pill' : ''}`}>
      <span className="search-bar__icon" aria-hidden>
        <Search size={18} strokeWidth={2.2} />
      </span>

      <input
        type="search"
        className="search-bar__input"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-label="Search resources"
      />

      {/* Clear button — shown only when there is text */}
      {value && (
        <button
          className="search-bar__clear"
          onClick={() => onChange('')}
          aria-label="Clear search"
        >
          <X size={14} strokeWidth={2.5} aria-hidden="true" />
        </button>
      )}

      {/* Filter button — only shown when showFilter=true */}
      {showFilter && (
        <button
          className={`search-bar__filter-btn${filterActive ? ' active' : ''}`}
          onClick={onFilter}
          type="button"
          aria-label="Toggle filters"
        >
          <SlidersHorizontal size={14} strokeWidth={2.2} aria-hidden="true" />
          Filter
        </button>
      )}
    </div>
  );
}
