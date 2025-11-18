const AuthService = require('../services/authService');

class AuthController {
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ 
          status: false, 
          message: 'Email and password are required' 
        });
      }

      const result = await AuthService.login(email, password);
      res.json({ status: true, data: result });
    } catch (error) {
      res.status(401).json({ status: false, message: error.message });
    }
  }

  static async refresh(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ 
          status: false, 
          message: 'Refresh token is required' 
        });
      }

      const result = await AuthService.refreshToken(refreshToken);
      res.json({ status: true, data: result });
    } catch (error) {
      res.status(401).json({ status: false, message: error.message });
    }
  }

  static async logout(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ 
          status: false, 
          message: 'Refresh token is required' 
        });
      }

      await AuthService.logout(refreshToken);
      res.json({ status: true, message: 'Logged out successfully' });
    } catch (error) {
      res.status(400).json({ status: false, message: error.message });
    }
  }
}

module.exports = AuthController;

