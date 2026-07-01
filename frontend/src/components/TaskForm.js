import React, { useState, useEffect } from 'react';
import { useTaskContext } from '../context/TaskContext';

const emptyForm = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  category: 'Other',
  dueDate: '',
  tags: ''
};

const CATEGORIES = ['Work', 'Personal', 'Study', 'Health', 'Finance', 'Shopping', 'Other'];
const CATEGORY_ICONS = {
  Work: '💼', Personal: '👤', Study: '📚',
  Health: '💪', Finance: '💰', Shopping: '🛍️', Other: '📌'
};

export default function TaskForm({ task, onClose }) {
  const { createTask, updateTask } = useTaskContext();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        category: task.category || 'Other',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        tags: task.tags?.join(', ') || ''
      });
    }
  }, [task]);

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    else if (form.title.length > 100) errs.title = 'Max 100 characters';
    if (form.description.length > 500) errs.description = 'Max 500 characters';
    return errs;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        dueDate: form.dueDate || null
      };
      if (task) await updateTask(task._id, payload);
      else await createTask(payload);
      onClose();
    } catch (_) {
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{task ? 'Edit Task' : 'New Task'}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="task-form">
          <div className="field">
            <label>Title *</label>
            <input name="title" value={form.title} onChange={handleChange}
              placeholder="What needs to be done?"
              className={errors.title ? 'error' : ''} />
            {errors.title && <span className="error-msg">{errors.title}</span>}
          </div>

          <div className="field">
            <label>Description</label>
            <textarea name="description" value={form.description}
              onChange={handleChange} rows={3}
              placeholder="Add more details..."
              className={errors.description ? 'error' : ''} />
            {errors.description && <span className="error-msg">{errors.description}</span>}
          </div>

          <div className="field">
            <label>Category</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {CATEGORIES.map(cat => (
                <button key={cat} type="button"
                  onClick={() => setForm(f => ({ ...f, category: cat }))}
                  style={{
                    padding: '6px 12px', borderRadius: 20, fontSize: 13,
                    border: `2px solid ${form.category === cat ? 'var(--primary)' : 'var(--border)'}`,
                    background: form.category === cat ? 'var(--primary)' : 'var(--card)',
                    color: form.category === cat ? '#fff' : 'var(--text)',
                    cursor: 'pointer', fontWeight: 500
                  }}>
                  {CATEGORY_ICONS[cat]} {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleChange}>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="field">
              <label>Priority</label>
              <select name="priority" value={form.priority} onChange={handleChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label>Due Date</label>
              <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} />
            </div>
            <div className="field">
              <label>Tags (comma-separated)</label>
              <input name="tags" value={form.tags} onChange={handleChange}
                placeholder="design, urgent, backend" />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}