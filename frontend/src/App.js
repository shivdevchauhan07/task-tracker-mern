import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { TaskProvider, useTaskContext } from './context/TaskContext';
import TaskForm from './components/TaskForm';
import FilterBar from './components/FilterBar';
import StatsBar from './components/StatsBar';
import KanbanBoard from './components/KanbanBoard';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import { aiAPI } from './utils/api';
import './App.css';

const CATEGORY_ICONS = {
  Work: '💼', Personal: '👤', Study: '📚',
  Health: '💪', Finance: '💰', Shopping: '🛍️', Other: '📌'
};

const PRIORITY_COLORS = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };
const STATUS_COLORS = { todo: '#7c3aed', 'in-progress': '#f59e0b', completed: '#10b981' };
const STATUS_LABELS = { todo: 'To Do', 'in-progress': 'In Progress', completed: 'Completed' };

// ─── Task Card for List View ───
function TaskListItem({ task, onEdit }) {
  const { updateTask, deleteTask } = useTaskContext();
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  const cycleStatus = async () => {
    const next = { todo: 'in-progress', 'in-progress': 'completed', completed: 'todo' };
    await updateTask(task._id, { ...task, status: next[task.status] });
  };

  return (
    <div className="list-item">
      <span style={{ fontSize: 20 }}>{CATEGORY_ICONS[task.category] || '📌'}</span>
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: 'var(--text)', textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>{task.title}</p>
        {task.dueDate && (
          <p style={{ margin: '3px 0 0', fontSize: 11, color: isOverdue ? 'var(--danger)' : 'var(--text-muted)', fontWeight: isOverdue ? 700 : 400 }}>
            📅 {new Date(task.dueDate).toLocaleDateString()}{isOverdue ? ' · Overdue!' : ''}
          </p>
        )}
      </div>
      <span className="list-status-badge" style={{ background: STATUS_COLORS[task.status] + '22', color: STATUS_COLORS[task.status] }}>
        {STATUS_LABELS[task.status]}
      </span>
      <button onClick={() => onEdit(task)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text-muted)' }}>✏️</button>
      <button onClick={cycleStatus} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--primary-light)' }}>
        {task.status === 'completed' ? '↩' : '▶'}
      </button>
    </div>
  );
}

