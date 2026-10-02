const mysql = require('mysql2/promise');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function migrate() {
  console.log('=== STARTING DATA MIGRATION FROM MYSQL TO POSTGRESQL ===');

  const mysqlConn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'inventory',
  });

  console.log('Connected to MySQL source database.');

  // 1. Truncate target PostgreSQL tables
  console.log('Truncating PostgreSQL tables...');
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE "dt_mutasis", "mt_mutasis", "m_services", "m_service_internals", "maintenances", "m_barangs", "m_service_centers", "m_suppliers", "m_pemakais", "user_roles", "role_permissions", "users", "roles", "permissions" RESTART IDENTITY CASCADE;
  `);

  // 2. Roles
  const adminRole = await prisma.role.create({ data: { name: 'Admin' } });
  const staffRole = await prisma.role.create({ data: { name: 'Staff' } });

  // 3. Migrate Users
  const [mysqlUsers] = await mysqlConn.query('SELECT * FROM users');
  console.log(`Migrating ${mysqlUsers.length} users...`);
  for (const u of mysqlUsers) {
    const user = await prisma.user.create({
      data: {
        id: u.id,
        username: u.username,
        password: u.password,
        rememberToken: u.remember_token || null,
        createdAt: u.created_at ? new Date(u.created_at) : new Date(),
        updatedAt: u.updated_at ? new Date(u.updated_at) : new Date(),
      },
    });

    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: adminRole.id,
      },
    });
  }

  // 4. Migrate Pemakais
  const [mysqlPemakais] = await mysqlConn.query('SELECT * FROM m_pemakais');
  console.log(`Migrating ${mysqlPemakais.length} pemakais...`);
  const validDepts = ['it', 'fa', 'exim', 'hrd', 'rnd', 'lab', 'ppic', 'iso', 'produksi', 'marketing', 'teknik'];
  for (const p of mysqlPemakais) {
    let dept = (p.department || 'it').toLowerCase().trim();
    if (!validDepts.includes(dept)) dept = 'it';

    await prisma.pemakai.create({
      data: {
        id: p.id,
        nama: p.nama,
        department: dept,
        status: Boolean(p.status),
        createdAt: p.created_at ? new Date(p.created_at) : new Date(),
        updatedAt: p.updated_at ? new Date(p.updated_at) : new Date(),
      },
    });
  }

  // 5. Migrate Suppliers
  const [mysqlSuppliers] = await mysqlConn.query('SELECT * FROM m_suppliers');
  console.log(`Migrating ${mysqlSuppliers.length} suppliers...`);
  for (const s of mysqlSuppliers) {
    await prisma.supplier.create({
      data: {
        id: s.id,
        namaSupplier: s.nama_supplier,
        alamat: s.alamat || '-',
        noTelp: s.no_telp || null,
        email: s.email || null,
        cp: s.cp || null,
        noHp: s.no_hp || null,
        keterangan: s.keterangan || null,
        status: Boolean(s.status),
        createdAt: s.created_at ? new Date(s.created_at) : new Date(),
        updatedAt: s.updated_at ? new Date(s.updated_at) : new Date(),
      },
    });
  }

  // 6. Migrate Service Centers
  const [mysqlSC] = await mysqlConn.query('SELECT * FROM m_service_centers');
  console.log(`Migrating ${mysqlSC.length} service centers...`);
  for (const sc of mysqlSC) {
    await prisma.serviceCenter.create({
      data: {
        id: sc.id,
        namaService: sc.nama_service,
        noTelp: sc.no_telp || '-',
        alamat: sc.alamat || '-',
        cp: sc.cp || null,
        noHp: sc.no_hp || null,
        keterangan: sc.keterangan || null,
        status: Boolean(sc.status),
        createdAt: sc.created_at ? new Date(sc.created_at) : new Date(),
        updatedAt: sc.updated_at ? new Date(sc.updated_at) : new Date(),
      },
    });
  }

  // Get existing Pemakai IDs
  const existingPemakaiIds = new Set(mysqlPemakais.map((p) => p.id));
  const existingSupplierIds = new Set(mysqlSuppliers.map((s) => s.id));
  const existingSCIds = new Set(mysqlSC.map((s) => s.id));

  // 7. Migrate Barangs
  const [mysqlBarangs] = await mysqlConn.query('SELECT * FROM m_barangs');
  console.log(`Migrating ${mysqlBarangs.length} barangs...`);
  const validKategori = ['komputer', 'laptop', 'ups', 'printer', 'monitor', 'mouse', 'keyboard', 'scanner', 'stavolt', 'memory', 'storage', 'license', 'sparepart', 'cctv', 'lain_lain'];
  const validStatus = ['aktif', 'tidak_aktif', 'sedang_service', 'rusak', 'dijual'];

  for (const b of mysqlBarangs) {
    let kat = (b.kategori || 'lain_lain').toLowerCase().trim();
    if (!validKategori.includes(kat)) kat = 'lain_lain';

    let st = (b.status || 'aktif').toLowerCase().trim();
    if (!validStatus.includes(st)) st = 'aktif';

    const pemakaiId = b.m_pemakai_id && existingPemakaiIds.has(b.m_pemakai_id) ? b.m_pemakai_id : null;

    await prisma.barang.create({
      data: {
        id: b.id,
        kodeBarang: b.kode_barang,
        namaBarang: b.nama_barang,
        serialNumber: b.serial_number || null,
        mPemakaiId: pemakaiId,
        kategori: kat,
        keterangan: b.keterangan || null,
        status: st,
        createdAt: b.created_at ? new Date(b.created_at) : new Date(),
        updatedAt: b.updated_at ? new Date(b.updated_at) : new Date(),
      },
    });
  }

  const existingBarangIds = new Set(mysqlBarangs.map((b) => b.id));

  // 8. Migrate MtMutasi
  const [mysqlMtMutasi] = await mysqlConn.query('SELECT * FROM mt_mutasis');
  console.log(`Migrating ${mysqlMtMutasi.length} mt_mutasis...`);
  const validJenisMutasi = ['pembelian', 'penjualan', 'perpindahan'];

  for (const m of mysqlMtMutasi) {
    let jm = (m.jenis_mutasi || 'pembelian').toLowerCase().trim();
    if (!validJenisMutasi.includes(jm)) jm = 'pembelian';

    const supId = m.m_supplier_id && existingSupplierIds.has(m.m_supplier_id) ? m.m_supplier_id : null;

    await prisma.mtMutasi.create({
      data: {
        id: m.id,
        noMutasi: m.no_mutasi,
        mSupplierId: supId,
        jenisMutasi: jm,
        tglMutasi: m.tgl_mutasi ? new Date(m.tgl_mutasi) : new Date(),
        keterangan: m.keterangan || null,
        createdAt: m.created_at ? new Date(m.created_at) : new Date(),
        updatedAt: m.updated_at ? new Date(m.updated_at) : new Date(),
      },
    });
  }

  const existingMtMutasiIds = new Set(mysqlMtMutasi.map((m) => m.id));

  // 9. Migrate DtMutasi
  const [mysqlDtMutasi] = await mysqlConn.query('SELECT * FROM dt_mutasis');
  console.log(`Migrating ${mysqlDtMutasi.length} dt_mutasis...`);
  let dtSuccess = 0;
  for (const d of mysqlDtMutasi) {
    if (!existingMtMutasiIds.has(d.mt_mutasi_id) || !existingBarangIds.has(d.m_barang_id)) {
      continue;
    }
    await prisma.dtMutasi.create({
      data: {
        id: d.id,
        mtMutasiId: d.mt_mutasi_id,
        pemakaiLama: d.pemakai_lama || 0,
        mBarangId: d.m_barang_id,
        pemakaiBaru: d.pemakai_baru || null,
        harga: d.harga ? BigInt(d.harga) : BigInt(0),
        createdAt: d.created_at ? new Date(d.created_at) : new Date(),
        updatedAt: d.updated_at ? new Date(d.updated_at) : new Date(),
      },
    });
    dtSuccess++;
  }
  console.log(`dt_mutasis migrated: ${dtSuccess}`);

  // 10. Migrate Services
  const [mysqlServices] = await mysqlConn.query('SELECT * FROM m_services');
  console.log(`Migrating ${mysqlServices.length} services...`);
  let sSuccess = 0;
  for (const s of mysqlServices) {
    if (!existingPemakaiIds.has(s.m_pemakai_id) || !existingBarangIds.has(s.m_barang_id) || !existingSCIds.has(s.m_service_center_id)) {
      continue;
    }
    await prisma.service.create({
      data: {
        id: s.id,
        noSj: s.no_sj || null,
        mPemakaiId: s.m_pemakai_id,
        mBarangId: s.m_barang_id,
        mServiceCenterId: s.m_service_center_id,
        tglService: s.tgl_service ? new Date(s.tgl_service) : new Date(),
        tglSelesai: s.tgl_selesai ? new Date(s.tgl_selesai) : null,
        biaya: s.biaya ? BigInt(s.biaya) : BigInt(0),
        kerusakan: s.kerusakan || '-',
        analisa: s.analisa || null,
        solusi: s.solusi || null,
        createdAt: s.created_at ? new Date(s.created_at) : new Date(),
        updatedAt: s.updated_at ? new Date(s.updated_at) : new Date(),
      },
    });
    sSuccess++;
  }
  console.log(`services migrated: ${sSuccess}`);

  // 11. Migrate Service Internals
  const [mysqlSI] = await mysqlConn.query('SELECT * FROM m_service_internals');
  console.log(`Migrating ${mysqlSI.length} service internals...`);
  let siSuccess = 0;
  for (const si of mysqlSI) {
    if (!existingPemakaiIds.has(si.m_pemakai_id) || !existingBarangIds.has(si.m_barang_id)) {
      continue;
    }
    await prisma.serviceInternal.create({
      data: {
        id: si.id,
        mPemakaiId: si.m_pemakai_id,
        mBarangId: si.m_barang_id,
        tglService: si.tgl_service ? new Date(si.tgl_service) : new Date(),
        tglSelesai: si.tgl_selesai ? new Date(si.tgl_selesai) : null,
        kerusakan: si.kerusakan || '-',
        createdAt: si.created_at ? new Date(si.created_at) : new Date(),
        updatedAt: si.updated_at ? new Date(si.updated_at) : new Date(),
      },
    });
    siSuccess++;
  }
  console.log(`service_internals migrated: ${siSuccess}`);

  // 12. Reset PostgreSQL Sequence IDs
  console.log('Resetting PostgreSQL sequences...');
  const tables = ['users', 'roles', 'permissions', 'm_pemakais', 'm_suppliers', 'm_service_centers', 'm_barangs', 'mt_mutasis', 'dt_mutasis', 'm_services', 'm_service_internals', 'maintenances'];
  for (const t of tables) {
    try {
      await prisma.$executeRawUnsafe(`
        SELECT setval(pg_get_serial_sequence('"${t}"', 'id'), COALESCE(MAX(id), 1)) FROM "${t}";
      `);
    } catch (e) {
      // ignore
    }
  }

  await mysqlConn.end();
  await prisma.$disconnect();

  console.log('=== DATA MIGRATION FINISHED SUCCESSFULLY ===');
}

migrate().catch((e) => {
  console.error('Migration error:', e);
  process.exit(1);
});