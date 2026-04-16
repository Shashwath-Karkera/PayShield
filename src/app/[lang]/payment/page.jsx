'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { authFetch } from '@/lib/http/authFetch';

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const lang = params?.lang || 'en';

  const [form, setForm] = useState({
    payee: '',
    amount: '',
    payShieldPin: ''
  });
  const [hasSession, setHasSession] = useState(false);
  const [bankSetupCompleted, setBankSetupCompleted] = useState(false);
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', userId: '' });
  const [agreed, setAgreed] = useState(false);
  const [razorpayLoading, setRazorpayLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const sessionToken = localStorage.getItem('ps_session_token') || localStorage.getItem('token') || '';
      const userId = localStorage.getItem('ps_user_id') || '';

      setHasSession(Boolean(sessionToken && userId));
      setProfile({
        name: localStorage.getItem('ps_user_name') || '',
        email: localStorage.getItem('ps_user_email') || '',
        phone: localStorage.getItem('ps_user_phone') || '',
        userId
      });

      if (!sessionToken || !userId) {
        if (!cancelled) {
          setIsError(true);
          setMessage('Login session is missing. Please sign in again.');
        }
        return;
      }

      try {
        const res = await fetch(`/api/auth/session?token=${encodeURIComponent(sessionToken)}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Unable to verify session.');
        }

        const completed = Boolean(data.session?.user?.bankOnboardingCompleted);
        if (!cancelled) {
          setBankSetupCompleted(completed);
          if (!completed) {
            setIsError(true);
            setMessage('Bank account setup is required before payment. Complete setup using Email OTP + SMS OTP.');
          }
        }
      } catch (error) {
        if (!cancelled) {
          setIsError(true);
          setMessage(error.message || 'Unable to verify account setup status.');
        }
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadRazorpaySdk = async () => {
    if (typeof window === 'undefined') {
      return false;
    }

    if (window.Razorpay) {
      return true;
    }

    return await new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const onChange = (event) => {
    const { name, value } = event.target;
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const amountValue = Number(form.amount || 0);
  const payeeNormalized = form.payee.trim();

  const checks = useMemo(() => {
    return [
      { label: 'Authenticated session', ok: hasSession },
      { label: 'Bank setup completed (Email OTP + SMS OTP verified)', ok: bankSetupCompleted },
      { label: 'Valid recipient (3 to 80 chars)', ok: /^[A-Za-z0-9@._\-\s]{3,80}$/.test(payeeNormalized) },
      { label: 'Amount in secure range (1 to 500000 INR)', ok: Number.isFinite(amountValue) && amountValue >= 1 && amountValue <= 500000 },
      { label: 'PayShield PIN format (4 to 12 digits)', ok: /^\d{4,12}$/.test(form.payShieldPin) },
      { label: 'Mediator consent accepted', ok: agreed }
    ];
  }, [agreed, amountValue, bankSetupCompleted, form.payShieldPin, hasSession, payeeNormalized]);

  const canProceed = checks.every((check) => check.ok);

  const validateForm = () => {
    const errors = {};

    if (!hasSession) {
      errors.session = 'Login session is missing. Please sign in again.';
    }

    if (!bankSetupCompleted) {
      errors.bankSetup = 'Bank account setup is required first. Verify via email and SMS OTP.';
    }

    if (!/^[A-Za-z0-9@._\-\s]{3,80}$/.test(payeeNormalized)) {
      errors.payee = 'Payee must be 3 to 80 characters and can include letters, numbers, @ . _ -';
    }

    if (!Number.isFinite(amountValue) || amountValue < 1 || amountValue > 500000) {
      errors.amount = 'Amount must be between 1 and 500000 INR.';
    }

    if (!/^\d{4,12}$/.test(form.payShieldPin)) {
      errors.payShieldPin = 'PayShield PIN must be 4 to 12 digits.';
    }

    if (!agreed) {
      errors.consent = 'You must accept the mediator and security checks before payment.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onRazorpayCheckout = async () => {
    if (!validateForm()) {
      setIsError(true);
      setMessage('Please resolve all payment checks before continuing.');
      return;
    }

    const userId = profile.userId;

    setRazorpayLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const sdkReady = await loadRazorpaySdk();
      if (!sdkReady) {
        throw new Error('Razorpay SDK failed to load.');
      }

      const createOrderResponse = await authFetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          amount: amountValue,
          currency: 'INR',
          payShieldPin: form.payShieldPin,
          receipt: `ps_mediator_${Date.now()}`,
          notes: {
            payee: payeeNormalized,
            securityMode: 'mediator_razorpay_only',
            lang: String(lang)
          }
        })
      });

      const order = await createOrderResponse.json();
      if (!createOrderResponse.ok) {
        throw new Error(order.error || 'Unable to create Razorpay order.');
      }

      const options = {
        key: order.razorpayKeyId,
        amount: order.amount,
        currency: order.currency,
        name: 'PayShield',
        description: `Secure mediated payment to ${payeeNormalized || 'Recipient'}`,
        order_id: order.orderId,
        handler: async function (response) {
          try {
            const verifyResponse = await authFetch('/api/razorpay/verify-signature', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId,
                payShieldPin: form.payShieldPin,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              })
            });

            const verifyPayload = await verifyResponse.json();
            if (!verifyResponse.ok || !verifyPayload.verified) {
              throw new Error(verifyPayload.error || 'Razorpay signature verification failed.');
            }

            setIsError(false);
            setMessage('Razorpay payment completed and verified successfully.');
            setForm((prev) => ({ ...prev, amount: '', payShieldPin: '' }));
            setAgreed(false);
          } catch (error) {
            setIsError(true);
            setMessage(error.message || 'Razorpay verification failed.');
          }
        },
        modal: {
          escape: false,
          backdropclose: false
        },
        retry: {
          enabled: false
        },
        prefill: {
          name: profile.name || '',
          email: profile.email || '',
          contact: profile.phone || ''
        },
        theme: {
          color: '#1d4ed8'
        }
      };

      const checkout = new window.Razorpay(options);
      checkout.on('payment.failed', (failure) => {
        setIsError(true);
        setMessage(
          failure?.error?.description ||
          'Razorpay payment failed before verification.'
        );
      });
      checkout.open();
    } catch (error) {
      setIsError(true);
      setMessage(error.message || 'Razorpay checkout failed.');
    } finally {
      setRazorpayLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 620, margin: '0 auto', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '1.2rem' }}>
        <h1 className="page-title">Razorpay Secure Mediator</h1>
        <p style={{ color: '#64748b', marginBottom: '1rem' }}>
          Only Razorpay checkout is enabled. PayShield acts as the security mediator between user and payment service.
        </p>

        {!bankSetupCompleted ? (
          <div style={{ marginBottom: 14, border: '1px solid #fecaca', borderRadius: 10, padding: '0.8rem', background: '#fef2f2' }}>
            <p style={{ margin: 0, color: '#991b1b', fontWeight: 600 }}>Bank setup required before payment.</p>
            <p style={{ margin: '0.4rem 0 0', color: '#b91c1c', fontSize: 13 }}>
              Complete account setup with Email OTP + SMS OTP verification to unlock payments.
            </p>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ marginTop: 8 }}
              onClick={() => router.push(`/${lang}/bank-credentials`)}
            >
              Go to Account Setup
            </button>
          </div>
        ) : null}

        <div style={{ marginBottom: 14, border: '1px solid #e2e8f0', borderRadius: 10, padding: '0.8rem', background: '#f8fafc' }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 13 }}>Security Checks</p>
          <div style={{ marginTop: 8, display: 'grid', gap: 6 }}>
            {checks.map((check) => (
              <p key={check.label} style={{ margin: 0, fontSize: 13, color: check.ok ? '#166534' : '#b45309' }}>
                {check.ok ? 'PASS' : 'PENDING'} - {check.label}
              </p>
            ))}
          </div>
        </div>

        <form onSubmit={(event) => event.preventDefault()} style={{ display: 'grid', gap: 12 }}>
          <input
            name="payee"
            value={form.payee}
            onChange={onChange}
            placeholder="Payee name or UPI"
            required
            style={{ border: '1px solid #cbd5e1', borderRadius: 10, padding: '0.65rem 0.8rem' }}
          />
          {fieldErrors.payee ? <p style={{ margin: 0, color: '#b91c1c', fontSize: 12 }}>{fieldErrors.payee}</p> : null}
          <input
            name="amount"
            type="number"
            min="1"
            step="0.01"
            value={form.amount}
            onChange={onChange}
            placeholder="Amount (INR)"
            required
            style={{ border: '1px solid #cbd5e1', borderRadius: 10, padding: '0.65rem 0.8rem' }}
          />
          {fieldErrors.amount ? <p style={{ margin: 0, color: '#b91c1c', fontSize: 12 }}>{fieldErrors.amount}</p> : null}
          <input
            name="payShieldPin"
            type="password"
            value={form.payShieldPin}
            onChange={onChange}
            minLength={4}
            maxLength={12}
            placeholder="PayShield PIN"
            required
            style={{ border: '1px solid #cbd5e1', borderRadius: 10, padding: '0.65rem 0.8rem' }}
          />
          {fieldErrors.payShieldPin ? <p style={{ margin: 0, color: '#b91c1c', fontSize: 12 }}>{fieldErrors.payShieldPin}</p> : null}

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#334155' }}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={(event) => {
                setAgreed(event.target.checked);
                if (fieldErrors.consent) {
                  setFieldErrors((prev) => ({ ...prev, consent: '' }));
                }
              }}
            />
            <span>I understand PayShield mediates payment for security checks and launches only Razorpay checkout.</span>
          </label>
          {fieldErrors.consent ? <p style={{ margin: 0, color: '#b91c1c', fontSize: 12 }}>{fieldErrors.consent}</p> : null}
          {fieldErrors.session ? <p style={{ margin: 0, color: '#b91c1c', fontSize: 12 }}>{fieldErrors.session}</p> : null}
          {fieldErrors.bankSetup ? <p style={{ margin: 0, color: '#b91c1c', fontSize: 12 }}>{fieldErrors.bankSetup}</p> : null}

          <button
            type="button"
            className="btn btn-primary"
            onClick={onRazorpayCheckout}
            disabled={razorpayLoading || !canProceed}
          >
            {razorpayLoading ? 'Launching Razorpay...' : `Secure Pay With Razorpay (${lang.toUpperCase()})`}
          </button>
        </form>

        {message ? (
          <p style={{ marginTop: 12, color: isError ? '#b91c1c' : '#166534' }}>{message}</p>
        ) : null}
      </div>
    </div>
  );
}
