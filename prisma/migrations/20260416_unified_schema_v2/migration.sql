-- Unified schema v2: add missing verification flags and canonical OTP/behavioral event tables

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS "OtpCode" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "identifier" TEXT NOT NULL,
  "otpEnc" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "OtpCode_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "OtpCode_identifier_type_createdAt_idx"
  ON "OtpCode"("identifier", "type", "createdAt");

CREATE INDEX IF NOT EXISTS "OtpCode_expiresAt_idx"
  ON "OtpCode"("expiresAt");

DO $$
BEGIN
  ALTER TABLE "OtpCode"
    ADD CONSTRAINT "OtpCode_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "BehavioralEvent" (
  "id" TEXT NOT NULL,
  "userId" TEXT,
  "sessionId" TEXT,
  "eventType" TEXT NOT NULL,
  "riskScore" INTEGER NOT NULL,
  "triggeredRules" JSONB,
  "actionTaken" TEXT NOT NULL,
  "metrics" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BehavioralEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "BehavioralEvent_userId_createdAt_idx"
  ON "BehavioralEvent"("userId", "createdAt");

CREATE INDEX IF NOT EXISTS "BehavioralEvent_eventType_createdAt_idx"
  ON "BehavioralEvent"("eventType", "createdAt");

CREATE INDEX IF NOT EXISTS "BehavioralEvent_actionTaken_createdAt_idx"
  ON "BehavioralEvent"("actionTaken", "createdAt");

DO $$
BEGIN
  ALTER TABLE "BehavioralEvent"
    ADD CONSTRAINT "BehavioralEvent_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
