import { useState, useEffect, useMemo } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Search, Download, User, LogOut, BookMarked, Settings2, ChevronDown, BookPlus, X } from 'lucide-react';
import SearchBar from '../../components/SearchBar/SearchBar';
import CategoryFilter from '../../components/CategoryFilter/CategoryFilter';
import ResourceCard from '../../components/ResourceCard/ResourceCard';
import PreviewModal from '../../components/PreviewModal/PreviewModal';
import FeedbackForm from '../../components/FeedbackForm/FeedbackForm';
import BrandLogo from '../../components/brand/BrandLogo';
import { useResources } from '../../context/ResourceContext';
import './UserDashboard.css';

// Reading statuses — mirrors common library/reading-list trackers
const READ_STATUSES = [
  { id: 'all',       label: 'All' },
  { id: 'reading',   label: 'Reading' },
  { id: 'completed', label: 'Completed' },
  { id: 'onhold',    label: 'On Hold' },
  { id: 'dropped',   label: 'Dropped' },
  { id: 'plantoread',label: 'Plan to Read' },
];

const STATUS_COLORS = {
  reading:   { bg: 'rgba(59,130,246,0.12)',  color: '#1a56db' },
  completed: { bg: 'rgba(16,185,129,0.12)',  color: '#059669' },
  onhold:    { bg: 'rgba(245,158,11,0.12)',  color: '#b45309' },
  dropped:   { bg: 'rgba(239,68,68,0.12)',   color: '#dc2626' },
  plantoread:{ bg: 'rgba(139,92,246,0.12)',  color: '#7c3aed' },
};

// Mock initial reading-list (resource id → status)
const INITIAL_LIBRARY = {
  1: 'reading',
  2: 'completed',
  3: 'onhold',
  4: 'reading',
  5: 'plantoread',
  6: 'completed',
  7: 'plantoread',
  8: 'dropped',
  9: 'plantoread',
};

