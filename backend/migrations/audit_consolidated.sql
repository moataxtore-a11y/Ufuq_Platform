-- Consolidated migration for production Supabase DB
-- Applies the schema changes made during the audit to an existing database.
-- Run this once against the production database (Supabase SQL editor or psql).

-- 1) walletBalance column on User (missing in DB; backend and frontend expect it)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "walletBalance" DOUBLE PRECISION DEFAULT 0;

-- 2) updatedAt column on WalletTransaction (missing in DB; the Prisma shim always
--    sets it on create -> caused 500 on wallet topup before this fix)
ALTER TABLE "WalletTransaction" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- 3) Indexes that were defined in SQL files but never applied to an existing DB
CREATE INDEX IF NOT EXISTS "User_suspendedBy_idx" ON "User" ("suspendedBy");
CREATE INDEX IF NOT EXISTS "User_approvedBy_idx" ON "User" ("approvedBy");
CREATE INDEX IF NOT EXISTS "Assignment_createdBy_idx" ON "Assignment" ("createdBy");
CREATE INDEX IF NOT EXISTS "JoinTeacherApplication_assignedById_idx" ON "JoinTeacherApplication" ("assignedById");
