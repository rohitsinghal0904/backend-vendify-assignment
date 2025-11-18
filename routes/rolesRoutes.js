const express = require('express');
const router = express.Router();
const RoleController = require('../controllers/roleController');
const { authenticate, requirePermission } = require('../middleware/auth');
const { ensureCompanyAccess } = require('../middleware/multiTenant');
const { auditLog } = require('../middleware/audit');

router.use(authenticate);
router.use(ensureCompanyAccess);
router.get('/', RoleController.getRoles);
router.get('/:id', RoleController.getRoleById);

router.post(
  '/',
  requirePermission('can_create_role'),
  auditLog('CREATE', 'ROLE'),
  RoleController.createRole
);

router.patch(
  '/:id',
  requirePermission('can_update_role'),
  auditLog('UPDATE', 'ROLE'),
  RoleController.updateRole
);

router.delete(
  '/:id',
  requirePermission('can_delete_role'),
  auditLog('DELETE', 'ROLE'),
  RoleController.deleteRole
);

module.exports = router;