export default function UserDashboard() {
  const { resources: RESOURCES } = useResources();
  const MOCK_HISTORY = useMemo(() => RESOURCES.slice(0, 4), [RESOURCES]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('browse');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [previewResource, setPreviewResource] = useState(null);
  const [feedbackResource, setFeedbackResource] = useState(null);

  // My Library state
  const [library, setLibrary] = useState(INITIAL_LIBRARY); // { [resourceId]: status }
  const [libStatus, setLibStatus] = useState('all');          // active filter tab
  const [libSearch, setLibSearch]  = useState('');            // search within My Library
  const [openStatusMenu, setOpenStatusMenu] = useState(null); // resource id with open dropdown

  // Close dropdown on outside click — registered ONCE to avoid flicker
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest('.lib__status-wrap')) setOpenStatusMenu(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);  // empty deps: single stable listener, no re-registration flicker

  // Helper: switch tab AND close any open status dropdown
  const switchTab = (tabId) => {
    setOpenStatusMenu(null);
    setActiveTab(tabId);
  };

  const myLibraryResources = RESOURCES.filter(r => r.id in library);

  // Bug fix 3: filter by both status tab AND search text
  const filteredLibrary = (libStatus === 'all'
    ? myLibraryResources
    : myLibraryResources.filter(r => library[r.id] === libStatus)
  ).filter(r => {
    if (!libSearch.trim()) return true;
    const q = libSearch.toLowerCase();
    return r.title.toLowerCase().includes(q) || r.author.toLowerCase().includes(q);
  });

  const statusCounts = READ_STATUSES.reduce((acc, s) => {
    acc[s.id] = s.id === 'all'
      ? myLibraryResources.length
      : myLibraryResources.filter(r => library[r.id] === s.id).length;
    return acc;
  }, {});

  const setResourceStatus = (resourceId, status) => {
    setLibrary(prev => ({ ...prev, [resourceId]: status }));
    setOpenStatusMenu(null);
  };

  // Bug fix 4: add resource to library from Browse (defaults to Plan to Read)
  const addToLibrary = (resourceId) => {
    if (!(resourceId in library)) {
      setLibrary(prev => ({ ...prev, [resourceId]: 'plantoread' }));
    }
  };

  const removeFromLibrary = (resourceId) => {
    setLibrary(prev => {
      const next = { ...prev };
      delete next[resourceId];
      return next;
    });
    setOpenStatusMenu(null);
  };

  if (!user) {
    return (
      <main className="access-denied">
        <div className="access-denied__card">
          <div className="access-denied__icon"><Lock size={44} strokeWidth={1.5} aria-hidden="true" /></div>
          <h2>Please log in</h2>
          <p>You must be logged in to view your dashboard.</p>
          <button className="btn btn--primary" onClick={() => navigate('/login')}>Go to Login</button>
        </div>
      </main>
    );
  }

  const filtered = RESOURCES.filter(r => {
    const matchCat = category === 'all' || r.category === category;
    const q = search.toLowerCase();
    const matchQ = !q || r.title.toLowerCase().includes(q) || r.author.toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  return (
    <main className="dashboard">
      {/* Sidebar */}
      <aside className="dashboard__sidebar">
        <Link to="/" className="dashboard__brand">
          <BrandLogo size="sm" />
        </Link>
        <nav className="dashboard__nav">
          {[
            { id: 'browse',    label: 'Browse',      icon: <Search size={15} aria-hidden="true" /> },
            { id: 'mylibrary', label: 'My Library',  icon: <BookMarked size={15} aria-hidden="true" /> },
            { id: 'history',   label: 'History',     icon: <Download size={15} aria-hidden="true" /> },
            { id: 'profile',   label: 'My Profile',  icon: <User size={15} aria-hidden="true" /> },
          ].map(tab => (
            <button
              key={tab.id}
              className={`dashboard__nav-btn${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => switchTab(tab.id)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
          <button className="dashboard__nav-btn dashboard__logout" onClick={() => { logout(); navigate('/'); }}>
            <LogOut size={15} aria-hidden="true" /> Logout
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <div className="dashboard__main">
        <AnimatePresence mode="wait" initial={false}>
          {activeTab === 'browse' && (
            <Motion.section
              key="browse"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }}
              exit={{ opacity: 0, y: -6, transition: { duration: 0.18 } }}
            >
              <h2 className="dashboard__section-title">Browse Resources</h2>
              <div className="dashboard__toolbar">
                <SearchBar value={search} onChange={setSearch} />
                <CategoryFilter active={category} onSelect={setCategory} />
              </div>
              <div className="resource-grid" style={{ marginTop: '1.5rem' }}>
                {filtered.map(r => {
                  const inLib = r.id in library;
                  const libSt  = inLib ? library[r.id] : null;
                  const sc     = inLib ? STATUS_COLORS[libSt] : null;
                  return (
                    <div key={r.id} className="lib__browse-card">
                      <ResourceCard resource={r} onPreview={setPreviewResource} onFeedback={setFeedbackResource} />
                      {inLib ? (
                        <button
                          className="lib__browse-save-btn lib__browse-save-btn--saved"
                          style={{ background: sc?.bg, color: sc?.color }}
                          onClick={() => setActiveTab('mylibrary')}
                          title="Go to My Library"
                        >
                          <BookMarked size={12} />
                          {READ_STATUSES.find(s => s.id === libSt)?.label}
                        </button>
                      ) : (
                        <button
                          className="lib__browse-save-btn"
                          onClick={() => addToLibrary(r.id)}
                          title="Save to My Library (Plan to Read)"
                        >
                          <BookPlus size={12} />
                          Add to Library
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </Motion.section>
          )}

          {activeTab === 'mylibrary' && (
            <Motion.section
              key="mylibrary"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }}
              exit={{ opacity: 0, y: -6, transition: { duration: 0.18 } }}
            >
              <div className="lib__header">
                <div>
                  <h2 className="dashboard__section-title" style={{ marginBottom: 0 }}>My Library</h2>
                  <p className="lib__subtitle">{myLibraryResources.length} resource{myLibraryResources.length !== 1 ? 's' : ''} in your reading list</p>
                </div>
              </div>

              {/* ── Search within library ── */}
              <div className="lib__search-wrap">
                <Search size={14} className="lib__search-icon" aria-hidden="true" />
                <input
                  className="lib__search-input form-input"
                  placeholder="Search your library…"
                  value={libSearch}
                  onChange={e => setLibSearch(e.target.value)}
                  aria-label="Search my library"
                />
                {libSearch && (
                  <button className="lib__search-clear" onClick={() => setLibSearch('')} aria-label="Clear search">
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* ── Reading-status horizontal tab bar ── */}
              <div className="lib__status-bar">
                <div className="lib__status-tabs">
                  {READ_STATUSES.map(s => (
                    <button
                      key={s.id}
                      className={`lib__status-tab${libStatus === s.id ? ' active' : ''}`}
                      onClick={() => setLibStatus(s.id)}
                    >
                      {s.label}
                      {statusCounts[s.id] > 0 && (
                        <span className="lib__status-count">{statusCounts[s.id]}</span>
                      )}
                    </button>
                  ))}
                </div>
                <button
                  className="lib__manage-btn"
                  onClick={() => setLibStatus('all')}
                  aria-label="View all"
                  title="Show all"
                >
                  <Settings2 size={15} strokeWidth={2} />
                </button>
              </div>

              {/* ── Resource list ── */}
              {filteredLibrary.length === 0 ? (
                <div className="lib__empty">
                  <BookMarked size={36} strokeWidth={1.3} aria-hidden="true" />
                  {libSearch.trim() ? (
                    <p>No results for&nbsp;<strong>"{libSearch}"</strong>.</p>
                  ) : (
                    <p>No resources with&nbsp;<strong>{READ_STATUSES.find(s => s.id === libStatus)?.label}</strong>&nbsp;status.</p>
                  )}
                </div>
              ) : (
                <div className="lib__list">
                  {filteredLibrary.map(r => {
                    const status = library[r.id];
                    const sc = STATUS_COLORS[status] ?? {};
                    const isOpen = openStatusMenu === r.id;
                    return (
                      <div key={r.id} className="lib__item" style={{ borderLeft: `3px solid ${sc.color}`, zIndex: isOpen ? 50 : 1 }}>
                        <img src={r.thumbnail} alt={r.title} className="lib__thumb" />
                        <div className="lib__info">
                          <p className="lib__title">{r.title}</p>
                          <p className="lib__meta">{r.author} · {r.categoryLabel} · {r.year}</p>
                          <div className="lib__badges">
                            <span className="lib__cat-badge">{r.categoryLabel}</span>
                            <span className="lib__size">{r.fileSize}</span>
                          </div>
                        </div>
                        {/* Status changer dropdown */}
                        <div className="lib__status-wrap">
                          <button
                            className="lib__status-badge"
                            style={{ background: sc.bg, color: sc.color }}
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={() => setOpenStatusMenu(isOpen ? null : r.id)}
                            aria-expanded={isOpen}
                            aria-label="Change reading status"
                          >
                            {READ_STATUSES.find(s => s.id === status)?.label}
                            <ChevronDown size={12} strokeWidth={2.5} />
                          </button>
                          {isOpen && (
                            <div className="lib__status-menu">
                              {READ_STATUSES.filter(s => s.id !== 'all').map(s => (
                                <button
                                  key={s.id}
                                  className={`lib__status-option${status === s.id ? ' selected' : ''}`}
                                  onClick={() => setResourceStatus(r.id, s.id)}
                                >
                                  {s.label}
                                </button>
                              ))}
                              <div className="lib__status-menu-divider" />
                              <button
                                className="lib__status-option lib__status-option--remove"
                                onClick={() => removeFromLibrary(r.id)}
                              >
                                Remove from Library
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Motion.section>
          )}

          {activeTab === 'history' && (
            <Motion.section
              key="history"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }}
              exit={{ opacity: 0, y: -6, transition: { duration: 0.18 } }}
            >
              <h2 className="dashboard__section-title">Download History</h2>
              <div className="dashboard__history-list">
                {MOCK_HISTORY.map(r => (
                  <div key={r.id} className="dashboard__history-item">
                    <img src={r.thumbnail} alt={r.title} className="dashboard__history-thumb" />
                    <div className="dashboard__history-info">
                      <p className="dashboard__history-title">{r.title}</p>
                      <p className="dashboard__history-meta">{r.categoryLabel} • {r.year} • {r.fileSize}</p>
                    </div>
                    <button className="btn btn--primary btn--sm" onClick={() => alert('Re-download started (mock)')}><Download size={14} aria-hidden="true" /> Again</button>
                  </div>
                ))}
              </div>
            </Motion.section>
          )}

          {activeTab === 'profile' && (
            <Motion.section
              key="profile"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }}
              exit={{ opacity: 0, y: -6, transition: { duration: 0.18 } }}
            >
              <h2 className="dashboard__section-title">My Profile</h2>
              <div className="dashboard__profile-card">
                <div className="dashboard__profile-avatar">{user.name.charAt(0).toUpperCase()}</div>
                <div className="form-group" style={{ width: '100%', maxWidth: 400 }}>
                  <label className="form-label">Full Name</label>
                  <input className="form-input" defaultValue={user.name} />
                </div>
                <div className="form-group" style={{ width: '100%', maxWidth: 400 }}>
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" defaultValue={user.email} />
                </div>
                <button className="btn btn--primary" onClick={() => alert('Profile updated! (mock)')}>Save Changes</button>
              </div>
            </Motion.section>
          )}
        </AnimatePresence>
      </div>

      {previewResource && <PreviewModal resource={previewResource} onClose={() => setPreviewResource(null)} />}
      {feedbackResource && <FeedbackForm resource={feedbackResource} onClose={() => setFeedbackResource(null)} />}
    </main>
  );
}
