const Role = require('../models/Role');
const AuditLog = require('../models/AuditLog');

class RoleService {
  static async createRole(roleData, createdBy) {
    const { name, permissions, company_id } = roleData;

    // Check if role with same name exists in company
    const existingRoles = await Role.findByCompany(company_id);
    const duplicate = existingRoles.find(r => r.name.toLowerCase() === name.toLowerCase());
    if (duplicate) {
      throw new Error('Role with this name already exists in your company');
    }

    const roleId = await Role.create({
      company_id,
      name,
      permissions: permissions || {}
    });

    const role = await Role.findById(roleId, company_id);

    // Audit log
    await AuditLog.create({
      company_id,
      user_id: createdBy.id,
      action_type: 'CREATE',
      entity_type: 'ROLE',
      entity_id: roleId,
      old_values: null,
      new_values: { name, permissions }
    });

    return role;
  }

  static async getRoles(company_id) {
    return await Role.findByCompany(company_id);
  }

  static async getRoleById(id, company_id) {
    const role = await Role.findById(id, company_id);
    if (!role) {
      throw new Error('Role not found');
    }
    return role;
  }

  static async updateRole(id, company_id, updateData, updatedBy) {
    const role = await Role.findById(id, company_id);
    if (!role) {
      throw new Error('Role not found');
    }

    const oldValues = {
      name: role.name,
      permissions: typeof role.permissions === 'string' 
        ? JSON.parse(role.permissions) 
        : role.permissions
    };

    const success = await Role.update(id, company_id, updateData);
    if (!success) {
      throw new Error('Failed to update role');
    }

    const updatedRole = await Role.findById(id, company_id);

    // Audit log
    await AuditLog.create({
      company_id,
      user_id: updatedBy.id,
      action_type: 'UPDATE',
      entity_type: 'ROLE',
      entity_id: id,
      old_values: oldValues,
      new_values: {
        name: updatedRole.name,
        permissions: typeof updatedRole.permissions === 'string' 
          ? JSON.parse(updatedRole.permissions) 
          : updatedRole.permissions
      }
    });

    return updatedRole;
  }

  static async deleteRole(id, company_id, deletedBy) {
    const role = await Role.findById(id, company_id);
    if (!role) {
      throw new Error('Role not found');
    }

    await Role.delete(id, company_id);

    // Audit log
    await AuditLog.create({
      company_id,
      user_id: deletedBy.id,
      action_type: 'DELETE',
      entity_type: 'ROLE',
      entity_id: id,
      old_values: { name: role.name },
      new_values: null
    });

    return true;
  }
}

module.exports = RoleService;

