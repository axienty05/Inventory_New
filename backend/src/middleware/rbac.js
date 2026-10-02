function authorize(requiredPermission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated' });
    }

    const roles = (req.user.userRoles || []).map((ur) => ur.role.name.toLowerCase());
    if (roles.includes('super admin') || roles.includes('admin')) {
      return next();
    }

    const permissions = (req.user.userRoles || []).flatMap((ur) =>
      (ur.role.rolePermissions || []).map((rp) => rp.permission.name)
    );

    if (!permissions.includes(requiredPermission)) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Anda tidak memiliki izin: ' + requiredPermission,
      });
    }

    next();
  };
}

module.exports = authorize;
