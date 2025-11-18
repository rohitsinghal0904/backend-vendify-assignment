const UserService = require('../services/userService');
const User = require('../models/User');

class UserController {
  static async createUser(req, res) {
    try {
      const { email, password, name, role_id } = req.body;

      if (!email || !password || !name || !role_id) {
        return res.status(400).json({ 
          status: false, 
          message: 'Email, password, name, and role_id are required' 
        });
      }

      const user = await UserService.createUser(
        {
          email,
          password,
          name,
          role_id,
          company_id: req.user.company_id
        },
        req.user
      );

      res.status(201).json({ status: true, data: user });
    } catch (error) {
      res.status(400).json({ status: false, message: error.message });
    }
  }

  static async getUsers(req, res) {
    try {
      const filters = {
        page: req.query.page,
        limit: req.query.limit || 10,
        search: req.query.search,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder || 'ASC',
        offset: req.query.page ? (parseInt(req.query.page) - 1) * parseInt(req.query.limit || 10) : 0
      };

      const result = await UserService.getUsers(req.user.company_id, filters);
      res.json({ status: true, data: result });
    } catch (error) {
      res.status(500).json({ status: false, message: error.message });
    }
  }

  static async getCurrentUser(req, res) {
    try {
      const user = await UserService.getUserById(req.user.id, req.user.company_id);
      res.json({ status: true, data: user });
    } catch (error) {
      res.status(404).json({ status: false, message: error.message });
    }
  }

  static async getUserById(req, res) {
    try {
      const user = await UserService.getUserById(
        req.params.id, 
        req.user.company_id
      );
      res.json({ status: true, data: user });
    } catch (error) {
      res.status(404).json({ status: false, message: error.message });
    }
  }

  static async updateUser(req, res) {
    try {
      const { name, role_id } = req.body;
      const updateData = {};

      if (name !== undefined) updateData.name = name;
      if (role_id !== undefined) updateData.role_id = role_id;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ 
          status: false, 
          message: 'No valid fields to update' 
        });
      }

      const user = await UserService.updateUser(
        req.params.id,
        req.user.company_id,
        updateData,
        req.user
      );

      res.json({ status: true, data: user });
    } catch (error) {
      res.status(400).json({ status: false, message: error.message });
    }
  }

  static async deleteUser(req, res) {
    try {
      await UserService.deleteUser(
        req.params.id,
        req.user.company_id,
        req.user
      );
      res.json({ status: true, message: 'User deleted successfully' });
    } catch (error) {
      res.status(400).json({ status: false, message: error.message });
    }
  }
}

module.exports = UserController;

