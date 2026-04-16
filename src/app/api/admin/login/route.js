import jwt from 'jsonwebtoken';

function getAdminConfig() {
  return {
    username: (process.env.PAYSHIELD_ADMIN_USERNAME || '').trim(),
    password: (process.env.PAYSHIELD_ADMIN_PASSWORD || '').trim(),
    email: (process.env.PAYSHIELD_ADMIN_EMAIL || process.env.SYSTEM_ADMIN_EMAIL || '').trim().toLowerCase(),
    secret: (
      process.env.PAYSHIELD_ADMIN_JWT_SECRET ||
      process.env.PAYSHIELD_JWT_ACCESS_SECRET ||
      process.env.JWT_SECRET ||
      ''
    ).trim()
  };
}

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    const cfg = getAdminConfig();

    if (!cfg.username || !cfg.password || !cfg.secret) {
      return Response.json(
        { error: 'Admin credentials are not configured in environment variables.' },
        { status: 500 }
      );
    }

    if (String(username || '').trim() !== cfg.username || String(password || '').trim() !== cfg.password) {
      return Response.json({ error: 'Invalid admin credentials.' }, { status: 401 });
    }

    const token = jwt.sign(
      {
        scope: 'admin-console',
        email: cfg.email || null,
        username: cfg.username
      },
      cfg.secret,
      { expiresIn: '8h' }
    );

    return Response.json({ ok: true, token }, { status: 200 });
  } catch (error) {
    return Response.json(
      { error: 'Admin login failed.', detail: String(error.message || error) },
      { status: 500 }
    );
  }
}
