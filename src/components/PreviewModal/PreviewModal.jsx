import { useEffect, useRef, useState } from 'react';
import { X, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ConfirmDialog from '../admin/ConfirmDialog';
import './PreviewModal.css';

/** Returns all keyboard-focusable elements inside a container */
function getFocusable(container) {
  return Array.from(
    container.querySelectorAll(
      'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])'
    )
  );
}

export default function PreviewModal({ resource, onClose }) {
  const modalRef = useRef(null);

  useEffect(() => {
    // Lock scroll
    document.body.style.overflow = 'hidden';

    // Focus the modal itself on mount so screen readers announce it
    modalRef.current?.focus();

    const handler = (e) => {
      if (e.key === 'Escape') { onClose(); return; }

      // Focus trap on Tab
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = getFocusable(modalRef.current);
        if (!focusable.length) { e.preventDefault(); return; }
        const first = focusable[0];
        const last  = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
          if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
        }
      }
    };

    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!resource) return null;

  const { user } = useAuth();
  const navigate = useNavigate();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const handleDownload = () => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    alert(`Download started for "${resource.title}" (mock action)`);
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div
        className="modal"
        onClick={e => e.stopPropagation()}
        ref={modalRef}
        tabIndex={-1}
        aria-label="Resource preview"
      >
        <button className="modal__close" onClick={onClose} aria-label="Close modal"><X size={18} strokeWidth={2} aria-hidden="true" /></button>

        <div className="modal__header">
          <img
            src={resource.thumbnail}
            alt={resource.title}
            className="modal__thumb"
          />
          <div>
            <span className="modal__category-badge">{resource.categoryLabel}</span>
            <h2 className="modal__title" id="modal-title">{resource.title}</h2>
            <p className="modal__author">by {resource.author} • {resource.year}</p>
          </div>
        </div>

        <div className="modal__body">
          <section>
            <h3>About this resource</h3>
            <p>{resource.description}</p>
          </section>

          <div className="modal__stats">
            <div className="modal__stat">
              <strong>{resource.pages}</strong>
              <span>Pages</span>
            </div>
            <div className="modal__stat">
              <strong>{resource.rating}/5</strong>
              <span>Rating</span>
            </div>
            <div className="modal__stat">
              <strong>{resource.downloads.toLocaleString()}</strong>
              <span>Downloads</span>
            </div>
            <div className="modal__stat">
              <strong>{resource.fileSize}</strong>
              <span>File Size</span>
            </div>
          </div>

          <div className="modal__tags">
            {resource.tags.map(tag => (
              <span key={tag} className="modal__tag">#{tag}</span>
            ))}
          </div>
        </div>

        <div className="modal__footer">
          <button
            className={`btn btn--primary btn--lg${!user ? ' btn--disabled' : ''}`}
            onClick={handleDownload}
            aria-disabled={!user}
            title={!user ? 'Log in to download' : undefined}
          >
            <Download size={16} aria-hidden="true" /> Download Now
          </button>
          {showLoginPrompt && (
            <ConfirmDialog
              title="Login required"
              message="You need to sign in to download this resource. Go to login?"
              confirmLabel="Login"
              onConfirm={() => navigate('/login')}
              onCancel={() => setShowLoginPrompt(false)}
            />
          )}
          <button className="btn btn--secondary btn--lg" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
