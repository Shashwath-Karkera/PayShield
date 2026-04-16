# PayShield

PayShield is a secure payment mediator between end users and payment processors (Razorpay Test Mode in this project). It combines cryptography, device trust, geo-risk checks, behavioral analysis, honeypot telemetry, and adaptive rate limiting.

This README is a complete setup and operations guide, including:
- Full local setup and requirements
- Environment configuration
- Database setup with Neon and Prisma
- Security architecture and flow
- How each user role works
- How each page works
- API authentication and usage behavior

## 1. Tech Stack

- Next.js App Router
- React
- Prisma ORM
- Neon PostgreSQL
- Argon2id password hashing
- AES-256-GCM field encryption
- RSA challenge-response for device authentication
- Razorpay Test API integration

## 2. Prerequisites

Install these first:

1. Node.js 20+ (recommended: latest LTS)
2. npm 10+
3. A Neon PostgreSQL database
4. Razorpay Test account (Key ID + Secret)
5. Git

Optional but useful:

1. Prisma VS Code extension
2. Postman (for API testing)

## 3. Project Setup

### Step 1: Install dependencies

```bash
npm install
```

### Step 2: Configure environment

Copy .env.example to .env and fill values.

Required values:

- DATABASE_URL
- DIRECT_URL
- APP_ENCRYPTION_KEY
- SPICE_PEPPER_KEY
- PAYSHIELD_JWT_ACCESS_SECRET
- PAYSHIELD_JWT_REFRESH_SECRET
- PAYSHIELD_RAZORPAY_KEY_ID
- PAYSHIELD_RAZORPAY_KEY_SECRET
- PAYSHIELD_ADMIN_EMAIL
- PAYSHIELD_ADMIN_USERNAME
- PAYSHIELD_ADMIN_PASSWORD
- PAYSHIELD_ADMIN_JWT_SECRET

Optional OTP provider values:

- EMAIL_OTP_PROVIDER (smtp|none)
- OTP_FROM_EMAIL
- SMTP_HOST
- SMTP_PORT
- SMTP_SECURE (true|false)
- SMTP_USER
- SMTP_PASS

Use strong secrets for APP_ENCRYPTION_KEY and SPICE_PEPPER_KEY.

Example secure key generation on PowerShell:

```powershell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
```

## 4. Database Setup (Neon + Prisma)

Run these from project root:

```bash
npx prisma generate
npx prisma migrate dev --name init_payshield
```

If you are setting up from scratch and want to reset local migration state:

```bash
npx prisma migrate reset
```

For a fully clean regenerate + reset flow:

```bash
npm run db:fresh
```

## 5. Run the App

Development:

```bash
npm run dev
```

Production build check:

```bash
npm run build
npm run start
```

## 6. Security Architecture (Implemented)

### 6.1 Registration

1. User submits registration details.
2. Password is protected with Salt + Pepper + Argon2id.
3. Device key pair is generated client-side (RSA).
4. Public key + device fingerprint are stored server-side.
5. Security answers are encrypted and stored.

### 6.2 Login (2-step)

1. Step 1: Password verification + geo/device risk computation.
2. Step 2: Server challenge signed by device private key.
3. Server verifies signature using stored public key.
4. Session token is issued (12-hour expiry).

### 6.3 Post-login Verification (Mandatory)

After primary login, user must complete:

1. Email OTP verification (generated + stored in DB)
2. SMS OTP verification (generated + stored in DB)
3. Device/IP consistency verification
4. SIM slot validation (registered default SIM1)
5. PayShield PIN setup (first time) or PIN verification (returning user)

Only after this does the session become fully verified.

### 6.4 Transactions

1. Protected route requires session token.
2. Adaptive rate limiting is evaluated:
	 - Normal rate: allow
	 - Burst traffic: delay
	 - Repeated suspicious traffic: block
3. Behavioral and anomaly signals are computed.
4. If high risk: flagged and redirected to Mirror Maze flow.
5. If normal: real ledger transaction succeeds.

### 6.5 Encryption

- Sensitive fields are encrypted using AES-256-GCM.
- Passwords are hashed with Argon2id.
- Device authentication uses RSA signature verification.

## 7. User Roles and How Each User Works

### 7.1 End User

Main journey:

1. Register account
2. Login securely
3. Complete /[lang]/verify checks (OTP + device/IP + SIM + PIN)
4. On first login, complete /[lang]/bank-credentials onboarding
5. Pay from /[lang]/payment (direct mediator or Razorpay checkout)
6. Use PayShield PIN for sending money and balance/transaction reads
7. If flagged, complete Childhood Whisper verification to resume real ledger

### 7.2 Security Analyst / Demo Operator

Main journey:

1. Use threat pages for visualization
2. Use threat2 and honeypot2 APIs for protected telemetry reads/writes
3. Validate suspicious behavior and event logs

### 7.3 Developer / Maintainer

Main journey:

1. Setup Neon + env + migrations
2. Run app and test auth/payment flow
3. Verify build before deployment
4. Rotate secrets and monitor route protections

