import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { TaskProvider, useTaskContext } from './context/TaskContext';
import TaskCard from './components/TaskCard';
import TaskForm from './components/TaskForm';
import FilterBar from './components/FilterBar';
import StatsBar from './components/StatsBar';
import './App.css';

function TaskList() {
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
          <span className="app-subtitle">Stay on top of everything</span>
        </div>
        <button className="btn-primary btn-new" onClick={() => setShowForm(true)}>
          + New Task
        </button>
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
                <span>Page {pagination.page} of {pagination.totalPages} ({pagination.total} tasks)</span>
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
  return (
    <TaskProvider>
      <TaskList />
    </TaskProvider>
  );
}