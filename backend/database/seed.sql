-- ==============================================================================
-- SEED.SQL
-- Ejecutar este archivo DESPUÉS de reset.sql
-- Inserta la configuración base indispensable para que el SaaS funcione.
-- ==============================================================================

-- 1. Insertamos el catálogo global de Permisos
INSERT INTO permissions (name, module_group, description) VALUES 
('users:create', 'users', 'Permite invitar nuevos miembros'), 
('users:read', 'users', 'Permite ver la lista de miembros'), 
('users:update', 'users', 'Permite editar roles y estado de miembros'), 
('users:delete', 'users', 'Permite eliminar miembros de la empresa');

-- 2. Insertamos los Roles del Sistema base
-- Al usar company_id = NULL, indicamos que son roles globales utilizables por todas las empresas.
INSERT INTO roles (name, description, is_system, company_id) VALUES 
('Owner', 'Dueño absoluto de la organización. Acceso total a configuraciones y facturación.', true, NULL), 
('Admin', 'Administrador estándar con acceso a la gestión diaria, pero no a facturación.', true, NULL);

-- 3. Vinculamos los permisos a los roles del sistema
-- El rol Owner (ID 1) recibe acceso total a todo
INSERT INTO role_permissions (role_id, permission_id) VALUES 
(1, 1), 
(1, 2), 
(1, 3), 
(1, 4);

-- El rol Admin (ID 2) recibe un acceso más limitado o a discreción 
INSERT INTO role_permissions (role_id, permission_id) VALUES 
(2, 1), 
(2, 2);

-- (Opcional en Dev) 4. Insertar un usuario super_admin global
-- INSERT INTO users (name, email, password_hash, is_super_admin) VALUES 
-- ('Super Admin', 'admin@saas.com', '$2b$10$TU_HASH_AQUI', true);
