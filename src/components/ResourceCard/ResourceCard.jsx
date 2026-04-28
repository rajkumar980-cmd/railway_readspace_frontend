import { useState } from 'react';
import { FileText, Calendar, Download, Eye, Star, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ConfirmDialog from '../admin/ConfirmDialog';
import './ResourceCard.css';

const CATEGORY_COLORS = {
  textbooks: '#3b82f6',
  research:  '#8b5cf6',
  guides:    '#10b981',
  tutorials: '#f59e0b',
};

export default function ResourceCard({ resource, onPreview, onFeedback }) {
  const [downloading, setDownloading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  
  const handleViewResource = () => {
    if (resource.filePath && resource.fileUrl) {
      const filename = resource.fileUrl.split('/').pop();
      const url = `http://localhost:8080/api/resources/view/${filename}`;
      window.open(url, '_blank');
    } else if (resource.externalUrl) {
      window.open(resource.externalUrl, '_blank');
    }
  };

  const handleDownload = () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    setDownloading(true);
    
    // Determine the actual URL
    // Priority: External Link > Local File Preview Endpoint
    let viewUrl = resource.externalUrl;
    
    if (!viewUrl && resource.fileUrl && resource.fileUrl.startsWith('/uploads')) {
      const filename = resource.fileUrl.split('/').pop();
      viewUrl = `http://localhost:8080/api/resources/view/${filename}`;
    }

    if (viewUrl) {
      // Fire-and-forget: Tell the backend to increment download count
      const token = localStorage.getItem('token');
      fetch(`http://localhost:8080/api/resources/${resource.id}/download`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      }).catch(err => console.error('Failed to record download:', err));

      setTimeout(() => {
        setDownloading(false);
        window.open(viewUrl, '_blank');
      }, 800);
    } else {
      setDownloading(false);
      alert('No preview/download link available for this resource.');
    }
  };

  const color = CATEGORY_COLORS[resource.category] || '#1a56db';
  const stars = '★'.repeat(Math.round(resource.rating)) + '☆'.repeat(5 - Math.round(resource.rating));

  return (
    <>
      <article className="resource-card">
      {/* Thumbnail */}
      <div className="resource-card__thumb-wrap" onClick={handleViewResource} style={{ cursor: 'pointer' }}>
        <img
          src={resource.thumbnail}
          alt={resource.title}
          className="resource-card__thumb"
          loading="lazy"
        />
        <span
          className="resource-card__badge"
          style={{ background: color }}
        >
          {resource.categoryLabel}
        </span>
      </div>

      {/* Body */}
      <div className="resource-card__body" onClick={handleViewResource} style={{ cursor: 'pointer' }}>
        <h3 className="resource-card__title">{resource.title}</h3>
        <p className="resource-card__author">by {resource.author}</p>
        <p className="resource-card__desc">{resource.description}</p>

        <div className="resource-card__meta">
          <span title="Rating" className="resource-card__stars" style={{ color }}>
            {stars}
          </span>
          <span className="resource-card__meta-item"><FileText size={12} aria-hidden="true" /> {resource.pages}pp</span>
          <span className="resource-card__meta-item"><Calendar size={12} aria-hidden="true" /> {resource.year}</span>
          <span className="resource-card__meta-item"><Download size={12} aria-hidden="true" /> {resource.downloads.toLocaleString()}</span>
          <span className="resource-card__meta-item">{resource.fileSize}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="resource-card__actions">
        <button
          className="btn btn--outline btn--sm"
          onClick={() => onPreview(resource)}
        >
          <Eye size={14} aria-hidden="true" /> Preview
        </button>
        <button
          className={`btn btn--primary btn--sm${!user ? ' btn--disabled' : ''}`}
          onClick={handleDownload}
          aria-disabled={downloading || !user}
          title={!user ? 'Log in to download' : undefined}
        >
          {downloading ? <><Loader2 size={14} aria-hidden="true" className="spin" /> Downloading…</> : <><Download size={14} aria-hidden="true" /> Download</>}
        </button>
        <button
          className={`btn btn--ghost btn--sm${!user ? ' btn--disabled' : ''}`}
          onClick={() => {
            if (!user) {
              setShowLoginPrompt(true);
              return;
            }
            onFeedback(resource);
          }}
          aria-label={`Rate ${resource.title}`}
          aria-disabled={!user}
          title={!user ? 'Log in to rate' : undefined}
        >
          <Star size={14} aria-hidden="true" /> Rate
        </button>
      </div>
    </article>

      {showLoginPrompt && (
        <ConfirmDialog
          title="Login required"
          message="You must be logged in to continue. Do you want to sign in now?"
          confirmLabel="Login"
          onConfirm={() => navigate('/login')}
          onCancel={() => setShowLoginPrompt(false)}
        />
      )}
    </>
  );
}
