const authService = require('../services/auth.service');

async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    const result = await authService.login(username, password);
    res.json({ success: true, message: 'Login berhasil', data: result });
  } catch (err) {
    next(err);
  }
}

async function register(req, res, next) {
  try {
    const { username, password } = req.body;
    const result = await authService.register(username, password);
    res.status(201).json({ success: true, message: 'Registrasi berhasil', data: result });
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res, next) {
  try {
    const roles = (req.user.userRoles || []).map((ur) => ur.role.name);
    const permissions = (req.user.userRoles || []).flatMap((ur) =>
      (ur.role.rolePermissions || []).map((rp) => rp.permission.name)
    );
    res.json({
      success: true,
      data: {
        id: req.user.id,
        username: req.user.username,
        roles,
        permissions,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { current_password, password } = req.body;
    const result = await authService.changePassword(req.user.id, current_password, password);
    res.json({ success: true, message: result.message });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, register, getMe, changePassword };
