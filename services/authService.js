const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const AuditLog = require('../models/AuditLog');

class AuthService {
  static async login(email, password) {
    const user = await User.findByEmail(email);
    if (!user || !user.is_active) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await RefreshToken.create({
      token: refreshToken,
      user_id: user.id,
      expires_at: expiresAt
    });

    await AuditLog.create({
      company_id: user.company_id,
      user_id: user.id,
      action_type: 'LOGIN',
      entity_type: 'USER',
      entity_id: user.id,
      old_values: null,
      new_values: { email: user.email }
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        company_id: user.company_id,
        role_id: user.role_id
      }
    };
  }

  static async refreshToken(refreshToken) {
    const tokenRecord = await RefreshToken.findByToken(refreshToken);
    if (!tokenRecord) {
      throw new Error('Invalid refresh token');
    }

    const user = await User.findById(tokenRecord.user_id);
    if (!user || !user.is_active) {
      throw new Error('User not found or inactive');
    }

    const accessToken = this.generateAccessToken(user);

    return { accessToken };
  }

  static async logout(refreshToken) {
    const success = await RefreshToken.blacklist(refreshToken);
    if (!success) {
      throw new Error('Invalid refresh token');
    }
    return true;
  }

  static generateAccessToken(user) {
    return jwt.sign(
      {
        user_id: user.id,
        company_id: user.company_id,
        role_id: user.role_id,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );
  }

  static generateRefreshToken() {
    return crypto.randomBytes(40).toString('hex');
  }
}

module.exports = AuthService;