## 8. Page-by-Page Behavior

### Public and localized pages

- /[lang]
	- Product landing page with feature overview.

- /[lang]/register
	- Account onboarding.
	- Collects identity, password, and security answers.
	- Generates/stores device key material and registers device public key.

- /[lang]/login
	- Executes two-step login flow (password + challenge-response).
	- Creates authenticated session token in browser storage.
	- Redirects to /[lang]/verify.

- /[lang]/verify
	- Verifies email OTP and SMS OTP.
	- Performs device/IP suspicious activity checks.
	- Enforces SIM slot match (SIM1 default).
	- Sets or validates PayShield PIN.

- /[lang]/security
	- Security controls page.
	- Allows updating Childhood Whisper answers through protected profile API.

- /[lang]/threat
- /[lang]/threat/forensics
- /[lang]/threat/honeypots
- /[lang]/threat/incidents
- /[lang]/threat/settings
	- Threat intelligence and visualization pages.

### Operational pages

- /[lang]/payment
	- Localized route wrapper for payment console.

- /[lang]/bank-credentials
	- Localized route wrapper for first-login onboarding.

- /payment
	- Protected payment console.
	- Supports:
		- Mediator payment flow (behavior/risk/rate-limit aware)
		- Razorpay order creation
		- Razorpay checkout popup flow
		- Signature verification callback
	- Includes secure logout action.
	- Requires PayShield PIN in payment payload.
	- Includes balance/transaction check action requiring PayShield PIN.

- /bank-credentials
	- Protected credential vault page.
	- Stores encrypted bank details.
	- Marks first-login onboarding as complete.

- /mirror-maze
	- Decoy view shown during high-risk transaction trap flow.
	- Real transfer requires additional verification.

- /health
- /notifications
- /qr
- /support
- /terms
	- Support, status, legal, and product UX pages.

## 9. API Inventory

### Authentication

- POST /api/auth/login
	- Step 1 login: validates password, computes risk, creates challenge.

- POST /api/auth/challenge
	- Step 2 login: verifies RSA signature and issues session.

- GET /api/auth/session?token=...
	- Validates and fetches session details.

- POST /api/auth/logout
	- Revokes current session.

- GET /api/auth/verify?verificationId=...
- POST /api/auth/verify
- POST /api/auth/verify/resend
	- Handles OTP/device/SIM/PIN verification stage.

### User and profile

- POST /api/users/register
- PATCH /api/profile

### Payments and transaction intelligence

- POST /api/payments
- GET /api/transactions?userId=<id>&mode=auto|real|mirror
- POST /api/security/childhood-whisper

### Bank vault

- POST /api/bank-credentials
- GET /api/bank-credentials?userId=<id>

### Razorpay

- POST /api/razorpay/create-order
- POST /api/razorpay/verify-signature

### Telemetry extensions

- GET /api/threat2?userId=<id>
- GET /api/honeypot2?userId=<id>
- POST /api/honeypot2

## 10. Protected Route Rules

Protected APIs require a session token in one of these headers:

1. Authorization: Bearer <token>
2. x-session-token: <token>

In addition, user-scoped APIs enforce ownership checks (session user must match requested userId).

Sensitive routes also require fully verified sessions by default (post-login verification completed).

## 11. Frontend Auth Request Pattern

Use the shared helper for protected requests:

- src/lib/http/authFetch.js

This helper automatically attaches Authorization bearer token from local storage.

## 12. Required Configuration Checklist

Before running end-to-end, verify all of these are done:

1. npm install completed
2. .env created from .env.example
3. Neon database URL values added
4. Strong APP_ENCRYPTION_KEY configured
5. Strong SPICE_PEPPER_KEY configured
6. Razorpay test keys configured
7. Prisma generate + migrate completed
8. npm run build passes
9. Register and login work
10. Payment and Razorpay checkout flows work

## 13. End-to-End Smoke Test

1. Start app with npm run dev
2. Register a new user
3. Login from same browser/device
4. Open Payment page
5. Create Razorpay test order
6. Trigger Razorpay checkout and complete test payment
7. Verify signature endpoint returns success
8. Confirm mediator payment returns SUCCESS or FLAGGED behavior as expected
9. Logout and verify protected pages no longer work without a valid session

## 14. Troubleshooting

### Prisma generate fails

- Ensure DATABASE_URL is set.
- Ensure Neon database is reachable.

### Login fails at challenge step

- Ensure browser supports Web Crypto API.
- Clear local storage and re-register device if key mismatch occurs.

### Razorpay order creation fails

- Verify RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are present.
- Confirm keys are test-mode keys.

### Protected route returns 401 or 403

- Ensure session token is attached.
- Ensure userId in payload matches session user.

## 15. Security Notes

1. Never commit .env to source control.
2. Rotate encryption and pepper secrets periodically.
3. Keep Razorpay keys in server-side secrets manager in production.
4. Add HTTPS-only deployment for production use.
5. Monitor security events and flagged transactions continuously.

