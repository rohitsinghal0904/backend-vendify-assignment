-- Seed script for initial data
-- Run this after creating the schema
-- Note: UUIDs are generated using UUID() function in MySQL
-- Password: Admin@123 for all admin users

-- Insert sample companies
INSERT INTO companies (id, name) VALUES
(UUID(), 'Acme Corporation'),
(UUID(), 'Tech Solutions Inc');

-- Insert default roles for Company 1 (Acme Corporation)
SET @company1_uuid = (SELECT id FROM companies WHERE name = 'Acme Corporation' LIMIT 1);
INSERT INTO roles (id, company_id, name, permissions) VALUES
(UUID(), @company1_uuid, 'Company Admin', '{"can_create_user": true, "can_update_user": true, "can_delete_user": true, "can_create_role": true, "can_update_role": true, "can_delete_role": true, "can_view_audit_logs": true}'),
(UUID(), @company1_uuid, 'Store Manager', '{"can_create_user": false, "can_update_user": false, "can_delete_user": false, "can_view_users": true}'),
(UUID(), @company1_uuid, 'Finance Manager', '{"can_create_user": false, "can_update_user": false, "can_delete_user": false, "can_view_users": true}');

-- Insert default roles for Company 2 (Tech Solutions Inc)
SET @company2_uuid = (SELECT id FROM companies WHERE name = 'Tech Solutions Inc' LIMIT 1);
INSERT INTO roles (id, company_id, name, permissions) VALUES
(UUID(), @company2_uuid, 'Company Admin', '{"can_create_user": true, "can_update_user": true, "can_delete_user": true, "can_create_role": true, "can_update_role": true, "can_delete_role": true, "can_view_audit_logs": true}'),
(UUID(), @company2_uuid, 'Store Manager', '{"can_create_user": false, "can_update_user": false, "can_delete_user": false, "can_view_users": true}');

-- Insert Company Admin users (password: Admin@123 for both)
-- Password hash for 'Admin@123' generated with bcrypt
SET @role1_uuid = (SELECT id FROM roles WHERE name = 'Company Admin' AND company_id = @company1_uuid LIMIT 1);
SET @role2_uuid = (SELECT id FROM roles WHERE name = 'Company Admin' AND company_id = @company2_uuid LIMIT 1);
INSERT INTO users (id, company_id, role_id, email, password_hash, name, created_by, is_active) VALUES
(UUID(), @company1_uuid, @role1_uuid, 'admin@acme.com', '$2a$10$cBlPdAywMrSPbt7gQjNyyuDgRLN4oAnje42wbWo8QW2T8hdVmwS1e', 'Acme Admin', NULL, TRUE),
(UUID(), @company2_uuid, @role2_uuid, 'admin@techsolutions.com', '$2a$10$cBlPdAywMrSPbt7gQjNyyuDgRLN4oAnje42wbWo8QW2T8hdVmwS1e', 'Tech Solutions Admin', NULL, TRUE);

