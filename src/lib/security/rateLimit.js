import { prisma } from '@/lib/prisma';

const WINDOW_MS = 2 * 60 * 1000;
const SOFT_LIMIT = 5;
const HARD_LIMIT = 10;

export async function evaluateRateLimit({ userId, ipAddress }) {
  const since = new Date(Date.now() - WINDOW_MS);

  const count = await prisma.securityEvent.count({
    where: {
      type: 'PAYMENT_REQUEST',
      createdAt: { gte: since },
      OR: [{ userId }, { ipAddress }]
    }
  });

  if (count >= HARD_LIMIT) {
    return { decision: 'BLOCK', delayMs: 0, count };
  }

  if (count >= SOFT_LIMIT) {
    const delayMs = Math.min(15000, (count - SOFT_LIMIT + 1) * 3000);
    return { decision: 'DELAY', delayMs, count };
  }

  return { decision: 'ALLOW', delayMs: 0, count };
}
