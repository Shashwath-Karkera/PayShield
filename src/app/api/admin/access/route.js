import { requireSession } from '@/lib/auth/session';
import jwt from 'jsonwebtoken';

function getSystemAdminEmail() {
  return (
    process.env.PAYSHIELD_ADMIN_EMAIL ||
    process.env.SYSTEM_ADMIN_EMAIL ||
    process.env.NEXT_PUBLIC_SYSTEM_ADMIN_EMAIL ||
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

export async function GET(request) {
  try {
    const adminToken = extractAdminToken(request);
    const adminJwtSecret = getAdminJwtSecret();
    if (adminToken && adminJwtSecret) {
      try {
        const decoded = jwt.verify(adminToken, adminJwtSecret);
        if (decoded?.scope === 'admin-console') {
          return Response.json(
            {
              isSystemAdmin: true,
              hasAdminConfig: true,
              email: decoded.email || null,
              mode: 'admin-token'
            },
            { status: 200 }
          );
        }
      } catch {
        // Continue to session-based validation.
      }
    }

    const auth = await requireSession(request, undefined, { requireVerified: false });
    if (!auth.ok) {
      return auth.response;
    }

    const configuredAdminEmail = getSystemAdminEmail();
    const userEmail = (auth.session?.user?.email || '').trim().toLowerCase();

    return Response.json(
      {
        isSystemAdmin: Boolean(configuredAdminEmail) && userEmail === configuredAdminEmail,
        hasAdminConfig: Boolean(configuredAdminEmail),
        email: auth.session?.user?.email || null
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { error: 'Failed to verify admin access.', detail: String(error.message || error) },
      { status: 500 }
    );
  }
}
