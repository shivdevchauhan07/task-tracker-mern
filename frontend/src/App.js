import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { TaskProvider, useTaskContext } from './context/TaskContext';
import TaskCard from './components/TaskCard';
import TaskForm from './components/TaskForm';
import FilterBar from './components/FilterBar';
import StatsBar from './components/StatsBar';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

function TaskList({ user, onLogout }) {
  const { tasks, loading, fetchTasks, fetchStats, pagination } = useTaskContext();
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);

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

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1 className="app-title">
            <span className="title-icon">⚡</span>
            TaskFlow
          </h1>
          <span className="app-subtitle">Welcome, {user.name}!</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="btn-primary btn-new" onClick={() => setShowForm(true)}>
            + New Task
          </button>
          <button onClick={onLogout} style={{
            background: 'none', border: '1px solid #e2e8f0',
            borderRadius: 8, padding: '8px 14px', cursor: 'pointer',
            fontSize: 14, color: '#64748b'
          }}>
            Logout
          </button>
        </div>
      </header>

      <main className="main-content">
        <StatsBar />
        <FilterBar />

        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p>Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No tasks yet</h3>
            <p>Create your first task to get started.</p>
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              + Add Task
            </button>
          </div>
        ) : (
          <>
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

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { background: '#1e1b4b', color: '#fff', borderRadius: '8px' }
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

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (!user) {
    if (page === 'login') {
      return <Login onLogin={handleLogin} onGoRegister={() => setPage('register')} />;
    }
    return <Register onLogin={handleLogin} onGoLogin={() => setPage('login')} />;
  }

  return (
    <TaskProvider>
      <TaskList user={user} onLogout={handleLogout} />
    </TaskProvider>
  );
}