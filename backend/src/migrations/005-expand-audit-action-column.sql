-- Increase audit_logs.action from VARCHAR(50) to VARCHAR(255)
-- The interceptor generates actions like "PUT /api/companies/:id" which can exceed 50 chars

ALTER TABLE audit_logs_y2026h2 ALTER COLUMN action TYPE VARCHAR(255);
ALTER TABLE audit_logs_y2027 ALTER COLUMN action TYPE VARCHAR(255);
ALTER TABLE audit_logs_default ALTER COLUMN action TYPE VARCHAR(255);
