const AuditLog = require('../models/AuditLog');

class AuditLogController {
  static async getAuditLogs(req, res) {
    try {
      const filters = {
        user_id: req.query.user_id,
        action_type: req.query.action_type,
        date_from: req.query.date_from,
        date_to: req.query.date_to,
        limit: req.query.limit || 50,
        offset: req.query.page ? (parseInt(req.query.page) - 1) * parseInt(req.query.limit || 50) : 0
      };

      const logs = await AuditLog.findByCompany(req.user.company_id, filters);
      res.json({ status: true, data: logs });
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  }
}

module.exports = AuditLogController;

