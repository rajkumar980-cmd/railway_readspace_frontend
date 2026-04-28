import { Layers, BookOpen, Microscope, BookMarked, GraduationCap } from 'lucide-react';
import './CategoryFilter.css';
import { CATEGORIES } from '../../data/mockData';

const ICON_MAP = {
  all:       <Layers        size={16} strokeWidth={1.75} aria-hidden="true" />,
  textbooks: <BookOpen      size={16} strokeWidth={1.75} aria-hidden="true" />,
  research:  <Microscope    size={16} strokeWidth={1.75} aria-hidden="true" />,
  guides:    <BookMarked    size={16} strokeWidth={1.75} aria-hidden="true" />,
  tutorials: <GraduationCap size={16} strokeWidth={1.75} aria-hidden="true" />,
};

export default function CategoryFilter({ active, onSelect }) {
  return (
    <div className="cat-filter" role="list" aria-label="Category filters">
      {CATEGORIES.map(cat => (
        <button
          key={cat.id}
          role="listitem"
          className={`cat-filter__btn${active === cat.id ? ' active' : ''}`}
          onClick={() => onSelect(cat.id)}
          aria-pressed={active === cat.id}
        >
          <span className="cat-filter__icon">{ICON_MAP[cat.id]}</span>
          <span>{cat.label}</span>
        </button>
      ))}
    </div>
  );
}
