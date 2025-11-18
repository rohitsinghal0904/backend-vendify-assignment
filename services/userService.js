const bcrypt = require('bcryptjs');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

class UserService {
  static async createUser(userData, createdBy) {
    const { email, password, name, role_id, company_id } = userData;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const userId = await User.create({
      company_id,
      role_id,
      email,
      password_hash,
      name,
      created_by: createdBy.id
    });

    // Get created user
    const user = await User.findById(userId);

    // Audit log
    await AuditLog.create({
      company_id,
      user_id: createdBy.id,
      action_type: 'CREATE',
      entity_type: 'USER',
      entity_id: userId,
      old_values: null,
      new_values: { email, name, role_id }
    });

    // Remove sensitive data
    delete user.password_hash;
    return user;
  }

  static async getUsers(company_id, filters) {
    const users = await User.findByCompany(company_id, filters);
    const total = await User.countByCompany(company_id, filters);

    // Remove password hashes
    users.forEach(user => delete user.password_hash);

    return {
      users,
      pagination: {
        total,
        page: parseInt(filters.page) || 1,
        limit: parseInt(filters.limit) || 10,
        totalPages: Math.ceil(total / (parseInt(filters.limit) || 10))
      }
    };
  }

  static async getUserById(id, company_id) {
    const user = await User.findById(id);
    if (!user || user.company_id !== company_id) {
      throw new Error('User not found');
    }
    delete user.password_hash;
    return user;
  }

  static async updateUser(id, company_id, updateData, updatedBy) {
    const user = await User.findById(id);
    if (!user || user.company_id !== company_id) {
      throw new Error('User not found');
    }

    const oldValues = { name: user.name, role_id: user.role_id };

    const success = await User.update(id, company_id, updateData);
    if (!success) {
      throw new Error('Failed to update user');
    }

    const updatedUser = await User.findById(id);

    // Audit log
    await AuditLog.create({
      company_id,
      user_id: updatedBy.id,
      action_type: 'UPDATE',
      entity_type: 'USER',
      entity_id: id,
      old_values: oldValues,
      new_values: { name: updatedUser.name, role_id: updatedUser.role_id }
    });

    delete updatedUser.password_hash;
    return updatedUser;
  }

  static async deleteUser(id, company_id, deletedBy) {
    const user = await User.findById(id);
    if (!user || user.company_id !== company_id) {
      throw new Error('User not found');
    }

    const success = await User.softDelete(id, company_id);
    if (!success) {
      throw new Error('Failed to delete user');
    }

    // Audit log
    await AuditLog.create({
      company_id,
      user_id: deletedBy.id,
      action_type: 'DELETE',
      entity_type: 'USER',
      entity_id: id,
      old_values: { email: user.email, name: user.name },
      new_values: { is_deleted: true }
    });

    return true;
  }
}

module.exports = UserService;

