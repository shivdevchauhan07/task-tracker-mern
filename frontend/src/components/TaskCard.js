import React, { useState } from 'react';
import { useTaskContext } from '../context/TaskContext';

const PRIORITY_COLORS = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };
const STATUS_LABELS = { todo: 'To Do', 'in-progress': 'In Progress', completed: 'Completed' };

export default function TaskCard({ task, onEdit }) {
  const { updateTask, deleteTask } = useTaskContext();
  const [confirming, setConfirming] = useState(false);

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  const cycleStatus = async () => {
    const next = { todo: 'in-progress', 'in-progress': 'completed', completed: 'todo' };
    await updateTask(task._id, { ...task, status: next[task.status] });
  };

  const handleDelete = async () => {
    if (!confirming) { setConfirming(true); return; }
    await deleteTask(task._id);
  };

  return (
    <div className={`task-card priority-${task.priority} ${task.status === 'completed' ? 'done' : ''}`}>
      <div className="task-card-header">
        <span className="priority-dot" style={{ background: PRIORITY_COLORS[task.priority] }} />
        <span className={`status-badge status-${task.status}`}>
          {STATUS_LABELS[task.status]}
        </span>
        <div className="card-actions">
          <button className="icon-btn" onClick={() => onEdit(task)}>✏️</button>
          <button
            className={`icon-btn ${confirming ? 'danger' : ''}`}
            onClick={handleDelete}
            onBlur={() => setConfirming(false)}
          >{confirming ? '⚠️' : '🗑️'}</button>
        </div>
      </div>
      <h3 className={`task-title ${task.status === 'completed' ? 'strikethrough' : ''}`}>
        {task.title}
      </h3>
      {task.description && <p className="task-desc">{task.description}</p>}
      <div className="task-meta">
        {task.dueDate && (
          <span className={`due-date ${isOverdue ? 'overdue' : ''}`}>
            📅 {new Date(task.dueDate).toLocaleDateString()}
            {isOverdue && ' — Overdue'}
          </span>
        )}
        {task.tags?.length > 0 && (
          <div className="tags">
            {task.tags.map(tag => <span key={tag} className="tag">#{tag}</span>)}
          </div>
        )}
      </div>
      <button className="status-toggle" onClick={cycleStatus}>
        {task.status === 'completed' ? '↩ Reopen' : task.status === 'todo' ? '▶ Start' : '✓ Complete'}
      </button>
    </div>
  );
}