const { RefreshToken: RefreshTokenModel } = require('./index');
const { Op } = require('sequelize');

class RefreshToken {
  static async create(tokenData) {
    const { token, user_id, expires_at } = tokenData;
    const refreshToken = await RefreshTokenModel.create({
      token,
      user_id,
      expires_at
    });
    return refreshToken.id;
  }

  static async findByToken(token) {
    const refreshToken = await RefreshTokenModel.findOne({
      where: {
        token,
        expires_at: { [Op.gt]: new Date() },
        is_blacklisted: false
      }
    });
    return refreshToken ? refreshToken.toJSON() : null;
  }

  static async blacklist(token) {
    const [affectedRows] = await RefreshTokenModel.update(
      { is_blacklisted: true },
      { where: { token } }
    );
    return affectedRows > 0;
  }

  static async cleanupExpired() {
    const deletedCount = await RefreshTokenModel.destroy({
      where: {
        expires_at: { [Op.lt]: new Date() }
      }
    });
    return deletedCount;
  }
}

module.exports = RefreshToken;

