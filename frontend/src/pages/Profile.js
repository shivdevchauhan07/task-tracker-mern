import React, { useState, useEffect } from 'react';
import API from '../utils/api';

export default function Profile({ user, onUpdate, onClose }) {
  const [name, setName] = useState(user.name);
  const [stats, setStats] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    API.get('/auth/profile/stats').then(data => setStats(data)).catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!name.trim()) { setError('Name is required'); return; }
    setSaving(true);
    try {
      const data = await API.put('/auth/profile', { name });
      const updated = { ...user, name: data.name };
      localStorage.setItem('user', JSON.stringify(updated));
      onUpdate(updated);
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const CATEGORY_ICONS = {
    Work: '💼', Personal: '👤', Study: '📚',
    Health: '💪', Finance: '💰', Shopping: '🛍️', Other: '📌'
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}>
      <div style={{ background: 'var(--card)', borderRadius: 16, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,.2)' }}>
        
        {/* Header */}
        <div style={{ padding: '20px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>👤 My Profile</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
        </div>

        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 70, height: 70, borderRadius: '50%',
              background: 'var(--primary)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 28, color: '#fff', fontWeight: 800
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{user.name}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>{user.email}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                Member since {new Date(user.createdAt || Date.now()).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Edit Name */}
          <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: editing ? 12 : 0 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Display Name</span>
              {!editing && (
                <button onClick={() => setEditing(true)} style={{
                  background: 'none', border: '1px solid var(--border)',
                  borderRadius: 6, padding: '4px 12px', fontSize: 13,
                  cursor: 'pointer', color: 'var(--primary)', fontWeight: 600
                }}>Edit</button>
              )}
            </div>
            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input value={name} onChange={e => setName(e.target.value)}
                  style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, background: 'var(--card)', color: 'var(--text)', outline: 'none', fontFamily: 'inherit' }} />
                {error && <span style={{ fontSize: 12, color: '#ef4444' }}>{error}</span>}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setEditing(false)} style={{
                    flex: 1, padding: '8px', border: '1px solid var(--border)',
                    borderRadius: 8, background: 'var(--card)', color: 'var(--text)',
                    cursor: 'pointer', fontSize: 14
                  }}>Cancel</button>
                  <button onClick={handleSave} disabled={saving} style={{
                    flex: 1, padding: '8px', border: 'none',
                    borderRadius: 8, background: 'var(--primary)', color: '#fff',
                    cursor: 'pointer', fontSize: 14, fontWeight: 600
                  }}>{saving ? 'Saving...' : 'Save'}</button>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: 15, color: 'var(--text)', marginTop: 4 }}>{user.name}</p>
            )}
          </div>

          {/* Stats */}
          {stats && (
            <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 16 }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>📊 My Task Stats</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { label: 'Total Tasks', value: stats.total, color: 'var(--text)' },
                  { label: 'Completed', value: stats.completed, color: '#10b981' },
                  { label: 'In Progress', value: stats['in-progress'], color: '#f59e0b' },
                  { label: 'To Do', value: stats.todo, color: 'var(--text-muted)' },
                ].map(s => (
                  <div key={s.label} style={{ background: 'var(--card)', borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}