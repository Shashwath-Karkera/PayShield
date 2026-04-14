'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { authFetch } from '@/lib/http/authFetch';
import { collectDeviceFingerprint, getClientNetworkInfo } from '@/lib/security/clientDevice';

export default function VerifyPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const lang = params?.lang || 'en';

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [context, setContext] = useState(null);
  const [devOtpHints, setDevOtpHints] = useState({ emailOtp: '', smsOtp: '' });
  const [form, setForm] = useState({
    emailOtp: '',
    smsOtp: '',
    simSlot: 'SIM1',
    payShieldPin: '',
    confirmPayShieldPin: ''
  });

  const verificationId = searchParams.get('verificationId');

  useEffect(() => {
    const sessionToken = localStorage.getItem('ps_session_token');
    if (!sessionToken || !verificationId) {
      router.push(`/${lang}/login`);
      return;
    }

    const load = async () => {
      try {
        const emailOtp = localStorage.getItem('ps_dev_email_otp') || '';
        const smsOtp = localStorage.getItem('ps_dev_sms_otp') || '';
        setDevOtpHints({ emailOtp, smsOtp });

        const res = await authFetch(`/api/auth/verify?verificationId=${verificationId}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Unable to load verification details.');
        }

        setContext(data.verification);
      } catch (error) {
        setMessageType('error');
        setMessage(error.message || 'Unable to initialize verification.');
      } finally {
        setFetching(false);
      }
    };

    load();
  }, [lang, router, verificationId]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const device = collectDeviceFingerprint();
      const network = getClientNetworkInfo();

      const res = await authFetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationId,
          emailOtp: form.emailOtp,
          smsOtp: form.smsOtp,
          simSlot: form.simSlot,
          payShieldPin: form.payShieldPin,
          confirmPayShieldPin: context?.needsPinSetup ? form.confirmPayShieldPin : undefined,
          ipAddress: network.ipAddress,
          deviceDna: device.deviceDna,
          locationCountry: network.locationCountry,
          locationCity: network.locationCity
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Verification failed.');
      }

      setMessageType('success');
      setMessage('Verification successful. Redirecting...');

      setTimeout(() => {
        localStorage.removeItem('ps_dev_email_otp');
        localStorage.removeItem('ps_dev_sms_otp');
        if (data.requiresBankOnboarding) {
          router.push(`/${lang}/bank-credentials`);
        } else {
          router.push(`/${lang}/payment`);
        }
      }, 700);
    } catch (error) {
      setMessageType('error');
      setMessage(error.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const onResendOtp = async () => {
    setMessage('');
    try {
      const res = await authFetch('/api/auth/verify/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationId })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Unable to resend OTP.');
      }

      if (data.devEmailOtp || data.devSmsOtp) {
        localStorage.setItem('ps_dev_email_otp', data.devEmailOtp || '');
        localStorage.setItem('ps_dev_sms_otp', data.devSmsOtp || '');
        setDevOtpHints({ emailOtp: data.devEmailOtp || '', smsOtp: data.devSmsOtp || '' });
      }

      setMessageType('success');
      setMessage('OTP resent successfully.');
    } catch (error) {
      setMessageType('error');
      setMessage(error.message || 'Unable to resend OTP.');
    }
  };

  if (fetching) {
    return (
      <div className="page-container">
        <div className="container-narrow">
          <h1 className="page-title">Loading verification...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-box register-box">
        <div className="auth-header">
          <h1>Complete Secure Verification</h1>
          <p>Verify OTP, device, SIM slot, and PayShield PIN before accessing payments.</p>
        </div>

        {context ? (
          <div className="info-box" style={{ marginBottom: 12 }}>
            <p><strong>Risk Score:</strong> {Number(context.riskScore || 0).toFixed(2)}</p>
            <p><strong>Expected SIM Slot:</strong> {context.expectedSimSlot}</p>
            {devOtpHints.emailOtp || devOtpHints.smsOtp ? (
              <p>
                <strong>Dev OTP:</strong> Email {devOtpHints.emailOtp || 'N/A'} | SMS {devOtpHints.smsOtp || 'N/A'}
              </p>
            ) : null}
            {Array.isArray(context.riskReasons) && context.riskReasons.length > 0 ? (
              <p><strong>Risk Reasons:</strong> {context.riskReasons.join(' | ')}</p>
            ) : null}
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="auth-form">
          <div className="form-group">
            <label>Email OTP</label>
            <input name="emailOtp" value={form.emailOtp} onChange={onChange} maxLength={6} required className="form-input" />
          </div>

          <div className="form-group">
            <label>SMS OTP</label>
            <input name="smsOtp" value={form.smsOtp} onChange={onChange} maxLength={6} required className="form-input" />
          </div>

          <div className="form-group">
            <label>SIM Slot</label>
            <select name="simSlot" value={form.simSlot} onChange={onChange} className="form-input">
              <option value="SIM1">SIM1</option>
              <option value="SIM2">SIM2</option>
            </select>
          </div>

          <div className="form-group">
            <label>{context?.needsPinSetup ? 'Set PayShield PIN' : 'PayShield PIN'}</label>
            <input
              type="password"
              name="payShieldPin"
              value={form.payShieldPin}
              onChange={onChange}
              required
              className="form-input"
            />
          </div>

          {context?.needsPinSetup ? (
            <div className="form-group">
              <label>Confirm PayShield PIN</label>
              <input
                type="password"
                name="confirmPayShieldPin"
                value={form.confirmPayShieldPin}
                onChange={onChange}
                required
                className="form-input"
              />
            </div>
          ) : null}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Verifying...' : 'Complete Verification'}
          </button>

          <button type="button" className="btn btn-secondary btn-full" onClick={onResendOtp}>
            Resend OTP
          </button>
        </form>

        {message ? (
          <p style={{ marginTop: 12, color: messageType === 'error' ? '#b91c1c' : '#166534' }}>{message}</p>
        ) : null}
      </div>
    </div>
  );
}
