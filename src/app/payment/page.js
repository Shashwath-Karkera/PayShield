'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { collectDeviceFingerprint, getClientNetworkInfo } from '@/lib/security/clientDevice';
import { authFetch } from '@/lib/http/authFetch';

/* global Razorpay */

const initialState = {
  userId: '',
  amount: '',
  payee: '',
  locationCountry: 'India',
  locationCity: '',
  ipAddress: '',
  deviceDna: '',
  browserSignature: '',
  screenResolution: '',
  payShieldPin: '',
  mouseShakeIntensity: 20,
  scrollSpeed: 500,
  paymentFrequency: 1,
  transferAllIntent: false
};

export default function PaymentPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialState);
  const [response, setResponse] = useState(null);
  const [historyResponse, setHistoryResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orderResponse, setOrderResponse] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const submitMediatorPayment = async () => {
    const res = await authFetch('/api/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...form,
        amount: Number(form.amount),
        mouseShakeIntensity: Number(form.mouseShakeIntensity),
        scrollSpeed: Number(form.scrollSpeed),
        paymentFrequency: Number(form.paymentFrequency)
      })
    });

    const data = await res.json();
    setResponse({ ok: res.ok, data });

    if (res.ok && data?.transaction?.userId) {
      localStorage.setItem('ps_user_id', data.transaction.userId);
    }

    if (data?.redirectTo) {
      setTimeout(() => {
        router.push(data.redirectTo);
      }, 900);
    }

    return { ok: res.ok, data };
  };

  const ensureRazorpayScript = async () => {
    if (window.Razorpay) {
      return true;
    }

    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    const userId = localStorage.getItem('ps_user_id') || '';
    const sessionToken = localStorage.getItem('ps_session_token');

    if (!userId || !sessionToken) {
      router.push('/en/login');
      return;
    }

    const device = collectDeviceFingerprint();
    const network = getClientNetworkInfo();

    setForm((prev) => ({
      ...prev,
      userId,
      locationCountry: network.locationCountry,
      locationCity: network.locationCity,
      ipAddress: network.ipAddress,
      deviceDna: device.deviceDna,
      browserSignature: device.browserSignature,
      screenResolution: device.screenResolution
    }));
  }, [router]);

  const onChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await submitMediatorPayment();
    } catch (error) {
      setResponse({ ok: false, data: { error: error.message } });
    } finally {
      setLoading(false);
    }
  };

  const checkBalance = async () => {
    try {
      const params = new URLSearchParams({
        userId: form.userId,
        mode: 'auto',
        payShieldPin: form.payShieldPin
      });

      const res = await authFetch(`/api/transactions?${params.toString()}`);
      const data = await res.json();
      setHistoryResponse({ ok: res.ok, data });
    } catch (error) {
      setHistoryResponse({ ok: false, data: { error: error.message } });
    }
  };

  const createRazorpayOrder = async () => {
    setOrderLoading(true);
    setOrderResponse(null);

    try {
      const res = await authFetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: form.userId,
          amount: Number(form.amount || 0),
          currency: 'INR',
          notes: { payee: form.payee || 'unknown' }
        })
      });

      const data = await res.json();
      setOrderResponse({ ok: res.ok, data });
    } catch (error) {
      setOrderResponse({ ok: false, data: { error: error.message } });
    } finally {
      setOrderLoading(false);
    }
  };

  const handleRazorpayCheckout = async () => {
    setCheckoutLoading(true);
    setOrderResponse(null);

    try {
      const loaded = await ensureRazorpayScript();
      if (!loaded) {
        throw new Error('Unable to load Razorpay Checkout SDK.');
      }

      const orderRes = await authFetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: form.userId,
          amount: Number(form.amount || 0),
          currency: 'INR',
          notes: { payee: form.payee || 'unknown' }
        })
      });

      const orderData = await orderRes.json();
      setOrderResponse({ ok: orderRes.ok, data: orderData });

      if (!orderRes.ok) {
        throw new Error(orderData.error || 'Failed to create order for checkout.');
      }

      const options = {
        key: orderData.razorpayKeyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'PayShield',
        description: `Secure payment to ${form.payee}`,
        order_id: orderData.orderId,
        prefill: {
          email: localStorage.getItem('ps_user_email') || '',
          name: localStorage.getItem('ps_user_name') || ''
        },
        notes: {
          userId: form.userId,
          payee: form.payee
        },
        handler: async function onSuccess(paymentResult) {
          try {
            const verifyRes = await authFetch('/api/razorpay/verify-signature', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                userId: form.userId,
                razorpayOrderId: paymentResult.razorpay_order_id,
                razorpayPaymentId: paymentResult.razorpay_payment_id,
                razorpaySignature: paymentResult.razorpay_signature
              })
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.verified) {
              setResponse({ ok: false, data: { error: verifyData.error || 'Signature verification failed.' } });
              return;
            }

            await submitMediatorPayment();
          } catch (error) {
            setResponse({ ok: false, data: { error: error.message } });
          }
        }
      };

      const checkout = new window.Razorpay(options);
      checkout.on('payment.failed', function onFailed(event) {
        const reason = event?.error?.description || 'Payment was not completed.';
        setResponse({ ok: false, data: { error: reason } });
      });
      checkout.open();
    } catch (error) {
      setResponse({ ok: false, data: { error: error.message } });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authFetch('/api/auth/logout', {
        method: 'POST'
      });
    } finally {
      localStorage.removeItem('ps_session_token');
      localStorage.removeItem('ps_user_id');
      localStorage.removeItem('ps_user_email');
      localStorage.removeItem('ps_user_name');
      router.push('/en/login');
    }
  };

  return (
    <div className="page-container">
      <div className="container-narrow">
        <div className="page-header">
          <h1 className="page-title">Payment Gateway</h1>
          <p className="page-subtitle">Execute payments with behavioral risk scoring, device validation, and adaptive fraud controls.</p>
          <div style={{ marginTop: 12 }}>
            <button type="button" className="btn btn-secondary" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="auth-form" style={{ marginBottom: 24 }}>
          <input className="form-input" name="userId" value={form.userId} onChange={onChange} placeholder="User ID" required />
          <input className="form-input" name="payee" value={form.payee} onChange={onChange} placeholder="Payee / UPI ID" required />
          <input className="form-input" name="amount" value={form.amount} onChange={onChange} placeholder="Amount" required />
          <input className="form-input" name="locationCountry" value={form.locationCountry} onChange={onChange} placeholder="Country" required />
          <input className="form-input" name="locationCity" value={form.locationCity} onChange={onChange} placeholder="City" required />
          <input className="form-input" name="ipAddress" value={form.ipAddress} onChange={onChange} placeholder="IP Address" required />
          <input className="form-input" name="deviceDna" value={form.deviceDna} onChange={onChange} placeholder="Device DNA" required />
          <input className="form-input" name="browserSignature" value={form.browserSignature} onChange={onChange} placeholder="Browser Signature" required />
          <input className="form-input" name="screenResolution" value={form.screenResolution} onChange={onChange} placeholder="Screen Resolution" required />
          <input
            className="form-input"
            type="password"
            name="payShieldPin"
            value={form.payShieldPin}
            onChange={onChange}
            placeholder="PayShield PIN"
            required
          />

          <input className="form-input" name="mouseShakeIntensity" value={form.mouseShakeIntensity} onChange={onChange} placeholder="Mouse shake intensity (0-100)" required />
          <input className="form-input" name="scrollSpeed" value={form.scrollSpeed} onChange={onChange} placeholder="Scroll speed" required />
          <input className="form-input" name="paymentFrequency" value={form.paymentFrequency} onChange={onChange} placeholder="Payment frequency" required />

          <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="checkbox" name="transferAllIntent" checked={form.transferAllIntent} onChange={onChange} />
            Transfer all money intent
          </label>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Processing...' : 'Pay'}
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-full"
            onClick={createRazorpayOrder}
            disabled={orderLoading || !form.amount}
          >
            {orderLoading ? 'Creating Razorpay Order...' : 'Create Razorpay Test Order'}
          </button>

          <button
            type="button"
            className="btn btn-primary btn-full"
            onClick={handleRazorpayCheckout}
            disabled={checkoutLoading || !form.amount || !form.payee}
          >
            {checkoutLoading ? 'Launching Razorpay Checkout...' : 'Pay with Razorpay Checkout'}
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-full"
            onClick={checkBalance}
            disabled={!form.payShieldPin}
          >
            Check Balance and Transactions
          </button>
        </form>

        {response ? (
          <pre style={{ background: '#0f172a', color: '#e2e8f0', padding: 16, borderRadius: 8, overflowX: 'auto' }}>
            {JSON.stringify(response.data, null, 2)}
          </pre>
        ) : null}

        {orderResponse ? (
          <pre style={{ marginTop: 12, background: '#111827', color: '#e5e7eb', padding: 16, borderRadius: 8, overflowX: 'auto' }}>
            {JSON.stringify(orderResponse.data, null, 2)}
          </pre>
        ) : null}

        {historyResponse ? (
          <pre style={{ marginTop: 12, background: '#052e16', color: '#dcfce7', padding: 16, borderRadius: 8, overflowX: 'auto' }}>
            {JSON.stringify(historyResponse.data, null, 2)}
          </pre>
        ) : null}
      </div>
    </div>
  );
}
