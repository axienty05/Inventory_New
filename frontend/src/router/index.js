import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

import AppLayout from '@/components/layout/AppLayout.vue';
import GuestLayout from '@/components/layout/GuestLayout.vue';

import LoginView from '@/views/auth/LoginView.vue';
import RegisterView from '@/views/auth/RegisterView.vue';
import DashboardView from '@/views/dashboard/DashboardView.vue';

// Master Data
import PemakaiIndex from '@/views/pemakai/PemakaiIndex.vue';
import SupplierIndex from '@/views/supplier/SupplierIndex.vue';
import ServiceCenterIndex from '@/views/serviceCenter/ServiceCenterIndex.vue';
import BarangIndex from '@/views/barang/BarangIndex.vue';
import BarangCreate from '@/views/barang/BarangCreate.vue';
import BarangEdit from '@/views/barang/BarangEdit.vue';

// Transaksi
import ServiceIndex from '@/views/service/ServiceIndex.vue';
import ServiceCreate from '@/views/service/ServiceCreate.vue';
import ServiceEdit from '@/views/service/ServiceEdit.vue';
import ServiceInternalIndex from '@/views/serviceInternal/ServiceInternalIndex.vue';
import ServiceInternalCreate from '@/views/serviceInternal/ServiceInternalCreate.vue';
import ServiceInternalEdit from '@/views/serviceInternal/ServiceInternalEdit.vue';
import MutasiIndex from '@/views/mutasi/MutasiIndex.vue';
import MutasiCreate from '@/views/mutasi/MutasiCreate.vue';
import MutasiEdit from '@/views/mutasi/MutasiEdit.vue';
import MutasiShow from '@/views/mutasi/MutasiShow.vue';
import MaintenanceIndex from '@/views/maintenance/MaintenanceIndex.vue';

// Laporan
import LaporanBarangIndex from '@/views/barang/laporan/LaporanBarangIndex.vue';
import LaporanPerBarang from '@/views/barang/laporan/LaporanPerBarang.vue';
import LaporanServiceIndex from '@/views/service/laporan/LaporanServiceIndex.vue';
import LaporanServiceInternalIndex from '@/views/serviceInternal/laporan/LaporanServiceInternalIndex.vue';
import LaporanMutasiIndex from '@/views/mutasi/laporan/LaporanMutasiIndex.vue';

import SettingsView from '@/views/settings/SettingsView.vue';

const routes = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/',
    component: GuestLayout,
    children: [
      { path: 'login', name: 'login', component: LoginView, meta: { guestOnly: true } },
      { path: 'register', name: 'register', component: RegisterView, meta: { guestOnly: true } },
    ],
  },
  {
    path: '/dashboard',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'dashboard', component: DashboardView },
      
      // Pemakai
      { path: 'pemakai', name: 'pemakai.index', component: PemakaiIndex },

      // Supplier
      { path: 'supplier', name: 'supplier.index', component: SupplierIndex },

      // Service Center
      { path: 'servicecenter', name: 'servicecenter.index', component: ServiceCenterIndex },

      // Barang
      { path: 'barang', name: 'barang.index', component: BarangIndex },
      { path: 'barang/create', name: 'barang.create', component: BarangCreate },
      { path: 'barang/edit/:id', name: 'barang.edit', component: BarangEdit },

      // Service Eksternal
      { path: 'service', name: 'service.index', component: ServiceIndex },
      { path: 'service/create', name: 'service.create', component: ServiceCreate },
      { path: 'service/edit/:id', name: 'service.edit', component: ServiceEdit },

      // Service Internal
      { path: 'serviceinternal', name: 'serviceinternal.index', component: ServiceInternalIndex },
      { path: 'serviceinternal/create', name: 'serviceinternal.create', component: ServiceInternalCreate },
      { path: 'serviceinternal/edit/:id', name: 'serviceinternal.edit', component: ServiceInternalEdit },

      // Mutasi
      { path: 'mutasi', name: 'mutasi.index', component: MutasiIndex },
      { path: 'mutasi/create', name: 'mutasi.create', component: MutasiCreate },
      { path: 'mutasi/edit/:id', name: 'mutasi.edit', component: MutasiEdit },
      { path: 'mutasi/show/:id', name: 'mutasi.show', component: MutasiShow },

      // Maintenance
      { path: 'maintenance', name: 'maintenance.index', component: MaintenanceIndex },

      // Laporan
      { path: 'laporanbarang', name: 'laporan.barang', component: LaporanBarangIndex },
      { path: 'laporanperbarang/:id', name: 'laporan.perbarang', component: LaporanPerBarang },
      { path: 'laporanservice', name: 'laporan.service', component: LaporanServiceIndex },
      { path: 'laporanserviceinternal', name: 'laporan.serviceinternal', component: LaporanServiceInternalIndex },
      { path: 'laporanmutasi', name: 'laporan.mutasi', component: LaporanMutasiIndex },

      // Settings
      { path: 'setting', name: 'setting.index', component: SettingsView },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const auth = useAuthStore();
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next({ name: 'login' });
  } else if (to.meta.guestOnly && auth.isAuthenticated) {
    next({ name: 'dashboard' });
  } else {
    next();
  }
});

export default router;
