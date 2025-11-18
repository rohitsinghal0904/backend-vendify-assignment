const { Role: RoleModel, User: UserModel } = require('./index');

class Role {
  static async create(roleData) {
    const { company_id, name, permissions } = roleData;
    const role = await RoleModel.create({
      company_id,
      name,
      permissions: permissions || {}
    });
    return role.id;
  }

  static async findById(id, company_id) {
    const role = await RoleModel.findOne({
      where: { id, company_id }
    });
    return role ? role.toJSON() : null;
  }

  static async findByCompany(company_id) {
    const roles = await RoleModel.findAll({
      where: { company_id },
      order: [['created_at', 'DESC']]
    });
    return roles.map(role => role.toJSON());
  }

  static async update(id, company_id, updateData) {
    const updateFields = {};

    if (updateData.name !== undefined) {
      updateFields.name = updateData.name;
    }

    if (updateData.permissions !== undefined) {
      updateFields.permissions = updateData.permissions;
    }

    if (Object.keys(updateFields).length === 0) return false;

    const [affectedRows] = await RoleModel.update(updateFields, {
      where: { id, company_id }
    });

    return affectedRows > 0;
  }

  static async delete(id, company_id) {
    // Check if any users are assigned to this role
    const userCount = await UserModel.count({
      where: { role_id: id, company_id, is_deleted: false }
    });

    if (userCount > 0) {
      throw new Error('Cannot delete role: users are assigned to this role');
    }

    const deletedRows = await RoleModel.destroy({
      where: { id, company_id }
    });

    return deletedRows > 0;
  }
}

module.exports = Role;

