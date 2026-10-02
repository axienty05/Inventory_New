const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const { jwtSecret, jwtExpiresIn } = require('../config/auth');

async function login(username, password) {
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      userRoles: {
        include: {
          role: {
            include: {
              rolePermissions: {
                include: { permission: true },
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw { statusCode: 401, message: 'Username atau password salah' };
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw { statusCode: 401, message: 'Username atau password salah' };
  }

  const token = jwt.sign({ userId: user.id, username: user.username }, jwtSecret, {
    expiresIn: jwtExpiresIn,
  });

  const roles = (user.userRoles || []).map((ur) => ur.role.name);
  const permissions = (user.userRoles || []).flatMap((ur) =>
    (ur.role.rolePermissions || []).map((rp) => rp.permission.name)
  );

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      roles,
      permissions,
    },
  };
}

async function register(username, password) {
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    throw { statusCode: 409, message: 'Username sudah digunakan' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
    },
  });

  return { id: user.id, username: user.username };
}

async function changePassword(userId, currentPassword, newPassword) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw { statusCode: 404, message: 'User tidak ditemukan' };
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw { statusCode: 400, message: 'Password saat ini tidak sesuai' };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return { message: 'Password berhasil diubah' };
}

module.exports = { login, register, changePassword };
