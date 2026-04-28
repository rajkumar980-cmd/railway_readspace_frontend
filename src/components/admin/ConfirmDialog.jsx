import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import './admin-components.css';

export default function ConfirmDialog({ title, message, confirmLabel = 'Delete', onConfirm, onCancel }) {
  useEffect(() => {
    const hk = (e) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', hk);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', hk);
      document.body.style.overflow = '';
    };
  }, [onCancel]);

  return (
    <div
      className="adm-modal-backdrop adm-modal-backdrop--centered"
      role="alertdialog"
      aria-modal="true"
      aria-label={title}
      onClick={e => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="adm-modal adm-modal--confirm">
        <div className="adm-confirm__icon"><AlertTriangle size={32} strokeWidth={1.5} /></div>
        <h2 className="adm-confirm__title">{title}</h2>
        <p className="adm-confirm__message">{message}</p>
        <div className="adm-confirm__actions">
          <button className="btn btn--outline" onClick={onCancel} autoFocus>Cancel</button>
          <button className="btn btn--danger" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
