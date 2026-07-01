import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { TaskProvider, useTaskContext } from './context/TaskContext';
import TaskCard from './components/TaskCard';
import TaskForm from './components/TaskForm';
import FilterBar from './components/FilterBar';
import StatsBar from './components/StatsBar';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import './App.css';

function TaskList({ user, onLogout, onUpdateUser, darkMode, toggleDark }) {
  const { tasks, loading, fetchTasks, fetchStats, pagination, setFilters } = useTaskContext();
  const [showForm, setShowForm] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [activeQuick, setActiveQuick] = useState('all');

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, []);

  const handleEdit = (task) => {
    setEditTask(task);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditTask(null);
    fetchTasks();
    fetchStats();
  };

  const handleQuickFilter = (type) => {
    setActiveQuick(type);
    if (type === 'all') {
      setFilters({ status: '', priority: '' });
      fetchTasks({ status: '', priority: '' });
    } else if (type === 'completed') {
      setFilters({ status: 'completed', priority: '' });
      fetchTasks({ status: 'completed', priority: '' });
    } else if (type === 'pending') {
      setFilters({ status: 'todo', priority: '' });
      fetchTasks({ status: 'todo', priority: '' });
    } else if (type === 'high') {
      setFilters({ priority: 'high', status: '' });
      fetchTasks({ priority: 'high', status: '' });
    } else if (type === 'inprogress') {
      setFilters({ status: 'in-progress', priority: '' });
      fetchTasks({ status: 'in-progress', priority: '' });
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1 className="app-title">
            <span className="title-icon">🤖</span>
            ShivTask AI
          </h1>
          <span className="app-subtitle">
            Welcome, {user.name}! • Plan • Track • Achieve
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="theme-toggle" onClick={toggleDark} title="Toggle theme">
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button onClick={() => setShowProfile(true)} style={{
            background: 'var(--primary)', color: '#fff',
            border: 'none', borderRadius: '50%',
            width: 36, height: 36, fontSize: 16,
            cursor: 'pointer', fontWeight: 800
          }} title="My Profile">
            {user.name.charAt(0).toUpperCase()}
          </button>
          <button className="btn-primary btn-new" onClick={() => setShowForm(true)}>
            + New Task
          </button>
          <button onClick={onLogout} style={{
            background: 'none', border: '1px solid var(--border)',
            borderRadius: 8, padding: '8px 14px', cursor: 'pointer',
            fontSize: 14, color: 'var(--text-muted)'
          }}>
            Logout
          </button>
        </div>
      </header>

      <main className="main-content">
        <StatsBar />

        <div className="quick-filters">
          {[
            { key: 'all', label: '🗂 All' },
            { key: 'pending', label: '⏳ Pending' },
            { key: 'inprogress', label: '▶️ In Progress' },
            { key: 'completed', label: '✅ Completed' },
            { key: 'high', label: '🔴 High Priority' },
          ].map(f => (
            <button
              key={f.key}
              className={`quick-filter-btn ${activeQuick === f.key ? 'active' : ''}`}
              onClick={() => handleQuickFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <FilterBar />

        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No tasks found</h3>
            <p>Try a different filter or create a new task.</p>
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              + Add Task
            </button>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
              {tasks.length} task{tasks.length !== 1 ? 's' : ''}
            </p>
            <div className="task-grid">
              {tasks.map(task => (
                <TaskCard key={task._id} task={task} onEdit={handleEdit} />
              ))}
            </div>
            {pagination.totalPages > 1 && (
              <div className="pagination">
                <span>Page {pagination.page} of {pagination.totalPages}</span>
              </div>
            )}
          </>
        )}
      </main>

      {showForm && (
        <TaskForm task={editTask} onClose={handleCloseForm} />
      )}

      {showProfile && (
        <Profile
          user={user}
          onUpdate={onUpdateUser}
          onClose={() => setShowProfile(false)}
        />
      )}

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { background: '#1a3a8f', color: '#fff', borderRadius: '8px' }
        }}
      />
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [page, setPage] = useState('login');
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const handleLogin = (userData) => setUser(userData);
  const handleUpdateUser = (userData) => setUser(userData);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const toggleDark = () => setDarkMode(d => !d);

  if (!user) {
    if (page === 'login') {
      return <Login onLogin={handleLogin} onGoRegister={() => setPage('register')} darkMode={darkMode} toggleDark={toggleDark} />;
    }
    return <Register onLogin={handleLogin} onGoLogin={() => setPage('login')} darkMode={darkMode} toggleDark={toggleDark} />;
  }

  return (
    <TaskProvider>
      <TaskList
        user={user}
        onLogout={handleLogout}
        onUpdateUser={handleUpdateUser}
        darkMode={darkMode}
        toggleDark={toggleDark}
      />
    </TaskProvider>
  );
}