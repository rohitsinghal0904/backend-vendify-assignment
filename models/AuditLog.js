const { AuditLog: AuditLogModel, User: UserModel } = require('./index');
const { Op } = require('sequelize');

class AuditLog {
  static async create(logData) {
    const { company_id, user_id, action_type, entity_type, entity_id, old_values, new_values } = logData;
    const auditLog = await AuditLogModel.create({
      company_id,
      user_id,
      action_type,
      entity_type,
      entity_id,
      old_values: old_values || null,
      new_values: new_values || null
    });
    return auditLog.id;
  }

  static async findByCompany(company_id, filters = {}) {
    const where = { company_id };

    if (filters.user_id) {
      where.user_id = filters.user_id;
    }

    if (filters.action_type) {
      where.action_type = filters.action_type;
    }

    if (filters.date_from || filters.date_to) {
      where.created_at = {};
      if (filters.date_from) {
        where.created_at[Op.gte] = new Date(filters.date_from);
      }
      if (filters.date_to) {
        where.created_at[Op.lte] = new Date(filters.date_to);
      }
    }

    const options = {
      where,
      include: [{
        model: UserModel,
        attributes: ['name', 'email'],
        required: false
      }],
      order: [['created_at', 'DESC']]
    };

    if (filters.limit) {
      options.limit = parseInt(filters.limit);
      if (filters.offset) {
        options.offset = parseInt(filters.offset);
      }
    }

    const logs = await AuditLogModel.findAll(options);
    
    return logs.map(log => {
      const logData = log.toJSON();
      return {
        ...logData,
        user_name: logData.User?.name,
        user_email: logData.User?.email
      };
    });
  }
}

module.exports = AuditLog;

