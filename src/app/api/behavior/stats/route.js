import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth/session';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

function getSystemAdminEmail() {
  return (
    process.env.PAYSHIELD_ADMIN_EMAIL ||
    process.env.SYSTEM_ADMIN_EMAIL ||
    ''
  )
    .trim()
    .toLowerCase();
}

function getAdminJwtSecret() {
  return (
    process.env.PAYSHIELD_ADMIN_JWT_SECRET ||
    process.env.PAYSHIELD_JWT_ACCESS_SECRET ||
    process.env.JWT_SECRET ||
    ''
  ).trim();
}

function extractAdminToken(request) {
  const explicit = request.headers.get('x-admin-token');
  if (explicit) {
    return explicit.trim();
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice('Bearer '.length).trim();
  }

  return '';
}

function isSuspiciousSecurityType(type) {
  const source = String(type || '').toUpperCase();
  const tokens = [
    'BLOCK',
    'FAILED',
    'FLAG',
    'SUSPIC',
    'ANOMAL',
    'THREAT',
    'HONEYPOT',
    'FROZEN',
    'MISMATCH',
    'DECLIN',
    'RATE'
  ];
  return tokens.some((token) => source.includes(token));
}

function riskFromSecurityType(type) {
  const source = String(type || '').toUpperCase();
  if (source.includes('BLOCK') || source.includes('FROZEN') || source.includes('FAILED')) {
    return 95;
  }
  if (source.includes('FLAG') || source.includes('HONEYPOT') || source.includes('THREAT')) {
    return 85;
  }
  if (source.includes('RATE') || source.includes('MISMATCH')) {
    return 75;
  }
  return 65;
}

function actionFromSecurityType(type) {
  const source = String(type || '').toUpperCase();
  if (source.includes('BLOCK') || source.includes('FAILED') || source.includes('FROZEN')) {
    return 'block';
  }
  if (source.includes('FLAG') || source.includes('HONEYPOT') || source.includes('MISMATCH')) {
    return 'require_otp';
  }
  return 'allow';
}

function formatNotificationMessage(threat) {
  const rules = Array.isArray(threat.triggeredRules) ? threat.triggeredRules : [];
  if (rules.length > 0) {
    return rules.slice(0, 3).join(' | ');
  }
  return `${threat.eventType || 'Security anomaly'} detected.`;
}

function toNotification(threat) {
  const priority = threat.riskScore >= 90 ? 'high' : threat.riskScore >= 75 ? 'medium' : 'normal';
  return {
    id: `ntf_${threat.id}`,
    title: threat.eventType || 'Security Alert',
    message: formatNotificationMessage(threat),
    priority,
    category: 'security',
    createdAt: threat.createdAt,
    tags: [threat.source || 'security', threat.actionTaken || 'allow']
  };
}

