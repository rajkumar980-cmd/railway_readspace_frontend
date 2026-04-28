import { useState, useEffect } from 'react';
import './admin-components.css';

export default function EditResourceModal({ resource, onSave, onClose }) {
  const CATEGORY_MAP = {
    textbooks: 'Textbook',
    research: 'Research Paper',
    guides: 'Study Guide',
    tutorials: 'Tutorial',
  };

  // Initialize directly from prop — component is conditionally rendered so it
  // mounts fresh each time `editResource` changes in the parent.
  const [form, setForm] = useState({
    title: resource?.title || '',
    author: resource?.author || '',
    description: resource?.description || '',
    category: resource?.category || 'textbooks',
    categoryLabel: resource?.categoryLabel || 'Textbook',
    year: resource?.year || new Date().getFullYear(),
    tags: (resource?.tags || []).join(', '),
    status: resource?.status || 'draft',
    externalUrl: resource?.externalUrl || '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // ESC key
  useEffect(() => {
    const hk = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', hk);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', hk);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!resource) return null;

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required.';
    if (!form.author.trim()) errs.author = 'Author is required.';
    if (!form.description.trim()) errs.description = 'Description is required.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSaving(true);
    await new Promise(r => setTimeout(r, 900)); // mock API delay
    const updated = {
      ...resource,
      ...form,
      categoryLabel: CATEGORY_MAP[form.category] || form.categoryLabel,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      externalUrl: form.externalUrl,
    };
    onSave(updated);
    setSaving(false);
  };

  const field = (key) => ({
    value: form[key],
    onChange: (e) => {
      setForm(f => ({ ...f, [key]: e.target.value }));
      if (errors[key]) setErrors(e2 => { const n = { ...e2 }; delete n[key]; return n; });
    },
  });

  return (
    <div
      className="adm-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={`Edit: ${resource.title}`}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="adm-modal adm-modal--edit">
        <header className="adm-modal__header">
          <h2 className="adm-modal__title">Edit Resource</h2>
          <button className="adm-modal__close" onClick={onClose} aria-label="Close editor">✕</button>
        </header>

        <form className="adm-modal__body" onSubmit={handleSubmit} noValidate>
          <div className="adm-edit__grid">
            <div className="form-group">
              <label className="form-label">Title <span className="required">*</span></label>
              <input id="edit-title" className={`form-input${errors.title ? ' form-input--error' : ''}`} {...field('title')} placeholder="Resource title" aria-invalid={!!errors.title} aria-describedby={errors.title ? 'edit-title-error' : undefined} />
              {errors.title && <span id="edit-title-error" className="form-error">{errors.title}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Author(s) <span className="required">*</span></label>
              <input id="edit-author" className={`form-input${errors.author ? ' form-input--error' : ''}`} {...field('author')} placeholder="Author name(s)" aria-invalid={!!errors.author} aria-describedby={errors.author ? 'edit-author-error' : undefined} />
              {errors.author && <span id="edit-author-error" className="form-error">{errors.author}</span>}
            </div>
          </div>

          <div className="adm-edit__grid">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-input form-select"
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value, categoryLabel: CATEGORY_MAP[e.target.value] }))}
              >
                <option value="textbooks">Textbook</option>
                <option value="research">Research Paper</option>
                <option value="guides">Study Guide</option>
                <option value="tutorials">Tutorial</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Year</label>
              <input className="form-input" type="number" min="1900" max="2030" {...field('year')} />
            </div>
          </div>

          <div className="adm-edit__grid">
            <div className="form-group">
              <label className="form-label">Tags <span className="form-hint">(comma-separated)</span></label>
              <input className="form-input" {...field('tags')} placeholder="e.g. algorithms, cs, beginner" />
            </div>
            <div className="form-group">
              <label className="form-label">External PDF Link</label>
              <input className="form-input" {...field('externalUrl')} placeholder="https://example.com/book.pdf" />
            </div>
          </div>
          <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-input form-select" {...field('status')}>
                <option value="draft">Draft (hidden)</option>
                <option value="published">Published (live)</option>
              </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description <span className="required">*</span></label>
            <textarea
              id="edit-description"
              className={`form-input form-textarea${errors.description ? ' form-input--error' : ''}`}
              rows={4}
              {...field('description')}
              placeholder="Brief description…"
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? 'edit-description-error' : undefined}
            />
            {errors.description && <span id="edit-description-error" className="form-error">{errors.description}</span>}
          </div>

          <footer className="adm-modal__footer">
            <button type="button" className="btn btn--outline" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? <><span className="admin__spinner" /> Saving…</> : '✔ Save Changes'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
