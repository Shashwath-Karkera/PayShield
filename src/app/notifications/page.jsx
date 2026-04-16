'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { authFetch } from '@/lib/http/authFetch';

const FILTERS = ['All', 'Security', 'Payments', 'System'];

const PRIORITY_COLOR = {
  high: { bg: '#fee2e2', text: '#dc2626', border: '#fca5a5' },
  medium: { bg: '#fef3c7', text: '#b45309', border: '#fcd34d' },
  normal: { bg: '#f0fdf4', text: '#15803d', border: '#86efac' }
};

export default function Notifications() {
  const [filter, setFilter] = useState('All');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadNotifications() {
      try {
        const res = await authFetch('/api/notifications');
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Unable to load notifications.');
        }

        if (!cancelled) {
          setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Unable to load notifications.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadNotifications();
    return () => {
      cancelled = true;
    };
  }, []);

  const unreadCount = notifications.filter((item) => !item.read).length;

  const filtered = useMemo(() => {
    return notifications.filter((item) => {
      if (filter === 'All') return true;
      if (filter === 'Security') return item.category === 'security';
      if (filter === 'Payments') return item.category === 'payment';
      if (filter === 'System') return item.category === 'system';
      return true;
    });
  }, [filter, notifications]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const markRead = (id) => {
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
  };

  const dismiss = (id) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  const highPriorityCount = notifications.filter((item) => item.priority === 'high').length;
  const paymentCount = notifications.filter((item) => item.category === 'payment').length;

  return (
    <div className="page-container" style={{ padding: '1.5rem 1rem', background: '#f1f5f9', minHeight: '100vh' }}>
      <div style={{ maxWidth: 920, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link href="/dashboard" className="btn btn-secondary">Back</Link>
            <div>
              <h1 style={{ margin: 0 }}>Notifications</h1>
              <p style={{ margin: 0, color: '#64748b', fontSize: 13 }}>Live security events and transaction updates from DB</p>
            </div>
          </div>
          {unreadCount > 0 ? (
            <button onClick={markAllRead} className="btn btn-secondary">Mark all as read</button>
          ) : null}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10, marginBottom: 14 }}>
          <SummaryCard label="Security Alerts" value={highPriorityCount} color="#ef4444" />
          <SummaryCard label="Unread" value={unreadCount} color="#2563eb" />
          <SummaryCard label="Payments" value={paymentCount} color="#10b981" />
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          {FILTERS.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setFilter(name)}
              className="btn"
              style={{
                background: filter === name ? '#1d4ed8' : '#fff',
                color: filter === name ? '#fff' : '#334155',
                border: '1px solid #cbd5e1',
                borderRadius: 10,
                padding: '0.4rem 0.8rem'
              }}
            >
              {name}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          {loading ? <p>Loading notifications...</p> : null}
          {!loading && error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}
          {!loading && !error && filtered.length === 0 ? (
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1rem' }}>
              No notifications available.
            </div>
          ) : null}

          {!loading && !error
            ? filtered.map((item) => (
                <NotificationCard key={item.id} item={item} onRead={markRead} onDismiss={dismiss} />
              ))
            : null}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '0.9rem' }}>
      <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>{label}</p>
      <p style={{ margin: '0.25rem 0 0', fontSize: 24, fontWeight: 800, color }}>{value}</p>
    </div>
  );
}

function NotificationCard({ item, onRead, onDismiss }) {
  const priority = PRIORITY_COLOR[item.priority] || PRIORITY_COLOR.normal;
  const created = item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Unknown time';

  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden' }}>
      {item.priority === 'high' ? (
        <div style={{ background: priority.bg, color: priority.text, padding: '0.5rem 0.8rem', fontSize: 12, fontWeight: 700 }}>
          High priority security event
        </div>
      ) : null}

      <div style={{ padding: '0.85rem 0.9rem', display: 'grid', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          <p style={{ margin: 0, fontWeight: 700, color: '#0f172a' }}>
            {item.icon || 'i'} {item.title}
          </p>
          <span style={{ fontSize: 12, color: '#64748b' }}>{created}</span>
        </div>

        <p style={{ margin: 0, color: '#475569', fontSize: 13 }}>{item.message}</p>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {(item.tags || []).map((tag) => (
              <span key={tag} style={{ fontSize: 11, background: '#e2e8f0', color: '#334155', borderRadius: 999, padding: '0.15rem 0.5rem' }}>
                {tag}
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {!item.read ? (
              <button type="button" className="btn btn-secondary" onClick={() => onRead(item.id)}>Read</button>
            ) : null}
            <button type="button" className="btn btn-secondary" onClick={() => onDismiss(item.id)}>Dismiss</button>
          </div>
        </div>
      </div>
    </div>
  );
}
