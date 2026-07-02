import React, { useState, useEffect } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { aiAPI } from '../utils/api';

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
  const [aiLoading, setAiLoading] = useState(false);
  const [nlText, setNlText] = useState('');
  const [showNL, setShowNL] = useState(false);
  const [aiHint, setAiHint] = useState('');

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

  // AI Smart Suggest based on title
  const handleAISuggest = async () => {
    if (!form.title.trim()) return;
    setAiLoading(true);
    setAiHint('');
    try {
      const suggestion = await aiAPI.suggest(form.title);
      setForm(f => ({
        ...f,
        priority: suggestion.priority || f.priority,
        category: suggestion.category || f.category,
        dueDate: suggestion.dueDate || f.dueDate,
        description: suggestion.description || f.description,
        tags: suggestion.tags?.join(', ') || f.tags
      }));
      setAiHint('✨ AI filled in the details for you!');
    } catch (err) {
      setAiHint('AI suggestion failed. Try again.');
    } finally {
      setAiLoading(false);
    }
  };

  // Natural Language Parse
  const handleNLParse = async () => {
    if (!nlText.trim()) return;
    setAiLoading(true);
    setAiHint('');
    try {
      const parsed = await aiAPI.parse(nlText);
      setForm({
        title: parsed.title || '',
        description: parsed.description || '',
        status: 'todo',
        priority: parsed.priority || 'medium',
        category: parsed.category || 'Other',
        dueDate: parsed.dueDate || '',
        tags: parsed.tags?.join(', ') || ''
      });
      setShowNL(false);
      setNlText('');
      setAiHint('✨ AI created the task from your description!');
    } catch (err) {
      setAiHint('AI parsing failed. Try again.');
    } finally {
      setAiLoading(false);
    }
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

          {/* Natural Language Input */}
          {!task && (
            <div style={{ background: 'var(--primary-light)', borderRadius: 10, padding: 12 }}>
              <button type="button" onClick={() => setShowNL(!showNL)}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', fontSize: 14, padding: 0 }}>
                🤖 {showNL ? 'Hide AI Input' : 'Create with AI — just describe your task'}
              </button>
              {showNL && (
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input
                    value={nlText}
                    onChange={e => setNlText(e.target.value)}
                    placeholder="e.g. Call doctor tomorrow at 3pm, high priority"
                    style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', background: 'var(--card)', color: 'var(--text)', outline: 'none' }}
                  />
                  <button type="button" onClick={handleNLParse} disabled={aiLoading}
                    style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: aiLoading ? .7 : 1 }}>
                    {aiLoading ? '🤖 AI is thinking...' : '✨ Generate Task'}
                  </button>
                </div>
              )}
            </div>
          )}

          {aiHint && (
            <div style={{ background: '#f0fdf4', color: '#10b981', padding: '8px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500 }}>
              {aiHint}
            </div>
          )}

          <div className="field">
            <label>Title *</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input name="title" value={form.title} onChange={handleChange}
                placeholder="What needs to be done?"
                className={errors.title ? 'error' : ''}
                style={{ flex: 1 }} />
              {!task && (
                <button type="button" onClick={handleAISuggest} disabled={aiLoading || !form.title.trim()}
                  title="AI Smart Suggest"
                  style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, padding: '0 12px', cursor: 'pointer', fontSize: 16, opacity: (!form.title.trim() || aiLoading) ? .5 : 1 }}>
                  {aiLoading ? '⏳' : '🤖'}
                </button>
              )}
            </div>
            {errors.title && <span className="error-msg">{errors.title}</span>}
            {!task && form.title && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Tap 🤖 to auto-fill details with AI</span>}
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