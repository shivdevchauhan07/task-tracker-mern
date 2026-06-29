import React from 'react';
import { useTaskContext } from '../context/TaskContext';

export default function StatsBar() {
  const { stats } = useTaskContext();
  const pct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="stats-bar">
      <div className="stat-card stat-total">
        <span className="stat-num">{stats.total}</span>
        <span className="stat-label">Total</span>
      </div>
      <div className="stat-card stat-todo">
        <span className="stat-num">{stats.todo}</span>
        <span className="stat-label">To Do</span>
      </div>
      <div className="stat-card stat-progress">
        <span className="stat-num">{stats['in-progress']}</span>
        <span className="stat-label">In Progress</span>
      </div>
      <div className="stat-card stat-done">
        <span className="stat-num">{stats.completed}</span>
        <span className="stat-label">Completed</span>
      </div>
      <div className="stat-card stat-pct">
        <div className="progress-ring-wrap">
          <svg viewBox="0 0 36 36" className="progress-ring">
            <circle cx="18" cy="18" r="15.9" fill="none"
              stroke="#e5e7eb" strokeWidth="3" />
            <circle cx="18" cy="18" r="15.9" fill="none"
              stroke="#6366f1" strokeWidth="3"
              strokeDasharray={`${pct} ${100 - pct}`}
              strokeDashoffset="25"
              strokeLinecap="round" />
          </svg>
          <span className="ring-pct">{pct}%</span>
        </div>
        <span className="stat-label">Complete</span>
      </div>
    </div>
  );
}