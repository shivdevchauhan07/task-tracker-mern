import React from 'react';
import { useTaskContext } from '../context/TaskContext';

const CATEGORY_ICONS = { Work: '💼', Personal: '👤', Study: '📚', Health: '💪', Finance: '💰', Shopping: '🛍️', Other: '📌' };
const CATEGORY_COLORS = { Work: '#7c3aed', Personal: '#ec4899', Study: '#06b6d4', Health: '#10b981', Finance: '#f59e0b', Shopping: '#f97316', Other: '#64748b' };
const PRIORITY_COLORS = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };

const COLUMNS = [
  { id: 'todo', label: 'To Do', color: '#7c3aed', emoji: '📋', glow: 'rgba(124,58,237,.15)' },
  { id: 'in-progress', label: 'In Progress', color: '#f59e0b', emoji: '▶️', glow: 'rgba(245,158,11,.15)' },
  { id: 'completed', label: 'Completed', color: '#10b981', emoji: '✅', glow: 'rgba(16,185,129,.15)' }
];

function KanbanCard({ task, onEdit, onMove }) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
  const NEXT = { todo: 'in-progress', 'in-progress': 'completed', completed: 'todo' };
  const NEXT_LABEL = { todo: '▶ Start Task', 'in-progress': '✓ Mark Done', completed: '↩ Reopen' };
  const catColor = CATEGORY_COLORS[task.category] || '#7c3aed';
  const progress = task.status === 'completed' ? 100 : task.status === 'in-progress' ? 60 : 0;

  return (
    <div className="task-card"
      onMouseEnter={e => { e.currentTarget.style.borderColor = catColor + '66'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}>

      <div className="task-card-stripe" style={{ background: `linear-gradient(90deg, ${catColor}, ${PRIORITY_COLORS[task.priority]})` }} />

      <div className="task-card-top">
        <span className="task-cat-badge" style={{ background: catColor + '22', color: catColor }}>
          {CATEGORY_ICONS[task.category] || '📌'} {task.category}
        </span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <div className="task-priority-dot" style={{ background: PRIORITY_COLORS[task.priority], boxShadow: `0 0 6px ${PRIORITY_COLORS[task.priority]}` }} />
          <button onClick={() => onEdit(task)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'var(--muted2)', padding: 2 }}>✏️</button>
        </div>
      </div>

      <p className={`task-title ${task.status === 'completed' ? 'done' : ''}`}>{task.title}</p>

      {task.description && (
        <p className="task-desc">{task.description.substring(0, 80)}{task.description.length > 80 ? '...' : ''}</p>
      )}

      {task.status === 'in-progress' && (
        <div className="task-progress-wrap">
          <div className="task-progress-header">
            <span className="task-progress-label">PROGRESS</span>
            <span className="task-progress-pct">{progress}%</span>
          </div>
          <div className="task-progress-bar">
            <div className="task-progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className="task-meta">
        {task.dueDate ? (
          <span className={`task-due ${isOverdue ? 'overdue' : ''}`}>
            📅 {new Date(task.dueDate).toLocaleDateString()}{isOverdue ? ' · Overdue!' : ''}
          </span>
        ) : <span />}
        {task.tags?.length > 0 && (
          <div className="task-tags">
            {task.tags.slice(0, 2).map(tag => (
              <span key={tag} className="task-tag">#{tag}</span>
            ))}
          </div>
        )}
      </div>

      <button className="task-move-btn"
        onClick={() => onMove(task._id, NEXT[task.status])}
        style={{
          background: task.status === 'completed' ? 'var(--card2)' : catColor + '22',
          color: task.status === 'completed' ? 'var(--muted2)' : catColor,
          border: `1px solid ${catColor}33`
        }}>
        {NEXT_LABEL[task.status]}
      </button>
    </div>
  );
}

export default function KanbanBoard({ onEdit, tasks }) {
  const { updateTask } = useTaskContext();

  const handleMove = async (id, status) => {
    const task = tasks.find(t => t._id === id);
    if (task) await updateTask(id, { ...task, status });
  };

  if (!tasks || tasks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📋</div>
        <div className="empty-title">No tasks found</div>
        <p style={{ color: 'var(--muted2)' }}>Create your first task to get started!</p>
      </div>
    );
  }

  return (
    <div className="kanban-board">
      {COLUMNS.map(col => {
        const colTasks = tasks.filter(t => t.status === col.id);
        return (
          <div key={col.id} className="kanban-column"
            style={{ border: `1px solid ${col.color}33`, boxShadow: `0 0 20px ${col.glow}` }}>
            <div className="kanban-col-header">
              <span className="kanban-col-title">
                <span>{col.emoji}</span>
                {col.label}
              </span>
              <span className="kanban-col-count" style={{ background: col.color, boxShadow: `0 4px 12px ${col.color}44` }}>
                {colTasks.length}
              </span>
            </div>
            {colTasks.length === 0 ? (
              <div className="kanban-empty">Drop tasks here</div>
            ) : (
              colTasks.map(task => (
                <KanbanCard key={task._id} task={task} onEdit={onEdit} onMove={handleMove} />
              ))
            )}
          </div>
        );
      })}
    </div>
  );
}