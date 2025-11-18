const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { authenticate, requirePermission } = require('../middleware/auth');
const { ensureCompanyAccess } = require('../middleware/multiTenant');
const { auditLog } = require('../middleware/audit');

router.use(authenticate);
router.use(ensureCompanyAccess);
router.get('/me', UserController.getCurrentUser);
router.get('/', UserController.getUsers);
router.get('/:id', UserController.getUserById);
router.post(
  '/',
  requirePermission('can_create_user'),
  auditLog('CREATE', 'USER'),
  UserController.createUser
);

router.patch(
  '/:id',
  requirePermission('can_update_user'),
  auditLog('UPDATE', 'USER'),
  UserController.updateUser
);

router.delete(
  '/:id',
  requirePermission('can_delete_user'),
  auditLog('DELETE', 'USER'),
  UserController.deleteUser
);

module.exports = router;

