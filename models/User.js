const { User: UserModel, Role } = require('./index');
const { Op } = require('sequelize');

class User {
  static async create(userData) {
    const { company_id, role_id, email, password_hash, name, created_by } = userData;
    const user = await UserModel.create({
      company_id,
      role_id,
      email,
      password_hash,
      name,
      created_by
    });
    return user.id;
  }

  static async findByEmail(email) {
    const user = await UserModel.findOne({
      where: { email, is_deleted: false },
      include: [{
        model: Role,
        attributes: ['name', 'permissions']
      }]
    });
    
    if (!user) return null;
    
    const userData = user.toJSON();
    return {
      ...userData,
      role_name: userData.Role?.name,
      permissions: userData.Role?.permissions
    };
  }

  static async findById(id) {
    const user = await UserModel.findOne({
      where: { id, is_deleted: false },
      include: [{
        model: Role,
        attributes: ['name', 'permissions']
      }]
    });
    
    if (!user) return null;
    
    const userData = user.toJSON();
    return {
      ...userData,
      role_name: userData.Role?.name,
      permissions: userData.Role?.permissions
    };
  }

  static async findByCompany(company_id, filters = {}) {
    const where = {
      company_id,
      is_deleted: false
    };

    if (filters.search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${filters.search}%` } },
        { email: { [Op.like]: `%${filters.search}%` } }
      ];
    }

    const order = filters.sortBy 
      ? [[filters.sortBy, filters.sortOrder || 'ASC']]
      : [['created_at', 'DESC']];

    const options = {
      where,
      include: [{
        model: Role,
        attributes: ['name', 'permissions']
      }],
      order
    };

    if (filters.limit) {
      options.limit = parseInt(filters.limit);
      if (filters.offset) {
        options.offset = parseInt(filters.offset);
      }
    }

    const users = await UserModel.findAll(options);
    
    return users.map(user => {
      const userData = user.toJSON();
      return {
        ...userData,
        role_name: userData.Role?.name,
        permissions: userData.Role?.permissions
      };
    });
  }

  static async countByCompany(company_id, filters = {}) {
    const where = {
      company_id,
      is_deleted: false
    };

    if (filters.search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${filters.search}%` } },
        { email: { [Op.like]: `%${filters.search}%` } }
      ];
    }

    return await UserModel.count({ where });
  }

  static async update(id, company_id, updateData) {
    const allowedFields = ['name', 'role_id'];
    const updateFields = {};

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updateFields[field] = updateData[field];
      }
    }

    if (Object.keys(updateFields).length === 0) return false;

    const [affectedRows] = await UserModel.update(updateFields, {
      where: { id, company_id, is_deleted: false }
    });

    return affectedRows > 0;
  }

  static async softDelete(id, company_id) {
    const [affectedRows] = await UserModel.update(
      { is_deleted: true },
      { where: { id, company_id, is_deleted: false } }
    );
    return affectedRows > 0;
  }

  static async restore(id, company_id) {
    const [affectedRows] = await UserModel.update(
      { is_deleted: false },
      { where: { id, company_id } }
    );
    return affectedRows > 0;
  }
}

module.exports = User;

