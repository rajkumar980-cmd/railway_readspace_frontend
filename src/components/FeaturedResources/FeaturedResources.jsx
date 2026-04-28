import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ArrowRight } from 'lucide-react';
import ResourceCard from '../ResourceCard/ResourceCard';
import PreviewModal from '../PreviewModal/PreviewModal';
import FeedbackForm from '../FeedbackForm/FeedbackForm';
import ScrollReveal from '../motion/ScrollReveal';
import { useResources } from '../../context/ResourceContext';
import './FeaturedResources.css';

export default function FeaturedResources() {
  const { resources: RESOURCES } = useResources();
  const FEATURED = useMemo(() => RESOURCES.filter(r => r.featured).slice(0, 6), [RESOURCES]);
  const navigate = useNavigate();
  const [previewResource, setPreviewResource] = useState(null);
  const [feedbackResource, setFeedbackResource] = useState(null);

  return (
    <section className="featured-resources">
      <div className="container">
        {/* Section header */}
        <ScrollReveal variant="fade-up">
          <div className="featured-resources__header">
            <div>
              <span className="featured-resources__eyebrow"><Star size={14} fill="currentColor" aria-hidden="true" style={{ verticalAlign: 'middle', marginRight: '0.25rem', color: '#f59e0b' }} />Curated for You</span>
              <h2 className="featured-resources__title">Featured Resources</h2>
              <p className="featured-resources__sub">
                Hand-picked by our editorial team — the most impactful materials in every category.
              </p>
            </div>
            <button
              className="btn btn--outline btn--sm featured-resources__view-all"
              onClick={() => navigate('/home')}
            >
              View all <ArrowRight size={14} aria-hidden="true" />
            </button>
          </div>
        </ScrollReveal>

        {/* Card grid */}
        <ScrollReveal variant="fade-up" delay={80}>
          <div className="featured-resources__grid">
            {FEATURED.map(r => (
              <ResourceCard
                key={r.id}
                resource={r}
                onPreview={setPreviewResource}
                onFeedback={setFeedbackResource}
              />
            ))}
          </div>
        </ScrollReveal>
      </div>

      {previewResource && (
        <PreviewModal resource={previewResource} onClose={() => setPreviewResource(null)} />
      )}
      {feedbackResource && (
        <FeedbackForm resource={feedbackResource} onClose={() => setFeedbackResource(null)} />
      )}
    </section>
  );
}
