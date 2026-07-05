import React from 'react';
import { useTaskContext } from '../context/TaskContext';

const PRIORITY_COLORS = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };
const CATEGORY_ICONS = { Work: '💼', Personal: '👤', Study: '📚', Health: '💪', Finance: '💰', Shopping: '🛍️', Other: '📌' };
const COLUMNS = [
  { id: 'todo', label: 'To Do', color: '#7c3aed', emoji: '📋' },
  { id: 'in-progress', label: 'In Progress', color: '#f59e0b', emoji: '▶️' },
  { id: 'completed', label: 'Completed', color: '#10b981', emoji: '✅' }
];

function KanbanCard({ task, onEdit, onMove }) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
  const NEXT = { todo: 'in-progress', 'in-progress': 'completed', completed: 'todo' };
  const NEXT_LABEL = { todo: '▶ Start', 'in-progress': '✓ Done', completed: '↩ Reopen' };

  return (
    <div className="task-card">
      <div className="task-card-top">
        <span className="task-category-badge">
          {CATEGORY_ICONS[task.category] || '📌'} {task.category}
        </span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <div className="task-priority-dot" style={{ background: PRIORITY_COLORS[task.priority] }} />
          <button onClick={() => onEdit(task)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'var(--text-muted)', padding: 2 }}>✏️</button>
        </div>
      </div>
      <p className={`task-title ${task.status === 'completed' ? 'done' : ''}`}>{task.title}</p>
      {task.description && (
        <p className="task-desc">{task.description.substring(0, 70)}{task.description.length > 70 ? '...' : ''}</p>
      )}
      {task.dueDate && (
        <p className={`task-due ${isOverdue ? 'overdue' : ''}`}>
          📅 {new Date(task.dueDate).toLocaleDateString()}{isOverdue ? ' · Overdue!' : ''}
        </p>
      )}
      {task.tags?.length > 0 && (
        <div className="task-tags">
          {task.tags.slice(0, 2).map(tag => (
            <span key={tag} className="task-tag">#{tag}</span>
          ))}
        </div>
      )}
      <button className="task-move-btn" onClick={() => onMove(task._id, NEXT[task.status])}>
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
        <p style={{ color: 'var(--text-muted)' }}>Create your first task!</p>
      </div>
    );
  }

  return (
    <div className="kanban-board">
      {COLUMNS.map(col => {
        const colTasks = tasks.filter(t => t.status === col.id);
        return (
          <div key={col.id} className="kanban-column">
            <div className="kanban-col-header">
              <span className="kanban-col-title">{col.emoji} {col.label}</span>
              <span className="kanban-col-count" style={{ background: col.color }}>{colTasks.length}</span>
            </div>
            {colTasks.length === 0 ? (
              <div className="kanban-empty">No tasks here</div>
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