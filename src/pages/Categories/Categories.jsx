import { useState, useMemo } from 'react';
import { Layers, BookOpen, Microscope, BookMarked, GraduationCap, Inbox } from 'lucide-react';
import CategoryFilter from '../../components/CategoryFilter/CategoryFilter';
import SearchBar from '../../components/SearchBar/SearchBar';
import ResourceCard from '../../components/ResourceCard/ResourceCard';
import PreviewModal from '../../components/PreviewModal/PreviewModal';
import FeedbackForm from '../../components/FeedbackForm/FeedbackForm';
import { CATEGORIES } from '../../data/mockData';
import { useResources } from '../../context/ResourceContext';
import './Categories.css';

const CAT_ICONS = {
  all:       <Layers        size={28} strokeWidth={1.75} aria-hidden="true" />,
  textbooks: <BookOpen      size={28} strokeWidth={1.75} aria-hidden="true" />,
  research:  <Microscope    size={28} strokeWidth={1.75} aria-hidden="true" />,
  guides:    <BookMarked    size={28} strokeWidth={1.75} aria-hidden="true" />,
  tutorials: <GraduationCap size={28} strokeWidth={1.75} aria-hidden="true" />,
};

export default function Categories() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [previewResource, setPreviewResource] = useState(null);
  const [feedbackResource, setFeedbackResource] = useState(null);
  const { resources: RESOURCES } = useResources();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return RESOURCES.filter(r => {
      const matchCat = category === 'all' || r.category === category;
      const matchQ = !q || r.title.toLowerCase().includes(q) || r.author.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [search, category]);

  const activeCat = CATEGORIES.find(c => c.id === category);

  return (
    <main>
      {/* Page hero */}
      <section className="page-hero">
        <div className="container">
          <h1 className="page-hero__title"><Layers size={26} aria-hidden="true" style={{ verticalAlign: 'middle', marginRight: '0.4rem' }} />Browse Categories</h1>
          <p className="page-hero__sub">Filter and discover resources by subject area.</p>
        </div>
      </section>

      {/* Category cards overview */}
      <section className="cat-overview">
        <div className="container">
          <div className="cat-overview__grid">
            {CATEGORIES.filter(c => c.id !== 'all').map(cat => {
              const count = RESOURCES.filter(r => r.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  className={`cat-card${category === cat.id ? ' active' : ''}`}
                  onClick={() => setCategory(cat.id)}
                >
                  <span className="cat-card__icon">{CAT_ICONS[cat.id]}</span>
                  <span className="cat-card__label">{cat.label}</span>
                  <span className="cat-card__count">{count} items</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Filtered results */}
      <section className="categories__results">
        <div className="container">
          <div className="categories__toolbar">
            <h2 className="section-title">
              <span className="section-title__icon">{CAT_ICONS[category] ?? CAT_ICONS.all}</span>
              {activeCat?.label || 'All'}
              <span className="section-count">{filtered.length}</span>
            </h2>
            <SearchBar value={search} onChange={setSearch} placeholder="Filter results…" />
            <CategoryFilter active={category} onSelect={setCategory} />
          </div>

          {filtered.length > 0 ? (
            <div className="resource-grid">
              {filtered.map(r => (
                <ResourceCard key={r.id} resource={r} onPreview={setPreviewResource} onFeedback={setFeedbackResource} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state__icon"><Inbox size={36} strokeWidth={1.5} aria-hidden="true" /></div>
              <h3>No resources in this category yet</h3>
              <button className="btn btn--primary" onClick={() => { setSearch(''); setCategory('all'); }}>View all</button>
            </div>
          )}
        </div>
      </section>

      {previewResource && <PreviewModal resource={previewResource} onClose={() => setPreviewResource(null)} />}
      {feedbackResource && <FeedbackForm resource={feedbackResource} onClose={() => setFeedbackResource(null)} />}
    </main>
  );
}
