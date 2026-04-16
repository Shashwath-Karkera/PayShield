'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { authFetch } from '@/lib/http/authFetch';

export default function BankCredentialsPage() {
  const params = useParams();
  const router = useRouter();
  const lang = params?.lang || 'en';

  const [user, setUser] = useState({ userId: '', email: '', phone: '' });
  const [otpSent, setOtpSent] = useState(false);
  const [otpHints, setOtpHints] = useState({ email: '', sms: '' });
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const [form, setForm] = useState({
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    ifsc: '',
    upiId: '',
    emailOtp: '',
    smsOtp: ''
  });

  useEffect(() => {
    const userId = localStorage.getItem('ps_user_id') || '';
    const email = localStorage.getItem('ps_user_email') || '';
    const phone = localStorage.getItem('ps_user_phone') || '';

    if (!userId) {
      router.push(`/${lang}/login`);
      return;
    }

    setUser({ userId, email, phone });

    async function checkOnboarding() {
      try {
        const res = await authFetch(`/api/bank-credentials?userId=${encodeURIComponent(userId)}`);
        const data = await res.json();
        if (res.ok && Array.isArray(data.records) && data.records.length > 0) {
          setMessage('Bank account setup already completed. Redirecting to payment...');
          setTimeout(() => router.push(`/${lang}/payment`), 700);
        }
      } catch {
        // Keep page usable even if list fetch fails.
      }
    }

    checkOnboarding();
  }, [lang, router]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const sendOtpChallenge = async () => {
    if (!user.userId) {
      setIsError(true);
      setMessage('User session not found. Please login again.');
      return;
    }

    setLoadingOtp(true);
    setMessage('');
    setIsError(false);

    try {
      const res = await authFetch('/api/bank-credentials/setup-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.userId })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send setup OTP.');
      }

      setOtpSent(true);
      setOtpHints({
        email: data.devEmailOtp || '',
        sms: data.devSmsOtp || ''
      });
      setMessage('OTP sent to your registered email and phone for account setup verification.');
    } catch (error) {
      setIsError(true);
      setMessage(error.message || 'Failed to send setup OTP.');
    } finally {
      setLoadingOtp(false);
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    if (!otpSent) {
      setIsError(true);
      setMessage('Send OTP first, then verify both Email OTP and SMS OTP to continue.');
      return;
    }

    setSaving(true);
    setMessage('');
    setIsError(false);

    try {
      const res = await authFetch('/api/bank-credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.userId,
          bankName: form.bankName.trim(),
          accountHolderName: form.accountHolderName.trim(),
          accountNumber: form.accountNumber.trim(),
          ifsc: form.ifsc.trim().toUpperCase(),
          upiId: form.upiId.trim(),
          emailOtp: form.emailOtp.trim(),
          smsOtp: form.smsOtp.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Account setup failed.');
      }

      setMessage('Account setup completed and verified. Redirecting to payment...');
      setTimeout(() => router.push(`/${lang}/payment`), 700);
    } catch (error) {
      setIsError(true);
      setMessage(error.message || 'Account setup failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container" style={{ padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '1.2rem' }}>
        <h1 className="page-title">Account Setup Before Payment</h1>
        <p style={{ color: '#64748b', marginBottom: '1rem' }}>
          To continue with payments, setup your bank account and verify with both Email OTP and SMS OTP.
        </p>

        <div style={{ marginBottom: 12, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '0.75rem' }}>
          <p style={{ margin: 0, fontSize: 13 }}><strong>Registered Email:</strong> {user.email || '-'}</p>
          <p style={{ margin: 0, fontSize: 13 }}><strong>Registered Phone:</strong> {user.phone || '-'}</p>
          {otpHints.email || otpHints.sms ? (
            <p style={{ margin: '0.35rem 0 0', fontSize: 13, color: '#334155' }}>
              <strong>Dev OTP:</strong> Email {otpHints.email || 'N/A'} | SMS {otpHints.sms || 'N/A'}
            </p>
          ) : null}
        </div>

        <button type="button" className="btn btn-secondary" onClick={sendOtpChallenge} disabled={loadingOtp}>
          {loadingOtp ? 'Sending OTP...' : otpSent ? 'Resend Email + SMS OTP' : 'Send Email + SMS OTP'}
        </button>

        <form onSubmit={onSubmit} style={{ marginTop: 14, display: 'grid', gap: 10 }}>
          <input name="bankName" value={form.bankName} onChange={onChange} placeholder="Bank Name" className="auth-input" required />
          <input name="accountHolderName" value={form.accountHolderName} onChange={onChange} placeholder="Account Holder Name" className="auth-input" required />
          <input name="accountNumber" value={form.accountNumber} onChange={onChange} placeholder="Account Number" className="auth-input" required />
          <input name="ifsc" value={form.ifsc} onChange={onChange} placeholder="IFSC" className="auth-input" required />
          <input name="upiId" value={form.upiId} onChange={onChange} placeholder="UPI ID" className="auth-input" required />
          <input name="emailOtp" value={form.emailOtp} onChange={onChange} placeholder="Email OTP" className="auth-input" maxLength={6} required />
          <input name="smsOtp" value={form.smsOtp} onChange={onChange} placeholder="SMS OTP" className="auth-input" maxLength={6} required />

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Verifying and Saving...' : 'Verify OTP and Complete Setup'}
          </button>
        </form>

        {message ? (
          <p style={{ marginTop: 12, color: isError ? '#b91c1c' : '#166534' }}>{message}</p>
        ) : null}
      </div>
    </div>
  );
}
