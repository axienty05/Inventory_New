<template>
  <!-- Sidebar Container -->
  <aside
    class="fixed top-0 left-0 bottom-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0"
    :class="isOpen ? 'translate-x-0' : '-translate-x-full'"
  >
    <!-- Brand Header -->
    <div class="h-16 px-5 flex items-center justify-between border-b border-slate-100">
      <router-link to="/dashboard" class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/30">
          <i class="pi pi-box text-base"></i>
        </div>
        <div>
          <span class="font-extrabold text-slate-800 text-sm tracking-tight leading-tight block">INVENTORY</span>
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ENTERPRISE V3.0</span>
        </div>
      </router-link>

      <button
        @click="$emit('toggle-sidebar')"
        class="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
      >
        <i class="pi pi-times text-base"></i>
      </button>
    </div>

    <!-- Navigation List -->
    <div class="flex-1 overflow-y-auto py-3 px-3 space-y-1">
      <!-- Dashboard -->
      <router-link
        to="/dashboard"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
        :class="isRouteActive('dashboard') ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-600/25' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'"
      >
        <i class="pi pi-th-large text-base"></i>
        <span>Dashboard</span>
      </router-link>

      <!-- Data Barang -->
      <router-link
        to="/dashboard/barang"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
        :class="isRouteActive('barang.') ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-600/25' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'"
      >
        <i class="pi pi-box text-base"></i>
        <span>Data Barang</span>
      </router-link>

      <!-- Data Pemakai -->
      <router-link
        to="/dashboard/pemakai"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
        :class="isRouteActive('pemakai.') ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-600/25' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'"
      >
        <i class="pi pi-users text-base"></i>
        <span>Data Pemakai</span>
      </router-link>

      <!-- Data Supplier -->
      <router-link
        to="/dashboard/supplier"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
        :class="isRouteActive('supplier.') ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-600/25' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'"
      >
        <i class="pi pi-truck text-base"></i>
        <span>Data Supplier</span>
      </router-link>

      <!-- Service Center -->
      <router-link
        to="/dashboard/servicecenter"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
        :class="isRouteActive('servicecenter.') ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-600/25' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'"
      >
        <i class="pi pi-building text-base"></i>
        <span>Service Center</span>
      </router-link>

      <!-- Mutasi Barang -->
      <router-link
        to="/dashboard/mutasi"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
        :class="isRouteActive('mutasi.') ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-600/25' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'"
      >
        <i class="pi pi-sync text-base"></i>
        <span>Mutasi Barang</span>
      </router-link>

      <!-- Service Eksternal -->
      <router-link
        to="/dashboard/service"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
        :class="isRouteActive('service.') ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-600/25' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'"
      >
        <i class="pi pi-wrench text-base"></i>
        <span>Service Eksternal</span>
      </router-link>

      <!-- Service Internal -->
      <router-link
        to="/dashboard/serviceinternal"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
        :class="isRouteActive('serviceinternal.') ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-600/25' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'"
      >
        <i class="pi pi-cog text-base"></i>
        <span>Service Internal</span>
      </router-link>

      <!-- Maintenance PC -->
      <router-link
        to="/dashboard/maintenance"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
        :class="isRouteActive('maintenance.') ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-600/25' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'"
      >
        <i class="pi pi-desktop text-base"></i>
        <span>Maintenance PC</span>
      </router-link>

      <!-- Divider -->
      <div class="pt-2 pb-1">
        <div class="border-t border-slate-100"></div>
      </div>

      <!-- Laporan Barang -->
      <router-link
        to="/dashboard/laporanbarang"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
        :class="isRouteActive('laporan.barang') || isRouteActive('laporan.perbarang') ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-600/25' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'"
      >
        <i class="pi pi-file-excel text-base"></i>
        <span>Laporan Barang</span>
      </router-link>

      <!-- Laporan Mutasi -->
      <router-link
        to="/dashboard/laporanmutasi"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
        :class="isRouteActive('laporan.mutasi') ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-600/25' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'"
      >
        <i class="pi pi-file-excel text-base"></i>
        <span>Laporan Mutasi</span>
      </router-link>

      <!-- Laporan Service -->
      <router-link
        to="/dashboard/laporanservice"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
        :class="isRouteActive('laporan.service') && !isRouteActive('laporan.serviceinternal') ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-600/25' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'"
      >
        <i class="pi pi-file-excel text-base"></i>
        <span>Laporan Service</span>
      </router-link>

      <!-- Laporan Service Internal -->
      <router-link
        to="/dashboard/laporanserviceinternal"
        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
        :class="isRouteActive('laporan.serviceinternal') ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-600/25' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'"
      >
        <i class="pi pi-file-excel text-base"></i>
        <span>Laporan Svc Internal</span>
      </router-link>

      <!-- Divider -->
      <div class="pt-2 pb-1">
        <div class="border-t border-slate-100"></div>
      </div>

      <!-- Log Out -->
      <button
        @click="handleLogout"
        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-slate-600 hover:text-rose-600 hover:bg-rose-50"
      >
        <i class="pi pi-sign-out text-base"></i>
        <span>Log Out</span>
      </button>
    </div>

    <!-- User Profile Footer -->
    <div class="border-t border-slate-100 p-4 flex items-center gap-3">
      <div class="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm flex-shrink-0">
        {{ userInitial }}
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold text-slate-800 leading-none truncate">{{ auth.user?.username || 'User' }}</p>
        <span class="text-xs text-slate-400 font-medium capitalize">{{ userRole }}</span>
      </div>
      <router-link
        to="/dashboard/setting"
        class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        title="Pengaturan"
      >
        <i class="pi pi-cog text-base"></i>
      </router-link>
    </div>
  </aside>

  <!-- Mobile Overlay -->
  <div
    v-if="isOpen"
    @click="$emit('toggle-sidebar')"
    class="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-30 lg:hidden"
  ></div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

defineProps({
  isOpen: Boolean,
});

defineEmits(['toggle-sidebar']);

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const userInitial = computed(() => {
  return (auth.user?.username || 'U').charAt(0).toUpperCase();
});

const userRole = computed(() => {
  return (auth.user?.roles || ['User'])[0] || 'User';
});

function handleLogout() {
  auth.logout();
  router.push({ name: 'login' });
}

function isRouteActive(prefixOrName) {
  const currentName = String(route.name || '');
  if (prefixOrName === 'dashboard') {
    return currentName === 'dashboard';
  }
  return currentName.startsWith(prefixOrName);
}
</script>