// ─── Stats View ───
function StatsView({ tasks }) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const todo = tasks.filter(t => t.status === 'todo').length;
  const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed').length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const byCategory = Object.keys(CATEGORY_ICONS).map(cat => ({
    cat, count: tasks.filter(t => t.category === cat).length, icon: CATEGORY_ICONS[cat]
  })).filter(c => c.count > 0).sort((a, b) => b.count - a.count);

  return (
    <div>
      <div className="stats-grid">
        {[
          { label: 'Total Tasks', value: total, color: 'var(--primary-light)' },
          { label: 'Completed', value: completed, color: '#10b981' },
          { label: 'In Progress', value: inProgress, color: '#f59e0b' },
          { label: 'Overdue', value: overdue, color: '#ef4444' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-num" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="stat-card" style={{ marginBottom: 12, padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontWeight: 700, fontSize: 15 }}>Overall Progress</span>
          <span style={{ fontWeight: 900, fontSize: 20, color: 'var(--primary-light)' }}>{pct}%</span>
        </div>
        <div style={{ background: 'var(--border)', borderRadius: 10, height: 10, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #7c3aed, #06b6d4)', borderRadius: 10, transition: 'width .5s ease' }} />
        </div>
      </div>

      {byCategory.length > 0 && (
        <div className="stat-card">
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14 }}>Tasks by Category</div>
          {byCategory.map(c => (
            <div key={c.cat} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 18, width: 28 }}>{c.icon}</span>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{c.cat}</span>
              <div style={{ width: 100, background: 'var(--border)', borderRadius: 10, height: 6, overflow: 'hidden' }}>
                <div style={{ width: `${(c.count / total) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #7c3aed, #06b6d4)', borderRadius: 10 }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', width: 20, textAlign: 'right' }}>{c.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main TaskDashboard ───
function TaskDashboard({ user, onLogout, onUpdateUser, darkMode, toggleDark }) {
  const { tasks, loading, fetchTasks, fetchStats, pagination, setFilters } = useTaskContext();
  const [view, setView] = useState('board');
  const [subView, setSubView] = useState('kanban');
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
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
      setAiSummary('Keep going! You are doing great. 💪');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleEdit = (task) => { setEditTask(task); setShowForm(true); };
  const handleCloseForm = () => { setShowForm(false); setEditTask(null); fetchTasks(); fetchStats(); };

  const handleQuickFilter = (type) => {
    setActiveFilter(type);
    const filterMap = {
      all: { status: '', priority: '' },
      pending: { status: 'todo', priority: '' },
      inprogress: { status: 'in-progress', priority: '' },
      completed: { status: 'completed', priority: '' },
      high: { priority: 'high', status: '' },
    };
    const f = filterMap[type] || {};
    setFilters(f);
    fetchTasks(f);
  };

  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed').length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const circ = 2 * Math.PI * 38;

  const filteredBySearch = tasks.filter(t =>
    !search || t.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="logo-wrap">
          <div className="logo-icon">S</div>
          <div className="logo-text">
            <div className="logo-title">ShivTask AI</div>
            <div className="logo-sub">Plan • Track • Achieve</div>
          </div>
        </div>

        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder="Search tasks..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <button className="header-btn" onClick={toggleDark}>{darkMode ? '☀️' : '🌙'}</button>

        <div className="notif-wrap">
          <button className="header-btn">🔔</button>
          {overdue > 0 && <span className="notif-badge">{overdue}</span>}
        </div>

        <button onClick={() => setShowProfile(true)} style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
          border: 'none', cursor: 'pointer', color: '#fff',
          fontWeight: 900, fontSize: 15, fontFamily: 'inherit'
        }}>{user.name?.charAt(0).toUpperCase()}</button>

        <button className="btn-add" onClick={() => setShowForm(true)}>+ Add Task</button>
      </header>

      <main className="main-content">
        {/* Welcome Banner */}
        <div className="welcome-banner">
          <div>
            <div className="welcome-title">Hello, {user.name?.split(' ')[0]} 👋</div>
            <div className="welcome-sub">Stay focused and get more things done.</div>
            <div className="welcome-stats">
              {[{ label: 'Total', value: total }, { label: 'Done', value: completed }, { label: 'Overdue', value: overdue }].map(s => (
                <div key={s.label} className="welcome-stat">
                  <div className="welcome-stat-num">{s.value}</div>
                  <div className="welcome-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="progress-ring-wrap">
            <svg viewBox="0 0 90 90" className="progress-ring">
              <circle cx="45" cy="45" r="38" fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="6" />
              <circle cx="45" cy="45" r="38" fill="none" stroke="#fff" strokeWidth="6"
                strokeDasharray={`${(pct / 100) * circ} ${circ}`} strokeLinecap="round" />
            </svg>
            <div className="progress-ring-text">
              <span className="progress-ring-pct">{pct}%</span>
              <span className="progress-ring-label">Done</span>
            </div>
          </div>
        </div>

        {/* AI Summary */}
        {(aiSummary || summaryLoading) && (
          <div className="ai-summary">
            <span className="ai-summary-icon">🤖</span>
            <p className="ai-summary-text">
              {summaryLoading ? 'ShivTask AI is analyzing your tasks...' : aiSummary}
            </p>
          </div>
        )}

        {/* Quick Filters */}
        <div className="quick-filters">
          {[
            { id: 'all', label: '🗂 All' },
            { id: 'pending', label: '⏳ Pending' },
            { id: 'inprogress', label: '▶️ In Progress' },
            { id: 'completed', label: '✅ Done' },
            { id: 'high', label: '🔴 High Priority' },
          ].map(f => (
            <button key={f.id} className={`quick-filter-btn ${activeFilter === f.id ? 'active' : ''}`}
              onClick={() => handleQuickFilter(f.id)}>{f.label}</button>
          ))}
        </div>

        {/* View Selector */}
        <div className="view-toggle">
          {[
            { id: 'board', label: '⊞ Board' },
            { id: 'list', label: '☰ List' },
            { id: 'stats', label: '📊 Stats' },
          ].map(v => (
            <button key={v.id} className={`view-btn ${view === v.id ? 'active' : ''}`}
              onClick={() => setView(v.id)}>{v.label}</button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading tasks...</p>
          </div>
        ) : view === 'board' ? (
          <KanbanBoard onEdit={handleEdit} tasks={filteredBySearch} />
        ) : view === 'list' ? (
          filteredBySearch.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <div className="empty-title">No tasks found</div>
              <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>Create your first task!</p>
              <button className="btn-add" onClick={() => setShowForm(true)}>+ Add Task</button>
            </div>
          ) : (
            <div>{filteredBySearch.map(task => <TaskListItem key={task._id} task={task} onEdit={handleEdit} />)}</div>
          )
        ) : (
          <StatsView tasks={tasks} />
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="bottom-nav">
        {[
          { id: 'board', icon: '⊞', label: 'Board' },
          { id: 'list', icon: '☰', label: 'Tasks' },
          { id: 'stats', icon: '📊', label: 'Stats' },
        ].map(item => (
          <button key={item.id} className={`nav-btn ${view === item.id ? 'active' : ''}`}
            onClick={() => setView(item.id)}>
            <span className="nav-btn-icon">{item.icon}</span>
            <span className="nav-btn-label">{item.label}</span>
            {view === item.id && <div className="nav-active-dot" />}
          </button>
        ))}
        <button className="fab" onClick={() => setShowForm(true)}>+</button>
        <button className={`nav-btn ${showProfile ? 'active' : ''}`} onClick={() => setShowProfile(true)}>
          <span className="nav-btn-icon">👤</span>
          <span className="nav-btn-label">Profile</span>
        </button>
      </nav>

      {showForm && <TaskForm task={editTask} onClose={handleCloseForm} />}
      {showProfile && <Profile user={user} onUpdate={onUpdateUser} onClose={() => setShowProfile(false)} />}

      <Toaster position="bottom-right" toastOptions={{
        style: { background: '#1a1a2e', color: '#fff', borderRadius: '12px', border: '1px solid #2a2a4a' }
      }} />
    </div>
  );
}

// ─── Root App ───
export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [page, setPage] = useState('login');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') !== 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const handleLogin = (userData) => setUser(userData);
  const handleUpdateUser = (userData) => setUser(userData);
  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null); };
  const toggleDark = () => setDarkMode(d => !d);

  if (!user) {
    if (page === 'login') return <Login onLogin={handleLogin} onGoRegister={() => setPage('register')} darkMode={darkMode} toggleDark={toggleDark} />;
    return <Register onLogin={handleLogin} onGoLogin={() => setPage('login')} darkMode={darkMode} toggleDark={toggleDark} />;
  }

  return (
    <TaskProvider>
      <TaskDashboard user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} darkMode={darkMode} toggleDark={toggleDark} />
    </TaskProvider>
  );
}