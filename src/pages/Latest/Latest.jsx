import { useState, useMemo } from 'react';
import { Sparkles, Plus } from 'lucide-react';
import ResourceCard from '../../components/ResourceCard/ResourceCard';
import PreviewModal from '../../components/PreviewModal/PreviewModal';
import FeedbackForm from '../../components/FeedbackForm/FeedbackForm';
import { useResources } from '../../context/ResourceContext';
import './Latest.css';


export default function Latest() {
  const { resources: RESOURCES } = useResources();
  const latestResources = useMemo(() => RESOURCES.filter(r => r.latest).sort((a, b) => b.year - a.year), [RESOURCES]);
  const allByYear = useMemo(() => [...RESOURCES].sort((a, b) => b.year - a.year), [RESOURCES]);

  const [previewResource, setPreviewResource] = useState(null);
  const [feedbackResource, setFeedbackResource] = useState(null);

  return (
    <main>
      <section className="page-hero page-hero--green">
        <div className="container">
          <h1 className="page-hero__title"><Sparkles size={26} aria-hidden="true" style={{ verticalAlign: 'middle', marginRight: '0.4rem' }} />Latest Additions</h1>
          <p className="page-hero__sub">Freshly added resources — curated and ready to download.</p>
        </div>
      </section>

      {/* Newest highlights */}
      <section className="latest__highlights">
        <div className="container">
          <h2 className="section-title"><Plus size={18} aria-hidden="true" style={{ verticalAlign: 'middle', marginRight: '0.3rem', color: 'var(--color-primary)' }} />New This Month<span className="section-count">{latestResources.length}</span></h2>
          <div className="resource-grid" style={{ marginTop: '1.25rem' }}>
            {latestResources.map(r => (
              <ResourceCard key={r.id} resource={r} onPreview={setPreviewResource} onFeedback={setFeedbackResource} />
            ))}
          </div>
        </div>
      </section>

      {/* All sorted by year */}
      <section className="latest__all">
        <div className="container">
          <h2 className="section-title">All Resources by Year<span className="section-count">{allByYear.length}</span></h2>
          <div className="resource-grid">
            {allByYear.map(r => (
              <ResourceCard key={r.id} resource={r} onPreview={setPreviewResource} onFeedback={setFeedbackResource} />
            ))}
          </div>
        </div>
      </section>

      {previewResource && <PreviewModal resource={previewResource} onClose={() => setPreviewResource(null)} />}
      {feedbackResource && <FeedbackForm resource={feedbackResource} onClose={() => setFeedbackResource(null)} />}
    </main>
  );
}
