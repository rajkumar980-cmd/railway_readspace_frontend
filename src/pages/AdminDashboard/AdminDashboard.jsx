import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useRatings } from '../../context/RatingsContext';
import { useNavigate } from 'react-router-dom';
import { MOCK_USERS, ANALYTICS } from '../../data/mockData';
import { useResources } from '../../context/ResourceContext';
import ResourcePreviewModal from '../../components/admin/ResourcePreviewModal';
import EditResourceModal from '../../components/admin/EditResourceModal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import RecentActivity from '../../components/admin/RecentActivity';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import Select from '../../components/ui/Select';
import BrandLogo from '../../components/brand/BrandLogo';
import {
  LayoutDashboard, BookOpen, Upload, Users, BarChart2, Settings, LogOut,
  Menu, Eye, Pencil, Globe, EyeOff, Trash2,
  ArrowDownToLine, Layers, Star, AlertCircle, Calendar, X,
  CheckCircle, Inbox, UserX, FolderOpen, MessageSquare, Search,
} from 'lucide-react';
import './AdminDashboard.css';

/* ── Helper components ─────────────────────────────────────── */

function SkeletonRow({ cols }) {
  return (
    <tr className="admin__skeleton-row">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i}><div className="admin__skeleton" /></td>
      ))}
    </tr>
  );
}

function EmptyState({ icon, title, sub, action, onAction }) {
  return (
    <div className="admin__empty">
      <div className="admin__empty-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{sub}</p>
      {action && <button className="btn btn--primary btn--sm" onClick={onAction}>{action}</button>}
    </div>
  );
}

function StatCard({ Icon, label, value, delta, color }) {
  return (
    <div className="admin__stat-card">
      <div className="admin__stat-icon" style={{ background: color + '1a', color }}>
        <Icon size={22} strokeWidth={1.75} />
      </div>
      <div className="admin__stat-body">
        <span className="admin__stat-label">{label}</span>
        <span className="admin__stat-value">{value}</span>
        {delta && <span className="admin__stat-delta">{delta}</span>}
      </div>
    </div>
  );
}

function ActionBtn({ Icon: IconComp, label, tooltip, variant, onClick }) {
  return (
    <button
      className={`admin__action-btn${variant ? ` admin__action-btn--${variant}` : ''}`}
      onClick={onClick}
      aria-label={label}
      data-tip={tooltip}
    >
      <IconComp size={16} strokeWidth={2} />
    </button>
  );
}

function Toast({ message, type, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);
  return <div className={`admin-toast admin-toast--${type}`}>{message}</div>;
}

const INITIAL_UPLOAD = { title: '', author: '', category: 'textbooks', description: '', year: new Date().getFullYear(), tags: '', status: 'draft', externalUrl: '' };

const SECTIONS = [
  { id: 'overview',   label: 'Overview',            Icon: LayoutDashboard },
  { id: 'resources',  label: 'Resources',            Icon: BookOpen },
  { id: 'upload',     label: 'Upload Resource',      Icon: Upload },
  { id: 'users',      label: 'Users',                Icon: Users },
  { id: 'reviews',    label: 'Ratings & Reviews',    Icon: MessageSquare },
  { id: 'analytics',  label: 'Analytics',            Icon: BarChart2 },
  { id: 'settings',   label: 'Settings',             Icon: Settings },
];

const DATE_RANGES = [
  { value: 'last7',    label: 'Last 7 days' },
  { value: 'last30',   label: 'Last 30 days' },
  { value: 'thisyear', label: 'This year' },
];

const INITIAL_ACTIVITIES = [
  { id: 1, iconType: 'upload',        text: 'Resource "Introduction to Algorithms" published', type: 'success', time: '09:14' },
  { id: 2, iconType: 'user_register', text: 'New user Ananya Sharma registered',               type: 'info',    time: '08:52' },
  { id: 3, iconType: 'download',      text: '"React & Next.js Tutorial" downloaded 50× today', type: 'info',    time: '08:30' },
  { id: 4, iconType: 'edit',          text: 'Resource "Deep Learning with Python" edited',     type: 'warning', time: 'Yesterday' },
  { id: 5, iconType: 'user_disable',  text: 'User Vikram Singh account disabled',              type: 'error',   time: 'Yesterday' },
];

