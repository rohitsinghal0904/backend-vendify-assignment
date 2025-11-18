const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ status: false, message: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.user_id);
    if (!user || user.company_id !== decoded.company_id) {
      return res.status(401).json({ status: false, message: 'Invalid token' });
    }

    req.user = {
      id: user.id,
      company_id: user.company_id,
      role_id: user.role_id,
      email: user.email,
      name: user.name,
      permissions: typeof user?.Role?.permissions === 'string'
        ? JSON.parse(user?.Role?.permissions)
        : user?.Role?.permissions
    };

    next();
  } catch (error) {
    return res.status(401).json({ status: false, message: 'Invalid or expired token' });
  }
};

const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ status: false, message: 'Authentication required' });
    }

    const permissions = req.user.permissions || {};
    if (!permissions[permission]) {
      return res.status(403).json({
        status: false,
        message: `Permission denied: ${permission} required`
      });
    }

    next();
  };
};

module.exports = { authenticate, requirePermission };

