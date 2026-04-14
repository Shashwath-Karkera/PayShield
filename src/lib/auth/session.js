import { prisma } from '@/lib/prisma';

function extractToken(request) {
  const authHeader = request.headers.get('authorization');
  const sessionHeader = request.headers.get('x-session-token');

  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice('Bearer '.length).trim();
  }

  if (sessionHeader) {
    return sessionHeader.trim();
  }

  return null;
}

export async function requireSession(request, expectedUserId, options = {}) {
  const { requireVerified = true } = options;
  const token = extractToken(request);

  if (!token) {
    return {
      ok: false,
      response: Response.json({ error: 'Missing session token.' }, { status: 401 })
    };
  }

  const session = await prisma.session.findUnique({
    where: { token },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          isFrozen: true,
          frozenReason: true
        }
      }
    }
  });

  if (!session || session.revokedAt || new Date(session.expiresAt).getTime() < Date.now()) {
    return {
      ok: false,
      response: Response.json({ error: 'Invalid or expired session.' }, { status: 401 })
    };
  }

  if (expectedUserId && session.userId !== expectedUserId) {
    return {
      ok: false,
      response: Response.json({ error: 'Session does not match the target user.' }, { status: 403 })
    };
  }

  if (requireVerified && !session.isVerified) {
    return {
      ok: false,
      response: Response.json(
        { error: 'Additional verification required before accessing this resource.' },
        { status: 403 }
      )
    };
  }

  return {
    ok: true,
    session
  };
}
