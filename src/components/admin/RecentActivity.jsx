import { useRef, useEffect } from 'react';
import {
  Upload, Pencil, Trash2, UserPlus, UserMinus, UserCheck,
  Users, Globe, EyeOff, Download, Info, RefreshCw, BookOpen,
} from 'lucide-react';
import './admin-components.css';

/* ── Icon + tint lookup ───────────────────────────────────── */
const ICON_MAP = {
  upload:        { Icon: Upload,    color: '#1a56db', bg: 'rgba(26,86,219,0.1)'  },
  edit:          { Icon: Pencil,    color: '#b45309', bg: 'rgba(180,83,9,0.1)'   },
  delete:        { Icon: Trash2,    color: '#dc2626', bg: 'rgba(220,38,38,0.1)'  },
  user_register: { Icon: UserPlus,  color: '#059669', bg: 'rgba(5,150,105,0.1)'  },
  user_enable:   { Icon: UserCheck, color: '#059669', bg: 'rgba(5,150,105,0.1)'  },
  user_disable:  { Icon: UserMinus, color: '#dc2626', bg: 'rgba(220,38,38,0.1)'  },
  role_change:   { Icon: Users,     color: '#1a56db', bg: 'rgba(26,86,219,0.1)'  },
  status_pub:    { Icon: Globe,     color: '#059669', bg: 'rgba(5,150,105,0.1)'  },
  status_draft:  { Icon: EyeOff,   color: '#b45309', bg: 'rgba(180,83,9,0.1)'   },
  download:      { Icon: Download,  color: '#6d28d9', bg: 'rgba(109,40,217,0.1)' },
  resource:      { Icon: BookOpen,  color: '#1a56db', bg: 'rgba(26,86,219,0.1)'  },
  default:       { Icon: Info,      color: '#475569', bg: 'rgba(71,85,105,0.1)'  },
};

const BADGE_MAP = {
  success: { label: 'Success', cls: 'adm-activity__badge--success' },
  error:   { label: 'Error',   cls: 'adm-activity__badge--error'   },
  warning: { label: 'Warning', cls: 'adm-activity__badge--warning'  },
  info:    null,
};

/* ── Single activity row ──────────────────────────────────── */
function ActivityItem({ act }) {
  const map = ICON_MAP[act.iconType] || ICON_MAP.default;
  const badge = BADGE_MAP[act.type] || null;

  return (
    <li
      className={`adm-activity__item${act.isNew ? ' adm-activity__item--new' : ''}`}
      role="listitem"
    >
      {/* Vertical connecting line + dot */}
      <div className="adm-activity__line" aria-hidden="true">
        <div className="adm-activity__dot" style={{ background: map.color }} />
      </div>

      {/* Content row */}
      <div className="adm-activity__content">
        <div
          className="adm-activity__icon-wrap"
          style={{ background: map.bg, color: map.color }}
          aria-hidden="true"
        >
          <map.Icon size={14} strokeWidth={2} />
        </div>

        <div className="adm-activity__body">
          <span className="adm-activity__text">{act.text}</span>
          <time className="adm-activity__time" dateTime={act.time}>{act.time}</time>
        </div>

        {badge && (
          <span className={`adm-activity__badge ${badge.cls}`} role="status">
            {badge.label}
          </span>
        )}
      </div>
    </li>
  );
}

/* ── Empty state ──────────────────────────────────────────── */
function EmptyActivity() {
  return (
    <div className="adm-activity__empty-state" role="status" aria-live="polite">
      <div className="adm-activity__empty-icon" aria-hidden="true">
        <RefreshCw size={22} strokeWidth={1.5} />
      </div>
      <p className="adm-activity__empty-text">No recent activity</p>
      <p className="adm-activity__empty-sub">Actions you take will appear here in real time.</p>
    </div>
  );
}

/* ── Main panel ───────────────────────────────────────────── */
export default function RecentActivity({ activities = [] }) {
  const listRef = useRef(null);
  const prevLen = useRef(activities.length);

  // Auto-scroll to top when a new item is prepended
  useEffect(() => {
    if (activities.length > prevLen.current && listRef.current) {
      listRef.current.scrollTop = 0;
    }
    prevLen.current = activities.length;
  }, [activities.length]);

  return (
    <section className="adm-activity" aria-label="Recent activity feed">
      {/* Header */}
      <div className="adm-activity__header">
        <div className="adm-activity__title-group">
          <h3 className="adm-activity__title">Recent Activity</h3>
          <span className="adm-activity__subtitle">Live operational feed</span>
        </div>
        {activities.length > 0 && (
          <span
            className="adm-activity__count"
            aria-label={`${activities.length} activity events`}
          >
            {activities.length}
          </span>
        )}
      </div>

      {/* Body */}
      {activities.length === 0 ? (
        <EmptyActivity />
      ) : (
        <ol
          ref={listRef}
          className="adm-activity__list"
          aria-label="Activity feed"
          aria-live="polite"
          aria-relevant="additions"
        >
          {activities.map(act => (
            <ActivityItem key={act.id} act={act} />
          ))}
        </ol>
      )}
    </section>
  );
}
