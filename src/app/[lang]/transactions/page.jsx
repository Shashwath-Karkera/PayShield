'use client';

import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { authFetch } from '@/lib/http/authFetch';

export default function TransactionsPage() {
  const params = useParams();
  const lang = params?.lang || 'en';

  const [payShieldPin, setPayShieldPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const totalAmount = useMemo(() => {
    if (!result?.transactions?.length) return 0;
    return result.transactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  }, [result]);

  const loadTransactions = async (event) => {
    event.preventDefault();

    const userId = localStorage.getItem('ps_user_id');
    if (!userId) {
      setError('Login is required to view transactions.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const url = `/api/transactions?userId=${encodeURIComponent(userId)}&payShieldPin=${encodeURIComponent(payShieldPin)}&mode=auto`;
      const response = await authFetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to fetch transactions.');
      }

      setResult(data);
    } catch (err) {
      setResult(null);
      setError(err.message || 'Unable to fetch transactions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <h1 className="page-title">Transactions</h1>
        <p style={{ color: '#64748b', marginBottom: '1rem' }}>
          Enter your PayShield PIN to load secure ledger data.
        </p>

        <form onSubmit={loadTransactions} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          <input
            type="password"
            value={payShieldPin}
            onChange={(e) => setPayShieldPin(e.target.value)}
            placeholder="PayShield PIN"
            required
            minLength={4}
            maxLength={12}
            style={{
              minWidth: 240,
              border: '1px solid #cbd5e1',
              borderRadius: 10,
              padding: '0.65rem 0.8rem',
              fontSize: 14
            }}
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Loading...' : 'Load Transactions'}
          </button>
        </form>

        {error ? <p style={{ color: '#b91c1c', marginBottom: '1rem' }}>{error}</p> : null}

        {result ? (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 12,
              marginBottom: '1rem'
            }}>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '0.9rem' }}>
                <p style={{ margin: 0, color: '#64748b', fontSize: 13 }}>Mode</p>
                <p style={{ margin: '0.35rem 0 0', fontWeight: 700 }}>{result.mode || 'auto'}</p>
              </div>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '0.9rem' }}>
                <p style={{ margin: 0, color: '#64748b', fontSize: 13 }}>Genuinity Score</p>
                <p style={{ margin: '0.35rem 0 0', fontWeight: 700 }}>{result.genuinityScore ?? 'N/A'}</p>
              </div>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '0.9rem' }}>
                <p style={{ margin: 0, color: '#64748b', fontSize: 13 }}>Total Volume</p>
                <p style={{ margin: '0.35rem 0 0', fontWeight: 700 }}>₹{totalAmount.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: 12, background: '#fff' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: 13 }}>Date</th>
                    <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: 13 }}>Payee</th>
                    <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: 13 }}>Status</th>
                    <th style={{ textAlign: 'left', padding: '0.75rem', fontSize: 13 }}>Ledger</th>
                    <th style={{ textAlign: 'right', padding: '0.75rem', fontSize: 13 }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {result.transactions?.length ? (
                    result.transactions.map((tx) => (
                      <tr key={tx.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.75rem', fontSize: 13 }}>{new Date(tx.createdAt).toLocaleString()}</td>
                        <td style={{ padding: '0.75rem', fontSize: 13 }}>{tx.payee}</td>
                        <td style={{ padding: '0.75rem', fontSize: 13 }}>{tx.status}</td>
                        <td style={{ padding: '0.75rem', fontSize: 13 }}>{tx.ledgerType}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600 }}>₹{Number(tx.amount || 0).toLocaleString('en-IN')}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>No transactions found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