export default function AdminDashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const { getAvgRating, getUserReviewCount, globalStats, getAllUserReviews, deleteReview } = useRatings();
  const toastCounter = useRef(0);
  const activityCounter = useRef(5); // starts after INITIAL_ACTIVITIES

  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Resources
  const { resources: RESOURCES, fetchResources } = useResources();
  const [resources, setResources] = useState([]);

  useEffect(() => {
    setResources(RESOURCES.map(r => ({ 
      ...r, 
      status: r.featured ? 'published' : 'draft', 
      uploadDate: r.createdAt ? new Date(r.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recently' 
    })));
  }, [RESOURCES]);
  const [resLoading, setResLoading] = useState(false);
  const [resSearch, setResSearch] = useState('');

  // Users
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usrSearch, setUsrSearch] = useState('');

  // Reviews
  const [allReviews, setAllReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [summaryStats, setSummaryStats] = useState(null);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSummaryStats(response.data);
      if (response.data.recentActivities) {
        setActivities(response.data.recentActivities);
      }
    } catch (err) {
      console.error("Failed to fetch admin stats", err);
    }
  };

  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/reviews`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log("DEBUG: Fetched reviews successfully", response.data);
      setAllReviews(response.data);
    } catch (err) {
      console.error("CRITICAL: Failed to fetch reviews with Axios", err);
      showToast('Could not load reviews from database', 'error');
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (activeSection === 'users') {
      fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setUsersLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch users", err);
        setUsersLoading(false);
      });
    }
    if (activeSection === 'reviews') {
      fetchReviews();
    }
    if (activeSection === 'overview' || activeSection === 'analytics') {
      fetchStats();
      const interval = setInterval(fetchStats, 10000); // Polling every 10 seconds
      return () => clearInterval(interval);
    }
  }, [activeSection, token]);

  // Upload form
  const [uploadForm, setUploadForm] = useState(INITIAL_UPLOAD);
  const [uploadErrors, setUploadErrors] = useState({});
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);

  // Modals / dialogs
  const [previewResource, setPreviewResource] = useState(null);
  const [editResource, setEditResource] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // { id, title }

  // Activity feed
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES);

  // Date range filter
  const [dateRange, setDateRange] = useState('last30');

  // Reviews page filters
  const [rvResourceFilter, setRvResourceFilter] = useState('all');
  const [rvStarFilter,     setRvStarFilter]     = useState(0);   // 0 = all
  const [rvSearch,         setRvSearch]          = useState('');
  const [rvSort,           setRvSort]            = useState('newest'); // 'newest' | 'oldest' | 'highest' | 'lowest'

  // Settings
  const [settings, setSettings] = useState({
    siteName: 'ReadSpace',
    maintenanceMode: false,
    allowRegistrations: true,
    maxFileSize: '25',
    defaultCategory: 'textbooks',
  });

  if (!user || user.role !== 'admin') {
    return (
      <main className="access-denied">
        <div className="access-denied__card">
          <div className="access-denied__icon">🛡</div>
          <h2>Admin Access Required</h2>
          <p>Login with an admin account to access the admin panel.</p>
          <button className="btn btn--primary" onClick={() => navigate('/login')}>Login as Admin</button>
        </div>
      </main>
    );
  }

  const showToast = (message, type = 'success') => {
    toastCounter.current += 1;
    setToast({ message, type, key: toastCounter.current });
  };

  const addActivity = (text, iconType = 'default', type = 'info') => {
    activityCounter.current += 1;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setActivities(prev => [{ id: activityCounter.current, iconType, text, type, time: now, isNew: true }, ...prev].slice(0, 20));
  };

  const handleNavClick = (id) => {
    if (id === activeSection) { setSidebarOpen(false); return; }
    setResLoading(true);
    setActiveSection(id);
    setSidebarOpen(false);
    setTimeout(() => setResLoading(false), 700);
  };

  /* ── Resource actions ── */
  const toggleStatus = async (id) => {
    const res = resources.find(r => r.id === id);
    if (!res) return;
    const newStatus = res.featured ? false : true; // Toggle featured status
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/resources/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ featured: newStatus })
      });
      if (response.ok) {
        fetchResources();
        showToast(`Resource set to ${newStatus ? 'published' : 'draft'}.`);
        addActivity(`"${res.title}" set to ${newStatus ? 'published' : 'draft'}`, newStatus ? 'status_pub' : 'status_draft', newStatus ? 'success' : 'warning');
      }
    } catch (err) {
      showToast('Action failed', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/resources/${confirmDelete.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchResources();
        showToast(`Resource "${confirmDelete.title}" deleted.`, 'error');
        addActivity(`Resource "${confirmDelete.title}" deleted`, 'delete', 'error');
      } else {
        showToast(`Delete failed (Status: ${response.status})`, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Delete failed (Check connection)', 'error');
    }
    setConfirmDelete(null);
  };

  const handleSaveEdit = async (updated) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/resources/${updated.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updated)
      });
      if (response.ok) {
        fetchResources();
        setEditResource(null);
        showToast(`"${updated.title}" updated successfully.`);
        addActivity(`Resource "${updated.title}" edited`, 'edit', 'warning');
      } else {
        showToast(`Update failed (Status: ${response.status})`, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Update failed (Check connection)', 'error');
    }
  };

  const filteredResources = resources.filter(r =>
    r.title.toLowerCase().includes(resSearch.toLowerCase()) ||
    r.categoryLabel.toLowerCase().includes(resSearch.toLowerCase())
  );

  /* ── User actions ── */
  const toggleUserStatus = async (id) => {
    const u = users.find(u => u.id === id);
    if (!u) return;
    const newStatus = u.status === 'active' ? 'inactive' : 'active';
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        setUsers(us => us.map(u => u.id === id ? { ...u, status: newStatus } : u));
        showToast('User status updated.');
        addActivity(`User "${u.name}" ${newStatus === 'active' ? 'enabled' : 'disabled'}`, newStatus === 'active' ? 'user_enable' : 'user_disable', newStatus === 'active' ? 'success' : 'error');
      }
    } catch (err) {
      showToast('Action failed', 'error');
    }
  };

  const changeRole = async (id, role) => {
    const u = users.find(u => u.id === id);
    if (!u) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${id}/role`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role })
      });
      if (response.ok) {
        setUsers(us => us.map(u => u.id === id ? { ...u, role } : u));
        showToast('Role updated.');
        addActivity(`User "${u.name}" role changed to ${role}`, 'role_change', 'info');
      }
    } catch (err) {
      showToast('Action failed', 'error');
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(usrSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(usrSearch.toLowerCase())
  );

  /* ── Upload ── */
  const validateUpload = () => {
    const errs = {};
    if (!uploadForm.title.trim()) errs.title = 'Title is required.';
    if (!uploadForm.author.trim()) errs.author = 'Author is required.';
    if (!uploadForm.description.trim()) errs.description = 'Description is required.';
    return errs;
  };
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file) => {
    const validTypes = ['application/pdf', 'application/epub+zip'];
    const validExtensions = ['.pdf', '.epub'];
    const isPdfOrEpub = validTypes.includes(file.type) || 
                       validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    
    if (!isPdfOrEpub) {
      showToast('Please upload a PDF or EPUB file.', 'error');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      showToast('File size exceeds 25MB limit.', 'error');
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const errs = validateUpload();
    if (Object.keys(errs).length) { setUploadErrors(errs); return; }
    setUploadErrors({});
    setUploadLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', uploadForm.title);
      formData.append('author', uploadForm.author);
      formData.append('category', uploadForm.category);
      formData.append('categoryLabel', SECTIONS.find(s => s.id === uploadForm.category)?.label || 'Other');
      formData.append('description', uploadForm.description);
      formData.append('year', parseInt(uploadForm.year));
      formData.append('pages', 200); 
      formData.append('thumbnail', uploadForm.thumbnail || '');
      
      const calcFileSize = selectedFile 
        ? (selectedFile.size / (1024 * 1024)).toFixed(1) + 'MB' 
        : (uploadForm.externalUrl ? 'External Link' : '0MB');
        
      formData.append('fileSize', calcFileSize);
      formData.append('tags', uploadForm.tags);
      formData.append('externalUrl', uploadForm.externalUrl);
      
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/resources`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: formData,
      });

      if (response.ok) {
        fetchResources();
        fetchStats(); // Update dashboard stats after upload
        showToast('Resource uploaded successfully!');
        setUploadForm(INITIAL_UPLOAD);
        setSelectedFile(null);
      } else {
        showToast('Upload failed', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Server error', 'error');
    } finally {
      setUploadLoading(false);
    }
  };

  /* ── Category breakdown data ── */
  const catBreakdown = [
    { label: 'Textbooks', count: 4, pct: 33 },
    { label: 'Research Papers', count: 3, pct: 25 },
    { label: 'Study Guides', count: 2, pct: 17 },
    { label: 'Tutorials', count: 2, pct: 17 },
    { label: 'Reference', count: 1, pct: 8 },
  ];

  return (
    <main className="admin">
      {toast && (
        <Toast
          key={toast.key}
          message={toast.message}
          type={toast.type}
          onDone={() => setToast(null)}
        />
      )}

      {/* ── Modals & Dialogs ── */}
      {previewResource && (
        <ResourcePreviewModal
          resource={previewResource}
          onClose={() => setPreviewResource(null)}
        />
      )}
      {editResource && (
        <EditResourceModal
          resource={editResource}
          onSave={handleSaveEdit}
          onClose={() => setEditResource(null)}
        />
      )}
      {confirmDelete && (
        <ConfirmDialog
          title="Delete Resource"
          message={`Are you sure you want to delete "${confirmDelete.title}"? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="admin__overlay" onClick={() => setSidebarOpen(false)} aria-hidden />
      )}

      {/* Sidebar */}
      <aside className={`admin__sidebar${sidebarOpen ? ' admin__sidebar--open' : ''}`}>
        <div className="admin__brand">
          <BrandLogo variant="sidebar" size="md" />
        </div>
        <nav className="admin__nav">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              className={`admin__nav-btn${activeSection === s.id ? ' active' : ''}`}
              onClick={() => handleNavClick(s.id)}
            >
              <s.Icon size={16} strokeWidth={2} className="admin__nav-icon-svg" />
              {s.label}
            </button>
          ))}
          <button
            className="admin__nav-btn admin__logout"
            onClick={() => { logout(); navigate('/'); }}
          >
            <LogOut size={16} strokeWidth={2} className="admin__nav-icon-svg" />
            Logout
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <div className="admin__main">
        {/* Mobile-only bar — hamburger to open sidebar */}
        <div className="admin__mobile-bar" aria-hidden={!sidebarOpen}>
          <button
            className="admin__hamburger"
            onClick={() => setSidebarOpen(o => !o)}
            aria-label="Toggle sidebar"
            aria-expanded={sidebarOpen}
          >
            <Menu size={20} strokeWidth={2} />
          </button>
        </div>

        <AnimatePresence mode="wait" initial={false}>
        <Motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut' } }}
          exit={{ opacity: 0, y: -6, transition: { duration: 0.16 } }}
        >
        {/* ── OVERVIEW ── */}
        {activeSection === 'overview' && (
          <section className="admin__section">
            <AdminPageHeader
              title="Overview"
              subtitle="Monitor platform performance and activity"
            >
              <Select
                value={dateRange}
                onChange={setDateRange}
                options={DATE_RANGES}
                label="Date range"
                LeadIcon={Calendar}
                compact
              />
            </AdminPageHeader>

            <div className="admin__stats-grid">
              <StatCard Icon={BookOpen}         label="Total Resources"  value={summaryStats?.totalResources ?? '—'} delta="Live from database" color="#1a56db" />
              <StatCard Icon={Users}            label="Registered Users" value={summaryStats?.totalUsers ?? '—'} delta="Students & Staff" color="#10b981" />
              <StatCard Icon={ArrowDownToLine}  label="Total Downloads"  value={summaryStats?.totalDownloads ?? '0'} delta="Total interactions" color="#f59e0b" />
              <StatCard Icon={Layers}           label="Categories"       value={new Set(resources.map(r => r.category)).size} delta="Active types" color="#8b5cf6" />
              <StatCard Icon={AlertCircle}      label="Disabled Users"   value={summaryStats?.disabledUsers ?? '0'} delta="Account access revoked" color="#ef4444" />
              <StatCard Icon={Star}             label="Total Reviews"    value={summaryStats?.totalReviews ?? '0'} delta="User feedback" color="#ec4899" />
            </div>

            <RecentActivity activities={activities} />

            <div className="admin__chart-card">
              <h3 className="admin__chart-title">Monthly Downloads</h3>
              <div className="admin__bar-chart">
                {(summaryStats?.monthlyDownloads || ANALYTICS.monthlyDownloads).map(d => (
                  <div key={d.month} className="admin__bar-col">
                    <span className="admin__bar-value">{d.value > 1000 ? `${(d.value / 1000).toFixed(1)}k` : d.value}</span>
                    <div
                      className="admin__bar"
                      style={{ height: `${(d.value / (Math.max(...(summaryStats?.monthlyDownloads || ANALYTICS.monthlyDownloads).map(m => m.value)) || 14000)) * 140}px` }}
                      title={`${d.month}: ${d.value.toLocaleString()}`}
                    />
                    <span className="admin__bar-label">{d.month}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="admin__quick-table-wrap">
              <h3 className="admin__qt-title">Top 5 Resources by Downloads</h3>
              <table className="admin__table admin__quick-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Downloads</th>
                    <th>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {[...resources].sort((a, b) => (b.downloads || 0) - (a.downloads || 0)).slice(0, 5).map(r => {
                    const liveRating = getAvgRating(r.id, r.rating || 0);
                    const reviewCount = (allReviews || []).filter(rev => rev.resourceId === r.id).length;
                    return (
                      <tr key={r.id}>
                        <td>{r.title}</td>
                        <td><span className="cat-tag">{r.categoryLabel}</span></td>
                        <td className="admin__td-num">{r.downloads.toLocaleString()}</td>
                        <td>
                          <Star size={13} fill="currentColor" strokeWidth={0} aria-hidden="true" style={{ verticalAlign: 'middle', color: '#f59e0b' }} />{' '}
                          {liveRating}
                          {reviewCount > 0 && (
                            <span style={{ marginLeft: '0.35rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                              ({reviewCount} new)
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ── RESOURCES ── */}
        {activeSection === 'resources' && (
          <section className="admin__section">
            <AdminPageHeader
              title="Manage Resources"
              subtitle={`${resources.length} resources total · ${resources.filter(r => r.status === 'published').length} published`}
            >
              <div className="admin__section-actions">
                <input
                  className="admin__search-input form-input"
                  placeholder="Search resources…"
                  value={resSearch}
                  onChange={e => setResSearch(e.target.value)}
                />
                <button className="btn btn--primary btn--sm" onClick={() => handleNavClick('upload')}>+ Upload</button>
              </div>
            </AdminPageHeader>

            <div className="admin__table-wrap">
              <table className="admin__table">
                <thead>
                  <tr>
                    <th>Resource</th>
                    <th>Category</th>
                    <th>Author</th>
                    <th>Status</th>
                    <th>Downloads</th>
                    <th>Rating</th>
                    <th>Uploaded</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {resLoading
                    ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={8} />)
                    : filteredResources.length === 0
                      ? (
                        <tr>
                          <td colSpan={8}>
                            <EmptyState
                              icon={<Inbox size={28} strokeWidth={1.5} aria-hidden="true" />}
                              title="No resources found"
                              sub="Try a different search term."
                            />
                          </td>
                        </tr>
                      )
                      : filteredResources.map(r => {
                          const liveRating = getAvgRating(r.id, r.rating);
                          const reviewCount = getUserReviewCount(r.id);
                          return (
                          <tr key={r.id}>
                            <td>
                              <div className="admin__table-resource">
                                <img src={r.thumbnail} alt={r.title} className="admin__table-thumb" />
                                <span>{r.title}</span>
                              </div>
                            </td>
                            <td><span className="cat-tag">{r.categoryLabel}</span></td>
                            <td className="admin__td-muted">{r.author}</td>
                            <td>
                              <span className={`admin__status-badge admin__status-badge--${r.status}`}>
                                {r.status === 'published'
                                  ? <><CheckCircle size={11} strokeWidth={2.5} style={{ marginRight: 4 }} />Published</>
                                  : <><EyeOff size={11} strokeWidth={2} style={{ marginRight: 4 }} />Draft</>}
                              </span>
                            </td>
                            <td className="admin__td-num">{r.downloads.toLocaleString()}</td>
                            <td>
                              <Star size={12} fill="currentColor" strokeWidth={0} aria-hidden="true" style={{ verticalAlign: 'middle', color: '#f59e0b', marginRight: 3 }} />
                              {liveRating}
                              {reviewCount > 0 && (
                                <span style={{ marginLeft: '0.3rem', fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                                  +{reviewCount}
                                </span>
                              )}
                            </td>
                            <td className="admin__td-muted">{r.uploadDate}</td>
                            <td>
                            <div className="admin__row-actions">
                              <ActionBtn
                                Icon={Eye}
                                label={`Preview ${r.title}`}
                                tooltip="View resource"
                                onClick={() => setPreviewResource(r)}
                              />
                              <ActionBtn
                                Icon={Pencil}
                                label={`Edit ${r.title}`}
                                tooltip="Edit resource"
                                onClick={() => setEditResource(r)}
                              />
                              <ActionBtn
                                Icon={r.status === 'published' ? EyeOff : Globe}
                                label={r.status === 'published' ? `Set ${r.title} to draft` : `Publish ${r.title}`}
                                tooltip={r.status === 'published' ? 'Set to Draft' : 'Publish'}
                                variant={r.status === 'published' ? 'toggle' : 'toggle-active'}
                                onClick={() => toggleStatus(r.id)}
                              />
                              <ActionBtn
                                Icon={Trash2}
                                label={`Delete ${r.title}`}
                                tooltip="Delete resource"
                                variant="danger"
                                onClick={() => setConfirmDelete({ id: r.id, title: r.title })}
                              />
                            </div>
                            </td>
                          </tr>
                          );
                        })
                  }
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ── UPLOAD ── */}
        {activeSection === 'upload' && (
          <section className="admin__section">
            <AdminPageHeader
              title="Upload New Resource"
              subtitle="Add a new document to the ReadSpace library"
            />

            <form className="admin__upload-form" onSubmit={handleUpload} noValidate>
              <p className="admin__form-section-heading">Basic Information</p>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label admin__form-group-label">Resource Title <span className="required">*</span></label>
                  <input
                    id="upload-title"
                    className={`form-input${uploadErrors.title ? ' form-input--error' : ''}`}
                    placeholder="e.g. Linear Algebra Done Right"
                    value={uploadForm.title}
                    onChange={e => setUploadForm(f => ({ ...f, title: e.target.value }))}
                    aria-invalid={!!uploadErrors.title}
                    aria-describedby={uploadErrors.title ? 'upload-title-error' : undefined}
                  />
                  {uploadErrors.title && <span id="upload-title-error" className="form-error">{uploadErrors.title}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label admin__form-group-label">Author(s) <span className="required">*</span></label>
                  <input
                    id="upload-author"
                    className={`form-input${uploadErrors.author ? ' form-input--error' : ''}`}
                    placeholder="e.g. Sheldon Axler"
                    value={uploadForm.author}
                    onChange={e => setUploadForm(f => ({ ...f, author: e.target.value }))}
                    aria-invalid={!!uploadErrors.author}
                    aria-describedby={uploadErrors.author ? 'upload-author-error' : undefined}
                  />
                  {uploadErrors.author && <span id="upload-author-error" className="form-error">{uploadErrors.author}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label admin__form-group-label">Category</label>
                  <Select
                    value={uploadForm.category}
                    onChange={v => setUploadForm(f => ({...f, category: v}))}
                    options={[
                      {value:'textbooks', label:'Textbook'},
                      {value:'research',  label:'Research Paper'},
                      {value:'guides',    label:'Study Guide'},
                      {value:'tutorials', label:'Tutorial'},
                    ]}
                    label="Category"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label admin__form-group-label">Publication Year</label>
                  <input className="form-input" type="number" min="1900" max="2030" value={uploadForm.year} onChange={e => setUploadForm(f => ({ ...f, year: e.target.value }))} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label admin__form-group-label">Tags <span className="form-hint">(comma-separated)</span></label>
                  <input className="form-input" placeholder="e.g. algebra, mathematics, beginner" value={uploadForm.tags} onChange={e => setUploadForm(f => ({ ...f, tags: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label admin__form-group-label">Status</label>
                  <Select
                    value={uploadForm.status}
                    onChange={v => setUploadForm(f => ({...f, status: v}))}
                    options={[
                      {value:'draft',     label:'Draft (hidden)'},
                      {value:'published', label:'Published (live)'},
                    ]}
                    label="Status"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label admin__form-group-label">Description <span className="required">*</span></label>
                <textarea
                  id="upload-description"
                  className={`form-input form-textarea${uploadErrors.description ? ' form-input--error' : ''}`}
                  rows={4}
                  placeholder="Brief description of the resource…"
                  value={uploadForm.description}
                  onChange={e => setUploadForm(f => ({ ...f, description: e.target.value }))}
                  aria-invalid={!!uploadErrors.description}
                  aria-describedby={uploadErrors.description ? 'upload-description-error' : undefined}
                />
                {uploadErrors.description && <span id="upload-description-error" className="form-error">{uploadErrors.description}</span>}
              </div>

              <p className="admin__form-section-heading">File & Media</p>
              <div className="form-group">
                <label className="form-label admin__form-group-label">Upload File</label>
                <div 
                  className={`admin__file-drop${dragActive ? ' admin__file-drop--active' : ''}${selectedFile ? ' admin__file-drop--selected' : ''}`}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                >
                  <span>{selectedFile ? <CheckCircle size={36} strokeWidth={1.5} className="admin__file-drop-icon success" aria-hidden="true" /> : <FolderOpen size={36} strokeWidth={1.5} className="admin__file-drop-icon" aria-hidden="true" />}</span>
                  {selectedFile ? (
                    <span className="admin__file-name">Selected: <strong>{selectedFile.name}</strong></span>
                  ) : (
                    <span>Drag &amp; drop <strong>PDF</strong> or <strong>EPUB</strong> here</span>
                  )}
                  <span className="admin__file-hint">
                    {selectedFile ? (
                      <button type="button" className="admin__file-remove" onClick={() => setSelectedFile(null)}>Change file</button>
                    ) : (
                      <>or <label className="admin__file-browse">browse files<input type="file" className="admin__file-input" accept=".pdf,.epub" onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])} /></label></>
                    )}
                  </span>
                  <span className="admin__file-hint">Max file size: 25 MB</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label admin__form-group-label">Thumbnail URL <span className="form-hint">(optional)</span></label>
                <input 
                  className="form-input" 
                  type="url" 
                  placeholder="https://example.com/cover.jpg" 
                  value={uploadForm.thumbnail || ''} 
                  onChange={e => setUploadForm(f => ({ ...f, thumbnail: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label admin__form-group-label">External PDF/Resource Link <span className="form-hint">(alternative to file upload)</span></label>
                <input 
                  className="form-input" 
                  type="url" 
                  placeholder="https://example.com/resource.pdf" 
                  value={uploadForm.externalUrl} 
                  onChange={e => setUploadForm(f => ({ ...f, externalUrl: e.target.value }))}
                />
              </div>

              <div className="admin__upload-footer">
                <button type="button" className="btn btn--outline" onClick={() => { setUploadForm(INITIAL_UPLOAD); setUploadErrors({}); }}>Reset</button>
                <button type="submit" className="btn btn--primary btn--lg" disabled={uploadLoading}>
                  {uploadLoading ? <span className="admin__spinner" /> : <Upload size={15} strokeWidth={2} style={{ display: 'inline', verticalAlign: 'middle' }} />}
                  {' '}{uploadLoading ? 'Uploading…' : 'Upload Resource'}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* ── USERS ── */}
        {activeSection === 'users' && (
          <section className="admin__section">
            <AdminPageHeader
              title="User Management"
              subtitle={`${users.length} users · ${users.filter(u => u.status === 'active').length} active`}
            >
              <div className="admin__section-actions">
                <input
                  className="admin__search-input form-input"
                  placeholder="Search users…"
                  value={usrSearch}
                  onChange={e => setUsrSearch(e.target.value)}
                />
              </div>
            </AdminPageHeader>

            <div className="admin__table-wrap">
              <table className="admin__table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Downloads</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersLoading
                    ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={7} />)
                    : filteredUsers.length === 0
                      ? (
                        <tr>
                          <td colSpan={7}>
                            <EmptyState icon={<UserX size={28} strokeWidth={1.5} aria-hidden="true" />} title="No users found" sub="Try a different search." />
                          </td>
                        </tr>
                      )
                      : filteredUsers.map(u => (
                        <tr key={u.id} className={u.status === 'inactive' ? 'admin__row--disabled' : ''}>
                          <td>
                            <div className="admin__table-user">
                              <div className="admin__user-avatar">{u.name.charAt(0)}</div>
                              <span>{u.name}</span>
                            </div>
                          </td>
                          <td className="admin__td-muted">{u.email}</td>
                          <td>
                            <Select
                              value={u.role}
                              onChange={role => changeRole(u.id, role)}
                              options={[
                                {value:'student', label:'Student'},
                                {value:'faculty', label:'Faculty'},
                                {value:'admin',   label:'Admin'},
                              ]}
                              label={`Role for ${u.name}`}
                              size="sm"
                            />
                          </td>
                          <td className="admin__td-muted">{u.joined}</td>
                          <td className="admin__td-num">{u.downloads}</td>
                          <td><span className={`status-tag status-tag--${u.status}`}>{u.status}</span></td>
                          <td>
                            <button
                                className={`admin__action-btn${u.status === 'active' ? ' admin__action-btn--danger' : ' admin__action-btn--success'}`}
                                title={u.status === 'active' ? 'Disable account' : 'Enable account'}
                                aria-label={u.status === 'active' ? `Disable ${u.name}` : `Enable ${u.name}`}
                                data-tip={u.status === 'active' ? 'Disable account' : 'Enable account'}
                                onClick={() => toggleUserStatus(u.id)}
                              >
                                {u.status === 'active'
                                  ? <EyeOff size={15} strokeWidth={2} />
                                  : <CheckCircle size={15} strokeWidth={2} />}
                            </button>
                          </td>
                        </tr>
                      ))
                  }
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ── ANALYTICS ── */}
        {activeSection === 'analytics' && (
          <section className="admin__section">
            <AdminPageHeader
              title="Analytics"
              subtitle="Usage trends and content performance"
            />

            <div className="admin__stats-grid">
              <StatCard Icon={ArrowDownToLine} label="Total Downloads" value={(summaryStats?.totalDownloads || 0).toLocaleString()} delta="All time" color="#1a56db" />
              <StatCard Icon={Users}           label="Total Users"     value={summaryStats?.totalUsers ?? '—'} delta="Registered accounts" color="#10b981" />
              <StatCard Icon={BookOpen}        label="Resources"       value={summaryStats?.totalResources ?? '—'} delta="Library size" color="#f59e0b" />
              <StatCard Icon={Star}            label="Total Reviews"   value={summaryStats?.totalReviews ?? '0'} delta="Community feedback" color="#8b5cf6" />
            </div>

            <div className="admin__chart-card">
              <h3 className="admin__chart-title">Monthly Download Trend</h3>
              <div className="admin__bar-chart">
                {(summaryStats?.monthlyDownloads || ANALYTICS.monthlyDownloads).map(d => (
                  <div key={d.month} className="admin__bar-col">
                    <span className="admin__bar-value">{d.value > 1000 ? `${(d.value / 1000).toFixed(1)}k` : d.value}</span>
                    <div
                      className="admin__bar"
                      style={{ height: `${(d.value / (Math.max(...(summaryStats?.monthlyDownloads || ANALYTICS.monthlyDownloads).map(m => m.value)) || 14000)) * 140}px` }}
                      title={`${d.month}: ${d.value.toLocaleString()}`}
                    />
                    <span className="admin__bar-label">{d.month}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="admin__chart-card">
              <h3 className="admin__chart-title">Downloads by Category</h3>
              <div className="admin__cat-breakdown">
                {(summaryStats?.categoryBreakdown || catBreakdown).map(c => (
                  <div key={c.label} className="admin__cat-row">
                    <div className="admin__cat-meta">
                      <span className="admin__cat-label">{c.label}</span>
                      <span className="admin__cat-count">{c.count} resources · {c.pct}%</span>
                    </div>
                    <div className="admin__cat-bar-bg">
                      <div className="admin__cat-bar-fill" style={{ width: `${c.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── SETTINGS ── */}
        {activeSection === 'settings' && (
          <section className="admin__section">
            <AdminPageHeader
              title="Platform Settings"
              subtitle="Configure global ReadSpace behaviour"
            />

            <form className="admin__upload-form" onSubmit={e => { e.preventDefault(); showToast('Settings saved.'); }} style={{ maxWidth: 560 }}>
              <p className="admin__form-section-heading">General</p>

              <div className="form-group">
                <label className="form-label admin__form-group-label">Site Name</label>
                <input className="form-input" value={settings.siteName} onChange={e => setSettings(s => ({ ...s, siteName: e.target.value }))} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label admin__form-group-label">Max Upload Size (MB)</label>
                  <input className="form-input" type="number" min="1" max="500" value={settings.maxFileSize} onChange={e => setSettings(s => ({ ...s, maxFileSize: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label admin__form-group-label">Default Category</label>
                  <Select
                    value={settings.defaultCategory}
                    onChange={v => setSettings(s => ({...s, defaultCategory: v}))}
                    options={[
                      {value:'textbooks', label:'Textbooks'},
                      {value:'research',  label:'Research Papers'},
                      {value:'guides',    label:'Study Guides'},
                      {value:'tutorials', label:'Tutorials'},
                    ]}
                    label="Default category"
                  />
                </div>
              </div>

              <p className="admin__form-section-heading">Access Control</p>

              <div className="admin__toggle-row">
                <div>
                  <div className="admin__toggle-label">Maintenance Mode</div>
                  <div className="admin__toggle-sub">Show a maintenance page to non-admin visitors</div>
                </div>
                <label className="admin__switch">
                  <input type="checkbox" checked={settings.maintenanceMode} onChange={e => setSettings(s => ({ ...s, maintenanceMode: e.target.checked }))} />
                  <span className="admin__switch-track" />
                </label>
              </div>

              <div className="admin__toggle-row">
                <div>
                  <div className="admin__toggle-label">Allow New Registrations</div>
                  <div className="admin__toggle-sub">Let new users create accounts</div>
                </div>
                <label className="admin__switch">
                  <input type="checkbox" checked={settings.allowRegistrations} onChange={e => setSettings(s => ({ ...s, allowRegistrations: e.target.checked }))} />
                  <span className="admin__switch-track" />
                </label>
              </div>

              <div className="admin__upload-footer">
                <button type="submit" className="btn btn--primary">Save Settings</button>
              </div>
            </form>
          </section>
        )}
        {/* ── RATINGS & REVIEWS ── */}
        {activeSection === 'reviews' && (() => {
          // Build resource lookup: id -> title
          const resourceMap = Object.fromEntries(resources.map(r => [r.id, r.title]));

          // Apply filters
          const filtered = allReviews
            .filter(rv => {
              const matchResource = rvResourceFilter === 'all' || rv.resourceId === Number(rvResourceFilter);
              const matchStar     = rvStarFilter === 0 || rv.rating === rvStarFilter;
              const q = rvSearch.toLowerCase();
              const matchSearch   = !q ||
                (rv.userName || '').toLowerCase().includes(q) ||
                (rv.comment || '').toLowerCase().includes(q) ||
                (resourceMap[rv.resourceId] ?? '').toLowerCase().includes(q);
              return matchResource && matchStar && matchSearch;
            })
            .sort((a, b) => {
              if (rvSort === 'oldest')  return a.id - b.id;
              if (rvSort === 'highest') return b.rating - a.rating || b.id - a.id;
              if (rvSort === 'lowest')  return a.rating - b.rating || b.id - a.id;
              return b.id - a.id; // newest
            });

          // Per-star breakdown for distribution chart
          const totalCount = allReviews.length;
          const starCounts = [5, 4, 3, 2, 1].map(s => ({
            star: s,
            count: allReviews.filter(r => r.rating === s).length,
            pct: totalCount ? Math.round((allReviews.filter(r => r.rating === s).length / totalCount) * 100) : 0,
          }));

          // Color for card accent border by rating
          const ratingColor = (r) => r >= 4 ? '#10b981' : r === 3 ? '#f59e0b' : '#ef4444';

          const SORT_OPTIONS = [
            { value: 'newest',  label: 'Newest first' },
            { value: 'oldest',  label: 'Oldest first' },
            { value: 'highest', label: 'Highest rated' },
            { value: 'lowest',  label: 'Lowest rated' },
          ];

          const handleDeleteReview = async (reviewId, reviewerName) => {
            try {
              const response = await axios.delete(`${import.meta.env.VITE_API_URL}/api/reviews/${reviewId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              fetchReviews();
              showToast(`Review by "${reviewerName}" removed.`, 'error');
              addActivity(`Review by "${reviewerName}" removed by admin`, 'delete', 'warning');
            } catch (err) {
              console.error("Failed to delete review", err);
              showToast('Failed to delete review', 'error');
            }
          };

          return (
            <section className="admin__section">
              <AdminPageHeader
                title="Ratings & Reviews"
                subtitle={`${allReviews.length} user-submitted review${allReviews.length !== 1 ? 's' : ''} across all resources`}
              />

              {/* ── Summary row: totals + distribution ── */}
              <div className="admin__rv-overview">
                {/* Stat pills */}
                <div className="admin__rv-pills">
                  <div className="admin__rv-pill">
                    <span className="admin__rv-pill-number">{allReviews.length}</span>
                    <span className="admin__rv-pill-label">Total Reviews</span>
                  </div>
                  <div className="admin__rv-pill">
                    <span className="admin__rv-pill-number">
                      {globalStats.avgRating
                        ? <>{globalStats.avgRating}&thinsp;<Star size={14} fill="currentColor" strokeWidth={0} style={{ color: '#f59e0b', verticalAlign: 'middle' }} /></>
                        : '—'}
                    </span>
                    <span className="admin__rv-pill-label">Avg Rating</span>
                  </div>
                  <div className="admin__rv-pill">
                    <span className="admin__rv-pill-number">
                      {new Set(allReviews.map(r => r.resourceId)).size}
                    </span>
                    <span className="admin__rv-pill-label">Resources Rated</span>
                  </div>
                  <div className="admin__rv-pill">
                    <span className="admin__rv-pill-number" style={{ color: '#10b981' }}>
                      {allReviews.filter(r => r.rating >= 4).length}
                    </span>
                    <span className="admin__rv-pill-label">Positive (4–5★)</span>
                  </div>
                </div>

                {/* Rating distribution chart */}
                {totalCount > 0 && (
                  <div className="admin__rv-dist">
                    <div className="admin__rv-dist-title">Rating Distribution</div>
                    {starCounts.map(({ star, count, pct }) => (
                      <button
                        key={star}
                        className={`admin__rv-dist-row${rvStarFilter === star ? ' active' : ''}`}
                        onClick={() => setRvStarFilter(rvStarFilter === star ? 0 : star)}
                        aria-label={`Filter by ${star} stars (${count} reviews)`}
                      >
                        <span className="admin__rv-dist-stars">
                          {[1,2,3,4,5].map(n => (
                            <Star key={n} size={10} strokeWidth={0} fill={n <= star ? 'currentColor' : 'none'}
                              style={{ color: n <= star ? '#f59e0b' : 'var(--color-border)' }} />
                          ))}
                        </span>
                        <div className="admin__rv-dist-bar-wrap">
                          <div className="admin__rv-dist-bar" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="admin__rv-dist-count">{count}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Filter toolbar ── */}
              <div className="admin__rv-toolbar">
                <div className="admin__rv-search-wrap">
                  <Search size={15} className="admin__rv-search-icon" aria-hidden="true" />
                  <input
                    className="admin__rv-search form-input"
                    placeholder="Search reviewer, resource or keyword…"
                    value={rvSearch}
                    onChange={e => setRvSearch(e.target.value)}
                    aria-label="Search reviews"
                  />
                </div>
                <select
                  className="admin__rv-resource-select form-input"
                  value={rvResourceFilter}
                  onChange={e => setRvResourceFilter(e.target.value)}
                  aria-label="Filter by resource"
                >
                  <option value="all">All Resources</option>
                  {resources.map(r => (
                    <option key={r.id} value={r.id}>{r.title}</option>
                  ))}
                </select>
                <select
                  className="admin__rv-sort-select form-input"
                  value={rvSort}
                  onChange={e => setRvSort(e.target.value)}
                  aria-label="Sort reviews"
                >
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                {(rvSearch || rvResourceFilter !== 'all' || rvStarFilter !== 0) && (
                  <button
                    className="btn btn--secondary btn--sm"
                    onClick={() => { setRvSearch(''); setRvResourceFilter('all'); setRvStarFilter(0); }}
                  >
                    <X size={13} aria-hidden="true" /> Clear
                  </button>
                )}
              </div>

              {/* Result count */}
              {allReviews.length > 0 && (
                <p className="admin__rv-result-count">
                   Showing <strong>{filtered.length}</strong> of <strong>{allReviews.length}</strong> reviews
                </p>
              )}

              {/* ── Reviews list ── */}
              {reviewsLoading ? (
                 <div className="admin__rv-list">
                    {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton skeleton--review" style={{ height: 100, marginBottom: 15 }} />)}
                 </div>
              ) : filtered.length === 0 ? (
                <EmptyState
                  icon={<MessageSquare size={32} strokeWidth={1.5} aria-hidden="true" />}
                  title={allReviews.length === 0 ? 'No user reviews yet' : 'No reviews match your filters'}
                  sub={allReviews.length === 0
                    ? 'Reviews submitted by students will appear here.'
                    : 'Try adjusting the search or filter.'
                  }
                />
              ) : (
                <div className="admin__rv-list">
                  {filtered.map(rv => (
                    <div
                      key={rv.id}
                      className="admin__rv-card"
                      style={{ borderLeftColor: ratingColor(rv.rating) }}
                    >
                      <div className="admin__rv-card-header">
                        <div className="admin__rv-avatar" style={{ background: '#4f46e5' }}>
                          {(rv.userName || 'U').charAt(0)}
                        </div>
                        <div className="admin__rv-meta">
                          <span className="admin__rv-name">{rv.userName}</span>
                          <span className="admin__rv-resource">
                            <BookOpen size={11} aria-hidden="true" />
                            {resourceMap[rv.resourceId] || 'Unknown Resource'}
                          </span>
                        </div>
                        <div className="admin__rv-stars">
                          {[1,2,3,4,5].map(n => (
                            <Star
                              key={n}
                              size={14}
                              strokeWidth={1.5}
                              fill={n <= rv.rating ? 'currentColor' : 'none'}
                              aria-hidden="true"
                              style={{ color: n <= rv.rating ? '#f59e0b' : 'var(--color-border)' }}
                            />
                          ))}
                          <span
                            className="admin__rv-score-badge"
                            style={{
                              background: ratingColor(rv.rating) + '20',
                              color: ratingColor(rv.rating),
                            }}
                          >
                            {rv.rating}.0
                          </span>
                        </div>
                        <span className="admin__rv-date">{rv.createdAt ? new Date(rv.createdAt).toLocaleDateString() : 'Recently'}</span>
                        <button
                          className="admin__action-btn admin__action-btn--danger"
                          onClick={() => handleDeleteReview(rv.id, rv.userName)}
                          aria-label={`Delete review by ${rv.userName}`}
                        >
                          <Trash2 size={14} strokeWidth={2} />
                        </button>
                      </div>
                      {rv.comment && <p className="admin__rv-text">{rv.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })()}

        </Motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
