'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Admin login failed.');
      }

      localStorage.setItem('ps_admin_token', payload.token);
      router.push('/admin/threats');
    } catch (err) {
      setError(err.message || 'Admin login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: 420, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '1.2rem' }}>
        <h1 className="page-title">Admin Login</h1>
        <p style={{ color: '#64748b', marginBottom: '1rem' }}>Use environment-configured admin credentials.</p>
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
          <input name="username" value={form.username} onChange={onChange} placeholder="Admin username" required className="auth-input" />
          <input name="password" value={form.password} onChange={onChange} placeholder="Admin password" type="password" required className="auth-input" />
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
          {error ? <p style={{ color: '#b91c1c', margin: 0 }}>{error}</p> : null}
        </form>
      </div>
    </div>
  );
}
