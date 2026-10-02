module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'inventory_secret_key_2026_jwt_token_secure',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
};
