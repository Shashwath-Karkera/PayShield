-- PayShield baseline security schema (Prisma-aligned)
-- This migration creates the canonical tables used by Prisma models.

DO $$
BEGIN
  CREATE TYPE "TransactionStatus" AS ENUM ('SUCCESS', 'FLAGGED', 'DECLINED', 'FROZEN');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "LedgerType" AS ENUM ('REAL', 'MIRROR');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "phone" TEXT,
  "passwordHash" TEXT NOT NULL,
  "spiceSalt" TEXT NOT NULL,
  "balance" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "isFrozen" BOOLEAN NOT NULL DEFAULT false,
  "frozenReason" TEXT,
  "childhoodWhisperMotherEnc" TEXT NOT NULL,
  "childhoodWhisperPetEnc" TEXT NOT NULL,
  "lastKnownCountry" TEXT,
  "lastKnownCity" TEXT,
  "lastKnownIp" TEXT,
  "lastKnownDeviceDna" TEXT,
  "genuinityScore" INTEGER NOT NULL DEFAULT 100,
  "payShieldPinHash" TEXT,
  "registeredSimSlot" TEXT NOT NULL DEFAULT 'SIM1',
  "bankOnboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
  "firstLoginCompleted" BOOLEAN NOT NULL DEFAULT false,
  "lastLoginAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

CREATE TABLE IF NOT EXISTS "DeviceCredential" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "deviceDna" TEXT NOT NULL,
  "deviceName" TEXT,
  "publicKeyPem" TEXT NOT NULL,
  "browserSignature" TEXT,
  "screenResolution" TEXT,
  "trusted" BOOLEAN NOT NULL DEFAULT true,
  "lastSeenIp" TEXT,
  "lastSeenCountry" TEXT,
  "lastSeenCity" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastUsedAt" TIMESTAMP(3),
  CONSTRAINT "DeviceCredential_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "DeviceCredential_userId_deviceDna_key"
  ON "DeviceCredential"("userId", "deviceDna");

CREATE TABLE IF NOT EXISTS "LoginChallenge" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "deviceCredentialId" TEXT,
  "challenge" TEXT NOT NULL,
  "ipAddress" TEXT NOT NULL,
  "locationCountry" TEXT,
  "locationCity" TEXT,
  "riskScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "riskReasons" JSONB,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "consumedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LoginChallenge_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Session" (
  "id" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "deviceCredentialId" TEXT,
  "ipAddress" TEXT,
  "locationCountry" TEXT,
  "locationCity" TEXT,
  "isVerified" BOOLEAN NOT NULL DEFAULT false,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Session_token_key" ON "Session"("token");

CREATE TABLE IF NOT EXISTS "AuthVerification" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "emailOtpEnc" TEXT NOT NULL,
  "smsOtpEnc" TEXT NOT NULL,
  "ipAddress" TEXT NOT NULL,
  "deviceDna" TEXT NOT NULL,
  "locationCountry" TEXT,
  "locationCity" TEXT,
  "riskScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "riskReasons" JSONB,
  "emailOtpVerifiedAt" TIMESTAMP(3),
  "smsOtpVerifiedAt" TIMESTAMP(3),
  "deviceVerifiedAt" TIMESTAMP(3),
  "simVerifiedAt" TIMESTAMP(3),
  "payShieldPinVerifiedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuthVerification_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AuthVerification_sessionId_key" ON "AuthVerification"("sessionId");
CREATE INDEX IF NOT EXISTS "AuthVerification_userId_createdAt_idx" ON "AuthVerification"("userId", "createdAt");

CREATE TABLE IF NOT EXISTS "Transaction" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "amount" DECIMAL(18,2) NOT NULL,
  "payee" TEXT NOT NULL,
  "status" "TransactionStatus" NOT NULL DEFAULT 'SUCCESS',
  "ledgerType" "LedgerType" NOT NULL DEFAULT 'REAL',
  "locationCountry" TEXT,
  "locationCity" TEXT,
  "ipAddress" TEXT,
  "deviceDna" TEXT,
  "browserSignature" TEXT,
  "screenResolution" TEXT,
  "encryptedPayload" TEXT,
  "mlScore" DOUBLE PRECISION,
  "mlReasons" JSONB,
  "isTransferAllAttempt" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Transaction_userId_createdAt_idx" ON "Transaction"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "Transaction_userId_ledgerType_idx" ON "Transaction"("userId", "ledgerType");

CREATE TABLE IF NOT EXISTS "BehavioralLog" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "mouseShakeIntensity" INTEGER NOT NULL,
  "scrollSpeed" INTEGER NOT NULL,
  "paymentFrequency" INTEGER NOT NULL,
  "transferAllIntent" BOOLEAN NOT NULL DEFAULT false,
  "locationCountry" TEXT,
  "locationCity" TEXT,
  "ipAddress" TEXT,
  "deviceDna" TEXT,
  "browserSignature" TEXT,
  "screenResolution" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BehavioralLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "BehavioralLog_userId_createdAt_idx" ON "BehavioralLog"("userId", "createdAt");

CREATE TABLE IF NOT EXISTS "SecurityEvent" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "type" TEXT NOT NULL,
  "ipAddress" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SecurityEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "SecurityEvent_userId_createdAt_idx" ON "SecurityEvent"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "SecurityEvent_type_createdAt_idx" ON "SecurityEvent"("type", "createdAt");

CREATE TABLE IF NOT EXISTS "BankCredential" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "bankName" TEXT NOT NULL,
  "accountHolderName" TEXT NOT NULL,
  "encryptedPayload" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BankCredential_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "BankCredential_userId_createdAt_idx" ON "BankCredential"("userId", "createdAt");

DO $$
BEGIN
  ALTER TABLE "DeviceCredential"
    ADD CONSTRAINT "DeviceCredential_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "LoginChallenge"
    ADD CONSTRAINT "LoginChallenge_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "LoginChallenge"
    ADD CONSTRAINT "LoginChallenge_deviceCredentialId_fkey"
    FOREIGN KEY ("deviceCredentialId") REFERENCES "DeviceCredential"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "Session"
    ADD CONSTRAINT "Session_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "Session"
    ADD CONSTRAINT "Session_deviceCredentialId_fkey"
    FOREIGN KEY ("deviceCredentialId") REFERENCES "DeviceCredential"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "AuthVerification"
    ADD CONSTRAINT "AuthVerification_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "AuthVerification"
    ADD CONSTRAINT "AuthVerification_sessionId_fkey"
    FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "Transaction"
    ADD CONSTRAINT "Transaction_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "BehavioralLog"
    ADD CONSTRAINT "BehavioralLog_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "SecurityEvent"
    ADD CONSTRAINT "SecurityEvent_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "BankCredential"
    ADD CONSTRAINT "BankCredential_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
