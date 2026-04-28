import { useState, useMemo } from 'react';
import { TrendingUp, Trophy, Award, Download, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import ResourceCard from '../../components/ResourceCard/ResourceCard';
import PreviewModal from '../../components/PreviewModal/PreviewModal';
import FeedbackForm from '../../components/FeedbackForm/FeedbackForm';
import { useResources } from '../../context/ResourceContext';
import './Popular.css';


export default function Popular() {
  const { resources: RESOURCES } = useResources();
  const sorted = useMemo(() => [...RESOURCES].sort((a, b) => b.downloads - a.downloads), [RESOURCES]);

  const [previewResource, setPreviewResource] = useState(null);
  const [feedbackResource, setFeedbackResource] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const handleTopDownload = (r) => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    alert('Download started! (mock)');
  };

  return (
    <main>
      <section className="page-hero page-hero--fire">
        <div className="container">
          <h1 className="page-hero__title"><TrendingUp size={28} aria-hidden="true" style={{ verticalAlign: 'middle', marginRight: '0.4rem' }} />Most Popular Resources</h1>
          <p className="page-hero__sub">Ranked by total community downloads.</p>
        </div>
      </section>

      {/* Top 3 spotlight */}
      <section className="popular__spotlight">
        <div className="container">
          <h2 className="section-title"><Trophy size={20} aria-hidden="true" style={{ verticalAlign: 'middle', marginRight: '0.4rem', color: '#f59e0b' }} />Top Picks</h2>
          <div className="popular__podium">
            {sorted.slice(0, 3).map((r, i) => (
              <div key={r.id} className={`popular__podium-item popular__podium-item--${i + 1}`}>
                <span className="popular__rank">{[
                  <Trophy size={28} key="1" style={{ color: '#f59e0b' }} aria-hidden="true" />,
                  <Award size={26} key="2" style={{ color: '#94a3b8' }} aria-hidden="true" />,
                  <Award size={24} key="3" style={{ color: '#cd7c3a' }} aria-hidden="true" />,
                ][i]}</span>
                <img src={r.thumbnail} alt={r.title} className="popular__podium-img" />
                <h3>{r.title}</h3>
                <p className="popular__podium-downloads"><Download size={13} aria-hidden="true" style={{ verticalAlign: 'middle' }} /> {r.downloads.toLocaleString()} downloads</p>
                <div className="popular__podium-actions">
                  <button className="btn btn--outline btn--sm" onClick={() => setPreviewResource(r)}><Eye size={14} aria-hidden="true" /> Preview</button>
                  <button
                    className={`btn btn--primary btn--sm${!user ? ' btn--disabled' : ''}`}
                    onClick={() => handleTopDownload(r)}
                    aria-disabled={!user}
                    title={!user ? 'Log in to download' : undefined}
                  ><Download size={14} aria-hidden="true" /> Download</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All sorted */}
      <section className="popular__all">
        <div className="container">
          <h2 className="section-title">All Resources by Popularity<span className="section-count">{sorted.length}</span></h2>
          <div className="resource-grid">
            {sorted.map(r => (
              <ResourceCard key={r.id} resource={r} onPreview={setPreviewResource} onFeedback={setFeedbackResource} />
            ))}
          </div>
        </div>
      </section>

      {previewResource && <PreviewModal resource={previewResource} onClose={() => setPreviewResource(null)} />}
      {feedbackResource && <FeedbackForm resource={feedbackResource} onClose={() => setFeedbackResource(null)} />}

      {showLoginPrompt && (
        <ConfirmDialog
          title="Login required"
          message="You need to be logged in to download. Would you like to log in now?"
          confirmLabel="Login"
          onConfirm={() => navigate('/login')}
          onCancel={() => setShowLoginPrompt(false)}
        />
      )}
    </main>
  );
}
