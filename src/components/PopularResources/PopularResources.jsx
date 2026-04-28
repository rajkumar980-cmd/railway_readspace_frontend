import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, ArrowRight } from 'lucide-react';
import ResourceCard from '../ResourceCard/ResourceCard';
import PreviewModal from '../PreviewModal/PreviewModal';
import FeedbackForm from '../FeedbackForm/FeedbackForm';
import { useResources } from '../../context/ResourceContext';
import './PopularResources.css';

export default function PopularResources() {
  const { resources: RESOURCES } = useResources();
  const POPULAR = useMemo(() => {
    return [...RESOURCES]
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, 6);
  }, [RESOURCES]);
  const navigate = useNavigate();
  const [previewResource, setPreviewResource] = useState(null);
  const [feedbackResource, setFeedbackResource] = useState(null);

  return (
    <section className="popular-resources">
      <div className="popular-resources__header">
        <div>
          <span className="popular-resources__eyebrow"><Flame size={14} aria-hidden="true" style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} />Community Favourites</span>
          <h2 className="popular-resources__title">Popular Resources</h2>
          <p className="popular-resources__sub">
            Ranked by total downloads — the resources your peers trust most.
          </p>
        </div>
        <button
          className="btn btn--outline btn--sm popular-resources__view-all"
          onClick={() => navigate('/popular')}
        >
          See full ranking <ArrowRight size={14} aria-hidden="true" />
        </button>
      </div>

      <div className="popular-resources__grid">
        {POPULAR.map((r, i) => (
          <div key={r.id} className="popular-resources__item">
            {/* Rank badge */}
            <div
              className={`popular-resources__rank popular-resources__rank--${i < 3 ? i + 1 : 'other'}`}
              aria-label={`Rank ${i + 1}`}
            >
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
            </div>
            <ResourceCard
              resource={r}
              onPreview={setPreviewResource}
              onFeedback={setFeedbackResource}
            />
          </div>
        ))}
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
