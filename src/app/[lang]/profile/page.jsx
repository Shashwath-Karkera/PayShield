'use client';

import { useEffect, useState } from 'react';
import { authFetch } from '@/lib/http/authFetch';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    motherNickname: '',
    firstPetName: '',
    currentPassword: '',
    newPassword: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('ps_session_token');

    async function loadProfile() {
      if (!token) {
        setLoading(false);
        setIsError(true);
        setMessage('Login is required to view profile data.');
        return;
      }

      try {
        const res = await fetch(`/api/auth/session?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Unable to load session profile.');
        }

        setForm((prev) => ({
          ...prev,
          name: data.session?.user?.name || '',
          phone: data.session?.user?.phone || ''
        }));
      } catch (error) {
        setIsError(true);
        setMessage(error.message || 'Unable to load profile.');
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    const userId = localStorage.getItem('ps_user_id');
    if (!userId) {
      setIsError(true);
      setMessage('Login is required to update profile.');
      return;
    }

    setSaving(true);
    setMessage('');
    setIsError(false);

    try {
      const body = {
        userId,
        name: form.name,
        phone: form.phone,
        motherNickname: form.motherNickname || undefined,
        firstPetName: form.firstPetName || undefined,
        currentPassword: form.currentPassword || undefined,
        newPassword: form.newPassword || undefined
      };

      const response = await authFetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || 'Profile update failed.');
      }

      localStorage.setItem('ps_user_name', payload.user?.name || form.name || '');
      localStorage.setItem('ps_user_email', payload.user?.email || localStorage.getItem('ps_user_email') || '');

      setForm((prev) => ({ ...prev, currentPassword: '', newPassword: '' }));
      setMessage('Profile updated successfully.');
    } catch (error) {
      setIsError(true);
      setMessage(error.message || 'Profile update failed.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="page-container" style={{ padding: '2rem 1rem' }}>Loading profile...</div>;
  }

  return (
    <div className="page-container" style={{ padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '1.2rem' }}>
        <h1 className="page-title">Profile</h1>
        <p style={{ color: '#64748b', marginBottom: '1rem' }}>Manage personal and account recovery details.</p>

        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
          <input name="name" value={form.name} onChange={onChange} placeholder="Full name" className="auth-input" required />
          <input name="phone" value={form.phone} onChange={onChange} placeholder="Phone" className="auth-input" />
          <input name="motherNickname" value={form.motherNickname} onChange={onChange} placeholder="Mother nickname" className="auth-input" />
          <input name="firstPetName" value={form.firstPetName} onChange={onChange} placeholder="First pet name" className="auth-input" />
          <input name="currentPassword" type="password" value={form.currentPassword} onChange={onChange} placeholder="Current password (optional)" className="auth-input" />
          <input name="newPassword" type="password" value={form.newPassword} onChange={onChange} placeholder="New password (optional)" className="auth-input" />

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>

        {message ? (
          <p style={{ marginTop: 12, color: isError ? '#b91c1c' : '#166534' }}>{message}</p>
        ) : null}
      </div>
    </div>
  );
}
