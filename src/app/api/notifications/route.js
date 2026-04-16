import { requireSession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

function classifySecurityEventType(type) {
  const upper = String(type || '').toUpperCase();

  if (upper.includes('PAYMENT') || upper.includes('RAZORPAY')) {
    return 'payment';
  }

  if (upper.includes('LOGIN') || upper.includes('DEVICE') || upper.includes('SIM') || upper.includes('FLAGGED') || upper.includes('BLOCK')) {
    return 'security';
  }

  return 'system';
}

function priorityFromSecurityType(type) {
  const upper = String(type || '').toUpperCase();
  if (upper.includes('BLOCK') || upper.includes('FAILED') || upper.includes('FLAGGED')) {
    return 'high';
  }
  if (upper.includes('MISMATCH') || upper.includes('DELAY')) {
    return 'medium';
  }
  return 'normal';
}

function titleFromSecurityType(type) {
  return String(type || 'SYSTEM_EVENT')
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function iconFromCategory(category, priority) {
  if (category === 'payment') return '💸';
  if (category === 'security' && priority === 'high') return '🚨';
  if (category === 'security') return '🛡️';
  return 'ℹ️';
}

function formatSecurityMessage(event) {
  const meta = event.metadata && typeof event.metadata === 'object' ? event.metadata : {};
  const parts = [];

  if (meta.reason) parts.push(`Reason: ${meta.reason}`);
  if (meta.reasons && Array.isArray(meta.reasons) && meta.reasons.length > 0) {
    parts.push(`Reasons: ${meta.reasons.join(', ')}`);
  }
  if (meta.payee) parts.push(`Payee: ${meta.payee}`);
  if (meta.amount) parts.push(`Amount: INR ${meta.amount}`);
  if (event.ipAddress) parts.push(`IP: ${event.ipAddress}`);

  if (parts.length === 0) {
    parts.push('Security event recorded by PayShield.');
  }

  return parts.join(' | ');
}

export async function GET(request) {
  try {
    const auth = await requireSession(request);
    if (!auth.ok) {
      return auth.response;
    }

    const userId = auth.session.userId;

    const [securityEvents, transactions] = await Promise.all([
      prisma.securityEvent.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 60
      }),
      prisma.transaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 40
      })
    ]);

    const eventNotifications = securityEvents.map((event) => {
      const category = classifySecurityEventType(event.type);
      const priority = priorityFromSecurityType(event.type);
      return {
        id: `se_${event.id}`,
        category,
        icon: iconFromCategory(category, priority),
        title: titleFromSecurityType(event.type),
        message: formatSecurityMessage(event),
        createdAt: event.createdAt,
        read: false,
        priority,
        tags: [event.type]
      };
    });

    const transactionNotifications = transactions.map((tx) => {
      const status = String(tx.status || 'SUCCESS').toUpperCase();
      const isFlagged = status === 'FLAGGED';
      return {
        id: `tx_${tx.id}`,
        category: 'payment',
        icon: isFlagged ? '⚠️' : '✅',
        title: isFlagged ? 'Payment Flagged' : 'Payment Recorded',
        message: `Payee: ${tx.payee} | Amount: INR ${Number(tx.amount || 0).toFixed(2)} | Ledger: ${tx.ledgerType}`,
        createdAt: tx.createdAt,
        read: false,
        priority: isFlagged ? 'high' : 'normal',
        tags: [tx.status, tx.ledgerType]
      };
    });

    const notifications = [...eventNotifications, ...transactionNotifications]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 100);

    return Response.json(
      {
        notifications,
        summary: {
          total: notifications.length,
          highPriority: notifications.filter((item) => item.priority === 'high').length,
          payments: notifications.filter((item) => item.category === 'payment').length
        }
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch notifications.', detail: String(error.message || error) },
      { status: 500 }
    );
  }
}
