# Threat Dashboard Admin Access

This guide explains how to access the Threat Dashboard as an admin user.

## 1. Configure Environment Variables

Set these variables in your environment:

- `PAYSHIELD_ADMIN_USERNAME`
- `PAYSHIELD_ADMIN_PASSWORD`
- `PAYSHIELD_ADMIN_EMAIL`
- `PAYSHIELD_ADMIN_JWT_SECRET`

If `PAYSHIELD_ADMIN_JWT_SECRET` is not set, the app falls back to:

- `PAYSHIELD_JWT_ACCESS_SECRET`
- `JWT_SECRET`

## 2. Start the Application

Run the app and ensure the server is healthy.

## 3. Login to Admin Portal

Open:

- `/admin/login`

Enter:

- `PAYSHIELD_ADMIN_USERNAME`
- `PAYSHIELD_ADMIN_PASSWORD`

On success, a signed admin token is stored in browser local storage (`ps_admin_token`).

## 4. Open Threat Dashboard

Navigate to:

- `/admin/threats`

Access is granted when either of these is valid:

- Admin token (`ps_admin_token`) signed with admin secret and scope `admin-console`
- Authenticated user session with email matching `PAYSHIELD_ADMIN_EMAIL`

## 5. Troubleshooting

- If redirected back to `/admin/login`, verify username/password and admin secret configuration.
- If authenticated user cannot see admin content, verify `PAYSHIELD_ADMIN_EMAIL` matches the session email exactly.
- If stats are blocked with 403, ensure the request is using valid admin auth (session or admin token).

## 6. Security Notes

- Keep `PAYSHIELD_ADMIN_JWT_SECRET` strong and private.
- Rotate admin credentials periodically.
- Do not use shared/non-admin user credentials for threat dashboard access.
