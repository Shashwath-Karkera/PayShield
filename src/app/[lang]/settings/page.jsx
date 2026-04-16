'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function SettingsPage() {
  const params = useParams();
  const lang = params?.lang || 'en';

  const clearSession = () => {
    localStorage.removeItem('ps_session_token');
    localStorage.removeItem('ps_verification_id');
    localStorage.removeItem('ps_user_id');
    localStorage.removeItem('ps_user_email');
    localStorage.removeItem('ps_user_name');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    window.location.href = `/${lang}/login`;
  };

  return (
    <div className="page-container" style={{ padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '1.2rem' }}>
        <h1 className="page-title">Settings</h1>
        <p style={{ color: '#64748b', marginBottom: '1rem' }}>
          Account and security preferences.
        </p>

        <div style={{ display: 'grid', gap: 10 }}>
          <Link href={`/${lang}/profile`} className="btn btn-secondary">Edit Profile</Link>
          <Link href={`/${lang}/security`} className="btn btn-secondary">Security Controls</Link>
          <Link href={`/${lang}/transactions`} className="btn btn-secondary">View Transactions</Link>
          <button type="button" className="btn btn-danger" onClick={clearSession}>Log Out From This Device</button>
        </div>
      </div>
    </div>
  );
}
