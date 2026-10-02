# Enterprise Inventory Management System (New Tech Stack)

Aplikasi Sistem Informasi Manajemen Inventaris Aset & Perangkat Kantor yang dimigrasikan dari Laravel ke tumpukan teknologi modern:
- **Frontend**: Vue.js 3 + Vite + Tailwind CSS + PrimeVue (Aura Theme) + Pinia + Vue Router + Chart.js
- **Backend**: Node.js + Express.js + Prisma ORM + JWT Auth + Zod Validation + ExcelJS
- **Database**: PostgreSQL 17

---

## 📁 Struktur Direktori Proyek

```
D:\Huri\Inventory_New\
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Skema database PostgreSQL & Enums
│   │   └── seed.js              # Seeder data awal (Admin, Roles, Sample Data)
│   ├── src/
│   │   ├── config/              # Konfigurasi database & JWT
│   │   ├── controllers/         # REST API Controllers (11 controllers)
│   │   ├── middleware/          # Auth JWT, RBAC, Validation, ErrorHandler
│   │   ├── routes/              # Express API Routes (60+ endpoints)
│   │   ├── services/            # Business logic & Observers (Mutasi, Service)
│   │   ├── utils/               # Constants, pagination, auto-numbering
│   │   ├── validators/          # Skema validasi Zod
│   │   ├── app.js               # Express application instance
│   │   └── server.js            # Server entrypoint (Port 5000)
│   ├── .env                     # Konfigurasi environment
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/                 # Axios instance & interceptors
│   │   ├── components/          # Layout (Navbar, Sidebar), StatusBadge, UI
│   │   ├── router/              # Vue Router dengan Route Navigation Guards
│   │   ├── stores/              # Pinia Auth Store (State management)
│   │   ├── utils/               # Formatters (Rupiah, Tanggal) & Constants
│   │   ├── views/               # Halaman Vue 3 (Auth, Master Data, Transaksi, Laporan)
│   │   ├── App.vue
│   │   ├── main.js              # Entrypoint Vue + PrimeVue + Toast + Dialog
│   │   └── style.css            # Tailwind CSS
│   ├── index.html
│   ├── vite.config.js           # Vite dev server (Port 3000)
│   ├── tailwind.config.js
│   └── package.json
│
└── pgdata/                      # Cluster Database PostgreSQL lokal
```

---

## 🚀 Cara Menjalankan Aplikasi

### 1. Menjalankan Database PostgreSQL
Database server berjalan pada port **5433**:
```powershell
& "D:\Huri\App\PostgreSQL-17\bin\postgres.exe" -D "D:\Huri\Inventory_New\pgdata"
```

### 2. Menjalankan Backend API Server
Buka terminal di folder `backend`:
```powershell
cd D:\Huri\Inventory_New\backend
npm start
# Server berjalan di http://localhost:5000
```

### 3. Menjalankan Frontend Web App
Buka terminal di folder `frontend`:
```powershell
cd D:\Huri\Inventory_New\frontend
npm run dev
# Frontend berjalan di http://localhost:3000
```

---

## 🔑 Kredensial Default Login

- **URL**: `http://localhost:3000/login`
- **Username**: `admin`
- **Password**: `password123`

---

## 📑 Fitur-Fitur Utama yang Tersedia

1. **Dashboard Eksekutif**: KPI pengeluaran pembelian, penjualan, total biaya service per tahun, chart proporsi kategori barang (Pie), dan chart Top 10 barang paling sering service (Bar).
2. **Master Data**:
   - **Data Barang**: Auto-generate kode `B/000001`, filtering kategori/status, proteksi hapus jika memiliki histori transaksi.
   - **Data Pemakai**: Filter department, status aktif/nonaktif, relasi kepemilikan aset.
   - **Data Supplier**: Data vendor, kontak person, email, telepon.
   - **Data Service Center**: Rekanan perbaikan pihak ketiga.
3. **Transaksi & Alur Bisnis (Observers Ported)**:
   - **Mutasi Barang**: Multi-item header-detail, auto-nomor (`MB/`, `MJ/`, `MP/`), mutasi perpindahan otomatis mengubah pemakai aset, penjualan mengubah status barang menjadi `dijual`.
   - **Service Eksternal**: Pencatatan ke vendor, otomatis mengubah status barang menjadi `sedang_service` dan kembali `aktif` saat selesai.
   - **Service Internal**: Pencatatan perbaikan internal tim IT.
   - **Maintenance PC**: Jadwal berkala perawatan komputer kantor.
4. **Laporan & Export Excel**:
   - Laporan Barang & Histori Per-Barang
   - Laporan Mutasi (Filter jenis, bulan, tahun)
   - Laporan Service Eksternal
   - Laporan Service Internal