const RoleService = require('../services/roleService');

class RoleController {
  static async createRole(req, res) {
    try {
      const { name, permissions } = req.body;

      if (!name) {
        return res.status(400).json({ 
          status: false, 
          message: 'Role name is required' 
        });
      }

      const role = await RoleService.createRole(
        {
          name,
          permissions: permissions || {},
          company_id: req.user.company_id
        },
        req.user
      );

      res.status(201).json({ status: true, data: role });
    } catch (error) {
      res.status(400).json({ status: false, message: error.message });
    }
  }

  static async getRoles(req, res) {
    try {
      const roles = await RoleService.getRoles(req.user.company_id);
      res.json({ status: true, data: roles });
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  }

  static async getRoleById(req, res) {
    try {
      const role = await RoleService.getRoleById(
        req.params.id,
        req.user.company_id
      );
      res.json({ status: true, data: role });
    } catch (error) {
      res.status(404).json({ status: false, message: error.message });
    }
  }

  static async updateRole(req, res) {
    try {
      const { name, permissions } = req.body;
      const updateData = {};

      if (name !== undefined) updateData.name = name;
      if (permissions !== undefined) updateData.permissions = permissions;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ 
          status: false, 
          message: 'No valid fields to update' 
        });
      }

      const role = await RoleService.updateRole(
        req.params.id,
        req.user.company_id,
        updateData,
        req.user
      );

      res.json({ status: true, data: role });
    } catch (error) {
      res.status(400).json({ status: false, message: error.message });
    }
  }

  static async deleteRole(req, res) {
    try {
      await RoleService.deleteRole(
        req.params.id,
        req.user.company_id,
        req.user
      );
      res.json({ status: true, message: 'Role deleted successfully' });
    } catch (error) {
      res.status(400).json({ status: false, message: error.message });
    }
  }
}

module.exports = RoleController;

