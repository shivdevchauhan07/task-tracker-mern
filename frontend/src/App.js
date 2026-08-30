import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { TaskProvider, useTaskContext } from './context/TaskContext';
import TaskForm from './components/TaskForm';
import KanbanBoard from './components/KanbanBoard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import { aiAPI } from './utils/api';
import './App.css';

const CATEGORY_ICONS = { Work: '💼', Personal: '👤', Study: '📚', Health: '💪', Finance: '💰', Shopping: '🛍️', Other: '📌' };
const CATEGORY_COLORS = { Work: '#7c3aed', Personal: '#ec4899', Study: '#06b6d4', Health: '#10b981', Finance: '#f59e0b', Shopping: '#f97316', Other: '#64748b' };
const PRIORITY_COLORS = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };
const STATUS_COLORS = { todo: '#7c3aed', 'in-progress': '#f59e0b', completed: '#10b981' };
const STATUS_LABELS = { todo: 'To Do', 'in-progress': 'In Progress', completed: 'Completed' };

function ListItem({ task, onEdit }) {
  const { updateTask, deleteTask } = useTaskContext();
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  return (
    <div className="list-item" style={{ borderLeft: `3px solid ${CATEGORY_COLORS[task.category] || '#7c3aed'}` }}>
      <div className="list-cat-icon" style={{ background: (CATEGORY_COLORS[task.category] || '#7c3aed') + '22' }}>
        {CATEGORY_ICONS[task.category] || '📌'}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: 'var(--text)', textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>{task.title}</p>
        {task.dueDate && <p style={{ margin: '3px 0 0', fontSize: 11, color: isOverdue ? 'var(--danger)' : 'var(--muted2)' }}>📅 {new Date(task.dueDate).toLocaleDateString()}{isOverdue ? ' · Overdue!' : ''}</p>}
      </div>
      <span className="list-status" style={{ background: (STATUS_COLORS[task.status] || '#7c3aed') + '22', color: STATUS_COLORS[task.status] || '#7c3aed' }}>
        {STATUS_LABELS[task.status]}
      </span>
      <button onClick={() => onEdit(task)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--muted2)' }}>✏️</button>
      <button onClick={() => deleteTask(task._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--muted)' }}>🗑️</button>
    </div>
  );
}

function StatsView({ tasks }) {
  const total = tasks.length;
  const done = tasks.filter(t => t.status === 'completed').length;
  const inProg = tasks.filter(t => t.status === 'in-progress').length;
  const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed').length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div>
      <div className="stats-grid">
        {[
          { label: 'Total Tasks', value: total, color: '#7c3aed', icon: '📋' },
          { label: 'Completed', value: done, color: '#10b981', icon: '✅' },
          { label: 'In Progress', value: inProg, color: '#f59e0b', icon: '▶️' },
          { label: 'Overdue', value: overdue, color: '#ef4444', icon: '⚠️' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ border: `1px solid ${s.color}33`, boxShadow: `0 0 20px ${s.color}11` }}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-num" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="progress-section">
        <div className="progress-header">
          <span className="progress-title">Overall Progress</span>
          <span className="progress-pct-text">{pct}%</span>
        </div>
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="cat-section">
        <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text)', marginBottom: 16 }}>Tasks by Category</div>
        {Object.keys(CATEGORY_ICONS).map(cat => {
          const count = tasks.filter(t => t.category === cat).length;
          if (!count) return null;
          return (
            <div key={cat} className="cat-row">
              <span className="cat-icon">{CATEGORY_ICONS[cat]}</span>
              <span className="cat-name">{cat}</span>
              <div className="cat-bar-bg">
                <div className="cat-bar-fill" style={{ width: `${(count / total) * 100}%`, background: CATEGORY_COLORS[cat] }} />
              </div>
              <span className="cat-count" style={{ color: CATEGORY_COLORS[cat] }}>{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ProfileView({ user, onUpdate, onClose }) {
  const { tasks } = useTaskContext();
  const total = tasks.length;
  const done = tasks.filter(t => t.status === 'completed').length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const circ = 2 * Math.PI * 45;

  return (
    <div style={{ maxWidth: 420, margin: '0 auto' }}>
      <div className="profile-banner">
        <div className="profile-avatar">{user.name?.charAt(0).toUpperCase()}</div>
        <div className="profile-name">{user.name}</div>
        <div className="profile-email">{user.email}</div>
        <div style={{ background: 'rgba(255,255,255,.15)', borderRadius: 16, padding: '12px 24px', display: 'inline-flex', alignItems: 'center', gap: 12 }}>
          <div style={{ position: 'relative', width: 60, height: 60 }}>
            <svg viewBox="0 0 100 100" style={{ width: 60, height: 60, transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="8" />
              <circle cx="50" cy="50" r="45" fill="none" stroke="#fff" strokeWidth="8"
                strokeDasharray={`${(pct / 100) * circ} ${circ}`} strokeLinecap="round" />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: '#fff' }}>{pct}%</div>
          </div>
          <div style={{ color: '#fff' }}>
            <div style={{ fontSize: 22, fontWeight: 900 }}>{done}/{total}</div>
            <div style={{ fontSize: 11, opacity: .8 }}>Tasks Done</div>
          </div>
        </div>
      </div>

      <div className="profile-stats-grid">
        {[
          { label: 'Total', value: total, color: '#7c3aed', icon: '📋' },
          { label: 'Completed', value: done, color: '#10b981', icon: '✅' },
          { label: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length, color: '#f59e0b', icon: '▶️' },
          { label: 'To Do', value: tasks.filter(t => t.status === 'todo').length, color: '#64748b', icon: '⏳' },
        ].map(s => (
          <div key={s.label} className="profile-stat" style={{ border: `1px solid ${s.color}33` }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--muted2)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="achievements-section">
        <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)', marginBottom: 16 }}>🏆 Achievements</div>
        {[
          { label: 'First Task Created', done: total > 0, icon: '🌟' },
          { label: '5 Tasks Completed', done: done >= 5, icon: '🔥' },
          { label: 'Task Master (10+ done)', done: done >= 10, icon: '👑' },
        ].map(a => (
          <div key={a.label} className="achievement-row" style={{ opacity: a.done ? 1 : .4 }}>
            <span style={{ fontSize: 24 }}>{a.icon}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: a.done ? 'var(--text)' : 'var(--muted)' }}>{a.label}</span>
            {a.done && <span style={{ marginLeft: 'auto', fontSize: 16 }}>✅</span>}
          </div>
        ))}
      </div>

      <button onClick={onClose} style={{ width: '100%', marginTop: 16, padding: 14, border: 'none', borderRadius: 16, background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
        Logout
      </button>
    </div>
  );
}

function TaskDashboard({ user, onLogout, onUpdateUser, darkMode, toggleDark }) {
  const { tasks, loading, fetchTasks, fetchStats, setFilters } = useTaskContext();
  const [view, setView] = useState('board');
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => { fetchTasks(); fetchStats(); }, []);

  useEffect(() => {
    if (tasks.length > 0 && !aiSummary) loadAISummary();
  }, [tasks.length]);

  const loadAISummary = async () => {
    setSummaryLoading(true);
    try {
      const { summary } = await aiAPI.summary(tasks);
      setAiSummary(summary);
    } catch (err) {
      setAiSummary('Keep going! You are doing great today. 💪🤖');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleEdit = (task) => { setEditTask(task); setShowForm(true); };
  const handleCloseForm = () => { setShowForm(false); setEditTask(null); fetchTasks(); fetchStats(); };

  const handleQuickFilter = (type) => {
    setActiveFilter(type);
    const map = { all: { status: '', priority: '' }, pending: { status: 'todo', priority: '' }, inprogress: { status: 'in-progress', priority: '' }, completed: { status: 'completed', priority: '' }, high: { priority: 'high', status: '' } };
    const f = map[type] || {};
    setFilters(f);
    fetchTasks(f);
  };

  const total = tasks.length;
  const done = tasks.filter(t => t.status === 'completed').length;
  const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed').length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const circ = 2 * Math.PI * 45;

  const filtered = tasks.filter(task => {
  if (!search) return true;

  const q = search.toLowerCase();

  return (
    task.title.toLowerCase().includes(q) ||
    task.description?.toLowerCase().includes(q) ||
    task.category?.toLowerCase().includes(q) ||
    task.priority?.toLowerCase().includes(q) ||
    task.status?.toLowerCase().includes(q)
  );
});

  const NAV = [
    { id: 'board', icon: '⊞', label: 'Board' },
    { id: 'list', icon: '☰', label: 'Tasks' },
    { id: 'stats', icon: '📊', label: 'Stats' },
    { id: 'profile', icon: '👤', label: 'Profile' },
  ];
 const greeting =
  new Date().getHours() < 12
    ? "Good Morning"
    : new Date().getHours() < 18
    ? "Good Afternoon"
    : "Good Evening";

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo-wrap">
          <div className="logo-icon">S</div>
          <div>
            <div className="logo-title">ShivTask AI</div>
            <div className="logo-sub">Plan • Track • Achieve</div>
          </div>
        </div>
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="header-btn" onClick={toggleDark}>{darkMode ? '☀️' : '🌙'}</button>
        <div className="notif-wrap">
          <button
  className="header-btn"
  title={`${overdue} overdue task${overdue !== 1 ? "s" : ""}`}
>
  {overdue > 0 ? "🔴" : "🔔"}
</button>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-add">+ Add Task</button>
      </header>

      <main className="main-content">
        {(view === 'board' || view === 'list') && (
          <div className="welcome-banner">
            <div className="welcome-inner">
              <div>
                <p className="welcome-tag">👋 Welcome back!</p>
                <h1 className="welcome-title">
  {greeting}, {user.name?.split(" ")[0]} 👋
</h1>
                <p className="welcome-sub">"Discipline today, success tomorrow."</p>
                <div className="welcome-stats">
                  {[{ label: 'Total', value: total, color: '#a78bfa' }, { label: 'Done', value: done, color: '#10b981' }, { label: 'Overdue', value: overdue, color: '#ef4444' }].map(s => (
                    <div key={s.label}>
                      <div className="welcome-stat-num" style={{ color: s.color }}>{s.value}</div>
                      <div className="welcome-stat-label">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="progress-ring-wrap">
                <svg viewBox="0 0 100 100" className="progress-ring">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="8" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="url(#grad)" strokeWidth="8"
                    strokeDasharray={`${(pct / 100) * circ} ${circ}`} strokeLinecap="round" />
                  <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#7c3aed" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="progress-ring-text">
                  <span className="progress-pct">{pct}%</span>
                  <span className="progress-label">COMPLETE</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {(aiSummary || summaryLoading) && (view === 'board' || view === 'list') && (
          <div className="ai-summary">
            <span className="ai-summary-icon">🤖</span>
            <p className="ai-summary-text">{summaryLoading ? 'ShivTask AI is analyzing your tasks...' : aiSummary}</p>
          </div>
        )}

        {(view === 'board' || view === 'list') && (
          <div className="quick-filters">
            {[{ id: 'all', label: '🗂 All' }, { id: 'pending', label: '⏳ Pending' }, { id: 'inprogress', label: '▶️ In Progress' }, { id: 'completed', label: '✅ Done' }, { id: 'high', label: '🔴 High Priority' }].map(f => (
              <button key={f.id} className={`quick-filter-btn ${activeFilter === f.id ? 'active' : ''}`} onClick={() => handleQuickFilter(f.id)}>{f.label}</button>
            ))}
          </div>
        )}

        {(view === 'board' || view === 'list' || view === 'stats') && (
          <div className="view-toggle">
            {[{ id: 'board', label: '⊞ Kanban' }, { id: 'list', label: '☰ List' }, { id: 'stats', label: '📊 Stats' }].map(v => (
              <button key={v.id} className={`view-btn ${view === v.id ? 'active' : ''}`} onClick={() => setView(v.id)}>{v.label}</button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="loading-state"><div className="spinner" /><p style={{ color: 'var(--muted2)' }}>Loading tasks...</p></div>
        ) : view === 'board' ? (
          <KanbanBoard onEdit={handleEdit} tasks={filtered} />
        ) : view === 'list' ? (
          filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon" style={{ fontSize: "72px" }}>
  🚀
</div>
              <div className="empty-title">No tasks found</div>
              <p style={{ color: 'var(--muted2)', marginBottom: 20 }}>Create your first task!</p>
              <button className="btn-add" onClick={() => setShowForm(true)}>+ Add Task</button>
            </div>
          ) : (
            <div>{filtered.map(task => <ListItem key={task._id} task={task} onEdit={handleEdit} />)}</div>
          )
        ) : view === 'stats' ? (
          <StatsView tasks={tasks} />
        ) : view === 'profile' ? (
          <ProfileView user={user} onUpdate={onUpdateUser} onClose={onLogout} />
        ) : null}
      </main>

      <nav className="bottom-nav">
        {NAV.map(item => (
          <button key={item.id} className={`nav-btn ${view === item.id ? 'active' : ''}`} onClick={() => setView(item.id)}>
            <span className="nav-btn-icon">{item.icon}</span>
            <span className="nav-btn-label">{item.label}</span>
            {view === item.id && <div className="nav-dot" />}
          </button>
        ))}
        <button className="fab" onClick={() => setShowForm(true)}>+</button>
      </nav>

      {showForm && <TaskForm task={editTask} onClose={handleCloseForm} />}

      <Toaster position="bottom-right" toastOptions={{
        style: { background: '#1a1a2e', color: '#fff', borderRadius: '12px', border: '1px solid #2a2a4a' }
      }} />
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(() => { const s = localStorage.getItem('user'); return s ? JSON.parse(s) : null; });
  const [page, setPage] = useState('login');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') !== 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const handleLogin = (u) => setUser(u);
  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null); };
  const toggleDark = () => setDarkMode(d => !d);

  if (!user) {
    if (page === 'login') return <Login onLogin={handleLogin} onGoRegister={() => setPage('register')} darkMode={darkMode} toggleDark={toggleDark} />;
    return <Register onLogin={handleLogin} onGoLogin={() => setPage('login')} darkMode={darkMode} toggleDark={toggleDark} />;
  }

  return (
    <TaskProvider>
      <TaskDashboard user={user} onLogout={handleLogout} onUpdateUser={setUser} darkMode={darkMode} toggleDark={toggleDark} />
    </TaskProvider>
  );
}