const AuditLog = require('../models/AuditLog');

const auditLog = (action_type, entity_type) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    
    const requestBody = { ...req.body };
    
    res.json = function(data) {
      setImmediate(async () => {
        try {
          if (req.user && res.statusCode < 400) {
            const entity_id = req.params.id || (data && data.data && data.data.id) || null;
            
            let old_values = null;
            let new_values = null;

            if (action_type === 'CREATE') {
              new_values = data && data.data ? data.data : requestBody;
            } else if (action_type === 'UPDATE') {
              old_values = requestBody;
              new_values = data && data.data ? data.data : requestBody;
            } else if (action_type === 'DELETE') {
              old_values = requestBody;
            }

            await AuditLog.create({
              company_id: req.user.company_id,
              user_id: req.user.id,
              action_type,
              entity_type,
              entity_id,
              old_values,
              new_values
            });
          }
        } catch (error) {
          console.error('Audit log error:', error);
        }
      });
      
      return originalJson(data);
    };

    next();
  };
};

module.exports = { auditLog };

