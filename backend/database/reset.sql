-- ==============================================================================
-- RESET.SQL
-- ADVERTENCIA: Este script ELIMINA TODOS LOS DATOS de tu base de datos local.
-- Sólo debe usarse en entornos de DESARROLLO (Local) o pruebas (Staging).
-- ==============================================================================

-- 1. Vaciar todas las tablas y reiniciar los contadores de IDs (IDs autoincrementales a 1)
TRUNCATE 
    users, 
    companies, 
    roles, 
    permissions, 
    role_permissions, 
    company_users, 
    company_user_roles,
    audit_logs
RESTART IDENTITY CASCADE;

-- Nota: Si usas migraciones (ej. Flyway, Prisma, Drizzle), asegúrate de no truncar
-- la tabla del historial de migraciones si deseas mantener su estado.
