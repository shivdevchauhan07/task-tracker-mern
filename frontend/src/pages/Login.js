import React, { useState } from 'react';
import ForgotPassword from './ForgotPassword';

export default function Login({ onLogin, onGoRegister, darkMode, toggleDark }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  if (showForgot) {
    return <ForgotPassword onBack={() => setShowForgot(false)} />;
  }

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      setError('All fields are required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('https://taskflow-shivdev.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      onLogin(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inp = {
    width: '100%', padding: '12px 16px', borderRadius: 10,
    border: '1px solid #e2e8f0', fontSize: 15, outline: 'none',
    fontFamily: 'inherit', boxSizing: 'border-box'
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: '100%', maxWidth: 400, boxShadow: '0 4px 24px rgba(0,0,0,.08)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1a3a8f', marginBottom: 4 }}>🤖 ShivTask AI</h1>
            <p style={{ color: '#64748b' }}>Sign in to your account</p>
          </div>
          <button onClick={toggleDark} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 20, padding: '6px 12px', cursor: 'pointer', fontSize: 16 }}>
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', color: '#ef4444', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em' }}>Email</label>
          <input style={inp} type="email" placeholder="you@example.com"
            value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em' }}>Password</label>
          <input style={inp} type="password" placeholder="••••••••"
            value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
        </div>

        <div style={{ textAlign: 'right', marginBottom: 20 }}>
          <span onClick={() => setShowForgot(true)} style={{ color: '#1a3a8f', fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>
            Forgot Password?
          </span>
        </div>

        <button onClick={handleSubmit} disabled={loading}
          style={{ width: '100%', background: '#1a3a8f', color: '#fff', border: 'none', borderRadius: 10, padding: '13px', fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .7 : 1 }}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <p style={{ textAlign: 'center', marginTop: 20, color: '#64748b', fontSize: 14 }}>
          Don't have an account?{' '}
          <span onClick={onGoRegister} style={{ color: '#1a3a8f', fontWeight: 600, cursor: 'pointer' }}>Register</span>
        </p>
      </div>
    </div>
  );
}