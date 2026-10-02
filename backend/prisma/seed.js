const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial data...');

  // 1. Roles & Permissions
  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: { name: 'Admin' },
  });

  const staffRole = await prisma.role.upsert({
    where: { name: 'Staff' },
    update: {},
    create: { name: 'Staff' },
  });

  // 2. Admin User
  const hashedPassword = await bcrypt.hash('password123', 10);
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  // 3. Sample Pemakai
  const pemakai1 = await prisma.pemakai.create({
    data: {
      nama: 'John Doe',
      department: 'it',
      status: true,
    },
  });

  const pemakai2 = await prisma.pemakai.create({
    data: {
      nama: 'Jane Smith',
      department: 'fa',
      status: true,
    },
  });

  // 4. Sample Supplier
  const supplier1 = await prisma.supplier.create({
    data: {
      namaSupplier: 'PT. Teknologi Nusantara',
      alamat: 'Jl. Sudirman No. 123, Jakarta',
      noTelp: '021-5551234',
      email: 'sales@teknus.com',
      cp: 'Budi Santoso',
      noHp: '081234567890',
      status: true,
    },
  });

  // 5. Sample Service Center
  const sc1 = await prisma.serviceCenter.create({
    data: {
      namaService: 'Asus Service Center Official',
      noTelp: '021-8889999',
      alamat: 'Mangga Dua Mall Lt. 3, Jakarta',
      cp: 'Andi',
      noHp: '081122334455',
      status: true,
    },
  });

  // 6. Sample Barang
  await prisma.barang.create({
    data: {
      kodeBarang: 'B/000001',
      namaBarang: 'Laptop Asus ROG Strix G15',
      serialNumber: 'SN-ROG-2026-001',
      mPemakaiId: pemakai1.id,
      kategori: 'laptop',
      keterangan: 'Laptop operasional IT Support',
      status: 'aktif',
    },
  });

  await prisma.barang.create({
    data: {
      kodeBarang: 'B/000002',
      namaBarang: 'Monitor Dell UltraSharp 27',
      serialNumber: 'SN-DELL-27-092',
      mPemakaiId: pemakai2.id,
      kategori: 'monitor',
      keterangan: 'Monitor divisi Finance',
      status: 'aktif',
    },
  });

  console.log('Seeding completed successfully!');
  console.log('Default credentials: username=admin, password=password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
