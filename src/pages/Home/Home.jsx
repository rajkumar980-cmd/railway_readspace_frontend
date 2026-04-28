import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import SearchBar from '../../components/SearchBar/SearchBar';
import CategoryFilter from '../../components/CategoryFilter/CategoryFilter';
import ResourceCard from '../../components/ResourceCard/ResourceCard';
import PreviewModal from '../../components/PreviewModal/PreviewModal';
import FeedbackForm from '../../components/FeedbackForm/FeedbackForm';
import PopularResources from '../../components/PopularResources/PopularResources';
import FeaturedResources from '../../components/FeaturedResources/FeaturedResources';
import ScrollReveal from '../../components/motion/ScrollReveal';
import { useResources } from '../../context/ResourceContext';
import './Home.css';

export default function Home() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [previewResource, setPreviewResource] = useState(null);
  const [feedbackResource, setFeedbackResource] = useState(null);
  const { resources: RESOURCES, loading } = useResources();

  const filtered = useMemo(() => {
    return RESOURCES.filter(r => {
      const matchCat = category === 'all' || r.category === category;
      const q = search.toLowerCase();
      const matchSearch = !q || r.title.toLowerCase().includes(q) || r.author.toLowerCase().includes(q) || r.tags.some(t => t.includes(q));
      return matchCat && matchSearch;
    });
  }, [search, category, RESOURCES]);

  return (
    <main className="home">
      {/* ── Prominent Search Header ── */}
      <section className="home__search-header">
        <div className="container">
          <h1 className="home__search-title">Browse the Library</h1>
          <p className="home__search-sub">
            Search by title, author or topic — then filter by category.
          </p>
          <div className="home__search-bar-wrap">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search by title, author or tag…"
              showFilter
              onFilter={() => {}}
            />
          </div>
          <div className="home__chips-wrap">
            <CategoryFilter active={category} onSelect={setCategory} />
          </div>
        </div>
      </section>

      {/* ── Featured Resources (only when not actively filtering) ── */}
      {!search && category === 'all' && (
        <ScrollReveal variant="fade-up">
          <FeaturedResources />
        </ScrollReveal>
      )}

      {/* ── Popular Resources (only when not actively filtering) ── */}
      {!search && category === 'all' && (
        <ScrollReveal variant="fade-up" delay={60}>
          <section className="home__popular-wrap">
            <div className="container">
              <PopularResources />
            </div>
          </section>
        </ScrollReveal>
      )}

      {/* ── Resource Grid ── */}
      <ScrollReveal variant="fade-up" delay={80}>
        <section className="home__grid-section">
        <div className="container">
          <div className="home__grid-header">
            <h2 className="section-title">
              {category === 'all'
                ? 'All Resources'
                : `${RESOURCES.find(r => r.category === category)?.categoryLabel || category}s`}
              <span className="section-count">{filtered.length} found</span>
            </h2>
            {search && (
              <button
                className="home__clear-btn"
                onClick={() => { setSearch(''); setCategory('all'); }}
              >
                ✕ Clear filters
              </button>
            )}
          </div>

          {filtered.length > 0 ? (
            <div className="resource-grid">
              {filtered.map(r => (
                <ResourceCard
                  key={r.id}
                  resource={r}
                  onPreview={setPreviewResource}
                  onFeedback={setFeedbackResource}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state__icon"><Search size={36} strokeWidth={1.5} aria-hidden="true" /></div>
              <h3>No resources found</h3>
              <p>Try a different search term or browse all categories.</p>
              <button className="btn btn--primary" onClick={() => { setSearch(''); setCategory('all'); }}>
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>
      </ScrollReveal>

      {previewResource && (
        <PreviewModal resource={previewResource} onClose={() => setPreviewResource(null)} />
      )}
      {feedbackResource && (
        <FeedbackForm resource={feedbackResource} onClose={() => setFeedbackResource(null)} />
      )}
    </main>
  );
}
