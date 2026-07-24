-- Add walletBalance column to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "walletBalance" DOUBLE PRECISION NOT NULL DEFAULT 0;
