-- PostgreSQL Migration: Add merk column to Material and Service tables
-- Date: 2026-05-27
-- Purpose: Add optional merk (brand) field to Material and Service models

BEGIN;

-- Add merk column to Material table if it doesn't exist
ALTER TABLE "Material"
ADD COLUMN IF NOT EXISTS "merk" TEXT;

-- Add merk column to Service table if it doesn't exist
ALTER TABLE "Service"
ADD COLUMN IF NOT EXISTS "merk" TEXT;

-- These columns are nullable (optional) so existing records will have NULL values for merk
-- New records can optionally include a merk value

COMMIT;
