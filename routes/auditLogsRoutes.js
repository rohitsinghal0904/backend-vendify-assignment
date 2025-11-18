const express = require('express');
const router = express.Router();
const AuditLogController = require('../controllers/auditLogController');
const { authenticate, requirePermission } = require('../middleware/auth');
const { ensureCompanyAccess } = require('../middleware/multiTenant');

router.use(authenticate);
router.use(ensureCompanyAccess);
router.use(requirePermission('can_view_audit_logs'));

router.get('/', AuditLogController.getAuditLogs);

module.exports = router;

