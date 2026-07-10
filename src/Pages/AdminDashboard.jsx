import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const ADMIN_EMAIL = 'danispringveldt@gmail.com';
const API_BASE = import.meta.env.VITE_API_URL || 'https://clientapi-production-afc7.up.railway.app';

// ─── API helpers ─────────────────────────────────────────────────────────────

const apiFetch = async (path, options = {}) => {
  const token = localStorage.getItem('authToken');
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `HTTP ${res.status}`);
  }
  return res.json();
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ label, value, accent }) {
  return (
    <div className={`adm-stat-card${accent ? ' adm-stat-card--accent' : ''}`}>
      <span className="adm-stat-value">{value ?? '—'}</span>
      <span className="adm-stat-label">{label}</span>
    </div>
  );
}

function TabBar({ tabs, active, onChange }) {
  return (
    <div className="adm-tabbar">
      {tabs.map(t => (
        <button
          key={t.id}
          className={`adm-tab${active === t.id ? ' adm-tab--active' : ''}`}
          onClick={() => onChange(t.id)}
          type="button"
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function Badge({ type }) {
  const map = {
    comparison:   { label: 'Compare',  cls: 'badge--compare' },
    vehicle_view: { label: 'View',     cls: 'badge--view'    },
    search:       { label: 'Search',   cls: 'badge--search'  },
  };
  const { label, cls } = map[type] || { label: type || 'Event', cls: '' };
  return <span className={`adm-badge ${cls}`}>{label}</span>;
}

function SearchesTable({ rows, loading, error }) {
  if (loading) return <div className="adm-state">Loading searches…</div>;
  if (error)   return <div className="adm-state adm-state--error">{error}</div>;
  if (!rows.length) return <div className="adm-state">No search events yet.</div>;

  return (
    <div className="adm-table-wrap">
      <table className="adm-table">
        <thead>
          <tr>
            <th>When</th>
            <th>Type</th>
            <th>Event</th>
            <th>User ID</th>
            <th>IP</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.searchId}>
              <td className="adm-td-mono">{new Date(row.createdAt).toLocaleString('en-ZA')}</td>
              <td><Badge type={row.filter?.type} /></td>
              <td className="adm-td-term">{row.searchTerm}</td>
              <td className="adm-td-mono adm-td-uid">{row.userId}</td>
              <td className="adm-td-mono">{row.ipAddress || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UsersTable({ rows, loading, error, onDeleteUser, onToggleRole }) {
  if (loading) return <div className="adm-state">Loading users…</div>;
  if (error)   return <div className="adm-state adm-state--error">{error}</div>;
  if (!rows.length) return <div className="adm-state">No users found.</div>;

  return (
    <div className="adm-table-wrap">
      <table className="adm-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Name</th>
            <th>Role</th>
            <th>Provider</th>
            <th>Joined</th>
            <th>Last seen</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((u) => (
            <tr key={u.userId}>
              <td>{u.email}</td>
              <td>{[u.name, u.surname].filter(Boolean).join(' ') || '—'}</td>
              <td>
                <span className={`adm-role${u.role === 'admin' ? ' adm-role--admin' : ''}`}>
                  {u.role || 'user'}
                </span>
              </td>
              <td>{u.provider}</td>
              <td className="adm-td-mono">{u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-ZA') : '—'}</td>
              <td className="adm-td-mono">{u.lastSignInAt ? new Date(u.lastSignInAt).toLocaleDateString('en-ZA') : '—'}</td>
              <td>
                <div className="adm-actions">
                  <button
                    className="adm-btn adm-btn--sm adm-btn--ghost"
                    onClick={() => onToggleRole(u)}
                    type="button"
                    title={u.role === 'admin' ? 'Demote to user' : 'Promote to admin'}
                  >
                    {u.role === 'admin' ? '↓ User' : '↑ Admin'}
                  </button>
                  {u.email !== ADMIN_EMAIL && (
                    <button
                      className="adm-btn adm-btn--sm adm-btn--danger"
                      onClick={() => onDeleteUser(u)}
                      type="button"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main dashboard ──────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const navigate = useNavigate();
  // ── Auth gate — synchronous localStorage read, no effect needed ──────────
  const authorized = useMemo(() => {
    const email  = localStorage.getItem('username') || '';
    const userId = localStorage.getItem('userId')   || '';
    return Boolean(userId && email.toLowerCase() === ADMIN_EMAIL.toLowerCase());
  }, []);

  // Tab state
  const [activeTab, setActiveTab] = useState('overview');

  // Search events
  const [searches, setSearches]         = useState([]);
  const [searchTotal, setSearchTotal]   = useState(0);
  const [searchPage, setSearchPage]     = useState(0);
  const [searchFilter, setSearchFilter] = useState('all'); // all | comparison | vehicle_view | search
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError]   = useState('');

  // Users
  const [users, setUsers]           = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch searches ─────────────────────────────────────────────────────────
  const fetchSearches = useCallback(async (page = 0, typeFilter = 'all') => {
    setSearchLoading(true);
    setSearchError('');
    try {
      const limit = 20;
      const offset = page * limit;
      let url = `/api/admin/searches?limit=${limit}&offset=${offset}`;
      if (typeFilter !== 'all') url += `&searchTerm=`;

      const data = await apiFetch(url);

      // Client-side filter by type since the API filters by searchTerm
      const filtered = typeFilter === 'all'
        ? data.searches
        : data.searches.filter(s => s.filter?.type === typeFilter);

      setSearches(filtered);
      setSearchTotal(data.total);
    } catch (e) {
      setSearchError(e.message);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // ── Fetch users ────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError('');
    try {
      const data = await apiFetch('/api/admin/users?limit=100');
      setUsers(data.users);
    } catch (e) {
      setUsersError(e.message);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authorized) return;
    let cancelled = false;
    (async () => {
      if (!cancelled) await fetchSearches(searchPage, searchFilter);
    })();
    return () => { cancelled = true; };
  }, [authorized, searchPage, searchFilter, fetchSearches]);

  useEffect(() => {
    if (!authorized || activeTab !== 'users') return;
    let cancelled = false;
    (async () => {
      if (!cancelled) await fetchUsers();
    })();
    return () => { cancelled = true; };
  }, [authorized, activeTab, fetchUsers]);

  // ── User actions ───────────────────────────────────────────────────────────
  const handleToggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Set ${user.email} role to "${newRole}"?`)) return;
    try {
      await apiFetch(`/api/admin/users/${user.userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole }),
      });
      showToast(`${user.email} is now "${newRole}"`);
      fetchUsers();
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Permanently delete ${user.email}? This cannot be undone.`)) return;
    try {
      await apiFetch(`/api/admin/users/${user.userId}`, { method: 'DELETE' });
      showToast(`${user.email} deleted`);
      fetchUsers();
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  // ── Derived stats ──────────────────────────────────────────────────────────
  const allSearches = searches;
  const comparisons  = allSearches.filter(s => s.filter?.type === 'comparison');
  const views        = allSearches.filter(s => s.filter?.type === 'vehicle_view');
  const textSearches = allSearches.filter(s => s.filter?.type === 'search' || !s.filter?.type);

  // Top compared cars
  const comparisonCounts = {};
  comparisons.forEach(s => {
    (s.filter?.cars || []).forEach(c => {
      const key = `${c.brand} ${c.model}`;
      comparisonCounts[key] = (comparisonCounts[key] || 0) + 1;
    });
  });
  const topCompared = Object.entries(comparisonCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Top viewed
  const viewCounts = {};
  views.forEach(s => {
    const key = `${s.filter?.brand} ${s.filter?.model}`;
    viewCounts[key] = (viewCounts[key] || 0) + 1;
  });
  const topViewed = Object.entries(viewCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // ── Render states ──────────────────────────────────────────────────────────
  if (!authorized) {
    return (
      <div className="adm-gate">
        <div className="adm-gate-card">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#AB3636" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <h2>Access Denied</h2>
          <p>This page is restricted to the RevReview administrator.</p>
          <button className="adm-btn adm-btn--primary" onClick={() => navigate('/Home')} type="button">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'searches', label: `Events (${searchTotal})` },
    { id: 'users',    label: 'Users' },
  ];

  return (
    <div className="adm-root">
      {/* Header */}
      <header className="adm-header">
        <div className="adm-header-inner">
          <div className="adm-header-title">
            <span className="adm-header-eyebrow">RevReview</span>
            <h1 className="adm-header-h1">Admin Dashboard</h1>
          </div>
          <button className="adm-btn adm-btn--ghost" onClick={() => navigate('/Home')} type="button">
            ← Back to site
          </button>
        </div>
        <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />
      </header>

      <main className="adm-main">

        {/* ── Overview tab ── */}
        {activeTab === 'overview' && (
          <div className="adm-section">
            <div className="adm-stat-grid">
              <StatCard label="Total events"      value={searchTotal}        accent />
              <StatCard label="Comparisons"       value={comparisons.length} />
              <StatCard label="Vehicle views"     value={views.length}       />
              <StatCard label="Text searches"     value={textSearches.length}/>
              <StatCard label="Registered users"  value={users.length || '—'}/>
            </div>

            <div className="adm-two-col">
              <div className="adm-panel">
                <h2 className="adm-panel-title">🔥 Most Compared Cars</h2>
                {topCompared.length === 0
                  ? <p className="adm-empty">No comparisons tracked yet.</p>
                  : (
                    <ol className="adm-rank-list">
                      {topCompared.map(([name, count]) => (
                        <li key={name} className="adm-rank-item">
                          <span className="adm-rank-name">{name}</span>
                          <span className="adm-rank-count">{count}×</span>
                        </li>
                      ))}
                    </ol>
                  )
                }
              </div>

              <div className="adm-panel">
                <h2 className="adm-panel-title">👁 Most Viewed Vehicles</h2>
                {topViewed.length === 0
                  ? <p className="adm-empty">No vehicle views tracked yet.</p>
                  : (
                    <ol className="adm-rank-list">
                      {topViewed.map(([name, count]) => (
                        <li key={name} className="adm-rank-item">
                          <span className="adm-rank-name">{name}</span>
                          <span className="adm-rank-count">{count}×</span>
                        </li>
                      ))}
                    </ol>
                  )
                }
              </div>
            </div>
          </div>
        )}

        {/* ── Events tab ── */}
        {activeTab === 'searches' && (
          <div className="adm-section">
            <div className="adm-toolbar">
              <span className="adm-toolbar-label">Filter by type:</span>
              {['all', 'comparison', 'vehicle_view', 'search'].map(f => (
                <button
                  key={f}
                  type="button"
                  className={`adm-filter-btn${searchFilter === f ? ' active' : ''}`}
                  onClick={() => { setSearchFilter(f); setSearchPage(0); }}
                >
                  {f === 'all' ? 'All' : f === 'vehicle_view' ? 'Views' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
              <button
                className="adm-btn adm-btn--ghost adm-ml-auto"
                onClick={() => fetchSearches(searchPage, searchFilter)}
                type="button"
              >
                ↻ Refresh
              </button>
            </div>

            <SearchesTable rows={searches} loading={searchLoading} error={searchError} />

            <div className="adm-pagination">
              <button
                className="adm-btn adm-btn--ghost"
                disabled={searchPage === 0}
                onClick={() => setSearchPage(p => p - 1)}
                type="button"
              >
                ← Prev
              </button>
              <span className="adm-page-info">Page {searchPage + 1}</span>
              <button
                className="adm-btn adm-btn--ghost"
                disabled={searches.length < 20}
                onClick={() => setSearchPage(p => p + 1)}
                type="button"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* ── Users tab ── */}
        {activeTab === 'users' && (
          <div className="adm-section">
            <div className="adm-toolbar">
              <span className="adm-toolbar-label">{users.length} registered users</span>
              <button
                className="adm-btn adm-btn--ghost adm-ml-auto"
                onClick={fetchUsers}
                type="button"
              >
                ↻ Refresh
              </button>
            </div>
            <UsersTable
              rows={users}
              loading={usersLoading}
              error={usersError}
              onDeleteUser={handleDeleteUser}
              onToggleRole={handleToggleRole}
            />
          </div>
        )}
      </main>

      {/* Toast */}
      {toast && (
        <div className={`adm-toast adm-toast--${toast.type}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
