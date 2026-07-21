-- Seed: Default Admin User
-- Run this AFTER supabase-schema.sql
-- Email: admin@school.local
-- Password: ChangeMe123!

INSERT INTO "User" (id, "createdAt", "updatedAt", name, email, password, role, "mustChangePassword", status)
SELECT gen_random_uuid()::text, NOW(), NOW(), 'Default Admin', 'admin@school.local', '$2b$12$jeweclHR0GDzxmWD.4QQWeTtpJWUKjIcLBxZGPpoUdBoOWZJU/izS', 'admin', true, 'approved'
WHERE NOT EXISTS (SELECT 1 FROM "User" WHERE role = 'admin');
