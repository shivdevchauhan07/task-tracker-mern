import React, { useState } from 'react';

export default function ForgotPassword({ onBack }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const API = 'https://taskflow-shivdev.onrender.com/api/auth';

  const inp = {
    width: '100%', padding: '12px 16px', borderRadius: 10,
    border: '1px solid #e2e8f0', fontSize: 15, outline: 'none',
    fontFamily: 'inherit', boxSizing: 'border-box'
  };

  const handleSendOTP = async () => {
    if (!email) { setError('Email is required'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess('OTP sent to your email!');
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) { setError('OTP is required'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess('OTP verified!');
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword) { setError('Password is required'); return; }
    if (newPassword.length < 6) { setError('Min 6 characters'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess('Password reset successfully!');
      setTimeout(() => onBack(), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: '100%', maxWidth: 400, boxShadow: '0 4px 24px rgba(0,0,0,.08)' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1a3a8f', marginBottom: 4 }}>🤖 ShivTask AI</h1>
        <p style={{ color: '#64748b', marginBottom: 8 }}>Reset your password</p>

        {/* Steps indicator */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {['Email', 'OTP', 'New Password'].map((s, i) => (
            <div key={s} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', margin: '0 auto 4px',
                background: step > i + 1 ? '#10b981' : step === i + 1 ? '#1a3a8f' : '#e2e8f0',
                color: step >= i + 1 ? '#fff' : '#94a3b8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700
              }}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: 11, color: step === i + 1 ? '#1a3a8f' : '#94a3b8' }}>{s}</span>
            </div>
          ))}
        </div>

        {error && (
          <div style={{ background: '#fef2f2', color: '#ef4444', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ background: '#f0fdf4', color: '#10b981', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
            {success}
          </div>
        )}

        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em' }}>Email Address</label>
              <input style={inp} type="email" placeholder="your@email.com"
                value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <button onClick={handleSendOTP} disabled={loading}
              style={{ width: '100%', background: '#1a3a8f', color: '#fff', border: 'none', borderRadius: 10, padding: '13px', fontSize: 15, fontWeight: 600, cursor: 'pointer', opacity: loading ? .7 : 1 }}>
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: 14, color: '#64748b' }}>Check your email <strong>{email}</strong> for the 6-digit OTP</p>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em' }}>Enter OTP</label>
              <input style={{ ...inp, fontSize: 24, letterSpacing: 8, textAlign: 'center' }}
                placeholder="000000" maxLength={6}
                value={otp} onChange={e => setOtp(e.target.value)} />
            </div>
            <button onClick={handleVerifyOTP} disabled={loading}
              style={{ width: '100%', background: '#1a3a8f', color: '#fff', border: 'none', borderRadius: 10, padding: '13px', fontSize: 15, fontWeight: 600, cursor: 'pointer', opacity: loading ? .7 : 1 }}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button onClick={handleSendOTP} style={{ background: 'none', border: 'none', color: '#1a3a8f', cursor: 'pointer', fontSize: 14 }}>
              Resend OTP
            </button>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em' }}>New Password</label>
              <input style={inp} type="password" placeholder="Min 6 characters"
                value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em' }}>Confirm Password</label>
              <input style={inp} type="password" placeholder="Repeat password"
                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            </div>
            <button onClick={handleResetPassword} disabled={loading}
              style={{ width: '100%', background: '#1a3a8f', color: '#fff', border: 'none', borderRadius: 10, padding: '13px', fontSize: 15, fontWeight: 600, cursor: 'pointer', opacity: loading ? .7 : 1 }}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        )}

        <button onClick={onBack} style={{ width: '100%', marginTop: 16, background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 14 }}>
          ← Back to Login
        </button>
      </div>
    </div>
  );
}