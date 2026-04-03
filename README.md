
## PayShield Backend Security Stack

This project now includes:

- Prisma schema for Neon/PostgreSQL in `prisma/schema.prisma`
- Secure API routes for user registration, payments, profile updates, Childhood Whisper verification, and transaction history
- Bank credential vault endpoint and page with AES-256-GCM encryption
- Isolation Forest ML script in `ml/isolation_forest_detector.py`

### Environment Variables

Create a `.env` file using `.env.example`.

Required variables:

- `DATABASE_URL`
- `DIRECT_URL`
- `APP_ENCRYPTION_KEY`
- `SPICE_PEPPER_KEY`

### Prisma Setup

Generate Prisma client:

```bash
npx prisma generate
```

Create and run migration:

```bash
npx prisma migrate dev --name init_payshield_security
```

### API Routes Added

- `POST /api/users/register`
- `POST /api/payments`
- `POST /api/security/childhood-whisper`
- `GET /api/transactions?userId=<id>&mode=auto|real|mirror`
- `POST /api/bank-credentials`
- `GET /api/bank-credentials?userId=<id>`
- `PATCH /api/profile`

### ML Script (Isolation Forest)

Install Python dependencies:

```bash
pip install -r ml/requirements.txt
```

Run anomaly inference:

```bash
python ml/isolation_forest_detector.py --input-json "{\"amount_ratio\":0.95,\"mouse_shake_intensity\":92,\"scroll_speed\":2200,\"payment_frequency\":12,\"transfer_all_intent\":true,\"location_mismatch\":true,\"device_mismatch\":true,\"current_country\":\"china\"}"
```