export async function GET(request) {
  try {
    const adminToken = extractAdminToken(request);
    const adminJwtSecret = getAdminJwtSecret();

    let isAdmin = false;
    if (adminToken && adminJwtSecret) {
      try {
        const decoded = jwt.verify(adminToken, adminJwtSecret);
        if (decoded?.scope === 'admin-console') {
          isAdmin = true;
        }
      } catch {
        // Fall back to session-based validation.
      }
    }

    if (!isAdmin) {
      const auth = await requireSession(request, undefined, { requireVerified: false });
      if (!auth.ok) {
        return auth.response;
      }

      const configuredAdmin = getSystemAdminEmail();
      const sessionEmail = String(auth.session?.user?.email || '').toLowerCase();
      if (!configuredAdmin || configuredAdmin !== sessionEmail) {
        return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
      }
    }

    const [behavioralSuspicious, securityEventsRaw, flaggedTransactions] = await Promise.all([
      prisma.behavioralEvent.findMany({
        select: {
          id: true,
          userId: true,
          eventType: true,
          riskScore: true,
          triggeredRules: true,
          actionTaken: true,
          createdAt: true
        },
        where: {
          OR: [
            { actionTaken: { in: ['block', 'require_otp'] } },
            { riskScore: { gte: 70 } }
          ]
        },
        orderBy: { createdAt: 'desc' },
        take: 120
      }),
      prisma.securityEvent.findMany({
        select: {
          id: true,
          userId: true,
          type: true,
          ipAddress: true,
          metadata: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 180
      }),
      prisma.transaction.findMany({
        select: {
          id: true,
          userId: true,
          amount: true,
          payee: true,
          status: true,
          ledgerType: true,
          locationCountry: true,
          locationCity: true,
          createdAt: true
        },
        where: {
          OR: [
            { status: { in: ['FLAGGED', 'FROZEN', 'DECLINED'] } },
            { ledgerType: 'MIRROR' }
          ]
        },
        orderBy: { createdAt: 'desc' },
        take: 120
      })
    ]);

    const securitySuspicious = securityEventsRaw.filter((event) => isSuspiciousSecurityType(event.type));

    const behavioralThreats = behavioralSuspicious.map((event) => ({
      id: `be_${event.id}`,
      source: 'behavior',
      userId: event.userId,
      eventType: event.eventType,
      actionTaken: event.actionTaken,
      riskScore: Number(event.riskScore || 0),
      triggeredRules: Array.isArray(event.triggeredRules) ? event.triggeredRules : [],
      createdAt: event.createdAt
    }));

    const securityThreats = securitySuspicious.map((event) => {
      const details = event.metadata && typeof event.metadata === 'object' ? event.metadata : {};
      const reasons = [];

      if (event.type) reasons.push(`type:${event.type}`);
      if (details.reason) reasons.push(`reason:${details.reason}`);
      if (details.reasons && Array.isArray(details.reasons)) {
        reasons.push(...details.reasons.map((entry) => String(entry)));
      }
      if (details.ipAddress || event.ipAddress) {
        reasons.push(`ip:${details.ipAddress || event.ipAddress}`);
      }

      return {
        id: `se_${event.id}`,
        source: 'security',
        userId: event.userId,
        eventType: event.type,
        actionTaken: actionFromSecurityType(event.type),
        riskScore: riskFromSecurityType(event.type),
        triggeredRules: reasons,
        createdAt: event.createdAt
      };
    });

    const transactionThreats = flaggedTransactions.map((tx) => ({
      id: `tx_${tx.id}`,
      source: 'transaction',
      userId: tx.userId,
      eventType: `TX_${tx.status}_${tx.ledgerType}`,
      actionTaken: tx.status === 'FLAGGED' ? 'require_otp' : 'block',
      riskScore: tx.status === 'FLAGGED' ? 85 : 92,
      triggeredRules: [
        `payee:${tx.payee}`,
        `amount:${Number(tx.amount || 0)}`,
        `ledger:${tx.ledgerType}`,
        `status:${tx.status}`,
        tx.locationCountry ? `country:${tx.locationCountry}` : null,
        tx.locationCity ? `city:${tx.locationCity}` : null
      ].filter(Boolean),
      createdAt: tx.createdAt
    }));

    const mergedThreats = [...behavioralThreats, ...securityThreats, ...transactionThreats]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const blockedAttempts = mergedThreats.filter((threat) => threat.actionTaken === 'block').length;
    const recentThreats = mergedThreats.slice(0, 50);
    const recentNotifications = recentThreats.slice(0, 30).map(toNotification);

    return NextResponse.json({
      totalEvents: mergedThreats.length,
      blockedAttempts,
      recentThreats,
      notificationSummary: {
        total: recentNotifications.length,
        highPriority: recentNotifications.filter((item) => item.priority === 'high').length,
        mediumPriority: recentNotifications.filter((item) => item.priority === 'medium').length
      },
      recentNotifications
    });
  } catch (error) {
    console.error("Behavior stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
