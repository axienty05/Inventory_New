<template>
  <div class="space-y-6">
    <!-- Welcome Header -->
    <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Welcome back, {{ auth.user?.username || 'admin' }}!</h1>
        <p class="text-base font-semibold text-slate-500 mt-0.5">Dashboard Overview</p>
      </div>
    </div>

    <!-- Summary KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
      <!-- Total Pembelian -->
      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <i class="pi pi-shopping-bag text-emerald-600 text-base"></i>
            </div>
            <span class="text-sm font-semibold text-slate-500">Total Pembelian</span>
          </div>
          <select v-model="selectedYearPembelian" @change="fetchSummary" class="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-600">
            <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>
        <h3 class="text-xl font-extrabold text-slate-900 mt-3">{{ formatRupiah(summary.totalHargaPembelian) }}</h3>
        <div class="mt-2 flex items-center justify-between">
          <span class="text-xs text-slate-400">Pengadaan tahun {{ selectedYearPembelian }}</span>
          <svg class="w-16 h-8 text-emerald-400" viewBox="0 0 64 32" fill="none">
            <polyline points="0,24 12,18 24,20 36,10 48,14 64,6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          </svg>
        </div>
      </div>

      <!-- Total Penjualan -->
      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <i class="pi pi-dollar text-blue-600 text-base"></i>
            </div>
            <span class="text-sm font-semibold text-slate-500">Total Penjualan</span>
          </div>
          <select v-model="selectedYearPenjualan" @change="fetchSummary" class="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-600">
            <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>
        <h3 class="text-xl font-extrabold text-slate-900 mt-3">{{ formatRupiah(summary.totalHargaPenjualan) }}</h3>
        <div class="mt-2 flex items-center justify-between">
          <span class="text-xs text-slate-400">Penjualan tahun {{ selectedYearPenjualan }}</span>
          <svg class="w-16 h-8 text-blue-400" viewBox="0 0 64 32" fill="none">
            <polyline points="0,20 12,22 24,16 36,18 48,12 64,8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          </svg>
        </div>
      </div>

      <!-- Total Biaya Service -->
      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <i class="pi pi-wrench text-amber-600 text-base"></i>
            </div>
            <span class="text-sm font-semibold text-slate-500">Total Biaya Service</span>
          </div>
          <select v-model="selectedYearService" @change="fetchSummary" class="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-600">
            <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>
        <h3 class="text-xl font-extrabold text-slate-900 mt-3">{{ formatRupiah(summary.totalBiayaService) }}</h3>
        <div class="mt-2 flex items-center justify-between">
          <span class="text-xs text-slate-400">Biaya service tahun {{ selectedYearService }}</span>
          <svg class="w-16 h-8 text-amber-400" viewBox="0 0 64 32" fill="none">
            <polyline points="0,26 12,20 24,22 36,14 48,16 64,10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          </svg>
        </div>
      </div>

      <!-- Aktivitas Sistem -->
      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-teal-50 flex items-center justify-center">
              <i class="pi pi-shield text-teal-600 text-base"></i>
            </div>
            <span class="text-sm font-semibold text-slate-500">Aktivitas Sistem</span>
          </div>
          <span class="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Stabil</span>
        </div>
        <h3 class="text-xl font-extrabold text-slate-900 mt-3">Stabil 100%</h3>
        <div class="mt-2 flex items-center justify-between">
          <span class="text-xs text-slate-400">Sistem berjalan normal</span>
          <svg class="w-16 h-8 text-teal-400" viewBox="0 0 64 32" fill="none">
            <line x1="0" y1="16" x2="20" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <polyline points="20,16 28,8 36,24 44,16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            <line x1="44" y1="16" x2="64" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <h3 class="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <i class="pi pi-chart-bar text-emerald-600"></i>
          <span>Top 10 Barang Sering Service</span>
        </h3>
        <div class="h-64 flex items-center justify-center">
          <Bar v-if="serviceChartData.labels.length" :data="serviceChartData" :options="barOptions" />
          <p v-else class="text-sm text-slate-400">Belum ada data service</p>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <h3 class="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <i class="pi pi-chart-pie text-emerald-600"></i>
          <span>Proporsi Kategori Barang</span>
        </h3>
        <div class="h-64 flex items-center justify-center">
          <Pie v-if="kategoriChartData.labels.length" :data="kategoriChartData" :options="chartOptions" />
          <p v-else class="text-sm text-slate-400">Belum ada data</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/api/axios';
import { formatRupiah } from '@/utils/formatters';
import { useAuthStore } from '@/stores/auth.store';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'vue-chartjs';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement);

const auth = useAuthStore();
const currentYear = new Date().getFullYear();
const years = ref([currentYear, currentYear - 1, currentYear - 2, currentYear - 3, currentYear - 4]);

const selectedYearPembelian = ref(currentYear);
const selectedYearPenjualan = ref(currentYear);
const selectedYearService = ref(currentYear);

const summary = ref({ totalHargaPembelian: 0, totalHargaPenjualan: 0, totalBiayaService: 0 });

const kategoriChartData = ref({
  labels: [],
  datasets: [{ data: [], backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b', '#06b6d4', '#14b8a6'] }],
});

const serviceChartData = ref({
  labels: [],
  datasets: [{ label: 'Jumlah Service', data: [], backgroundColor: '#f59e0b', borderRadius: 6 }],
});

const chartOptions = { responsive: true, maintainAspectRatio: false };
const barOptions = { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } };

async function fetchSummary() {
  try {
    const res = await api.get('/dashboard/summary', {
      params: {
        yearPembelian: selectedYearPembelian.value,
        yearPenjualan: selectedYearPenjualan.value,
        yearService: selectedYearService.value,
      },
    });
    summary.value = res.data.data;
  } catch (err) {
    console.error(err);
  }
}

async function fetchCharts() {
  try {
    const [kategoriRes, serviceRes] = await Promise.all([
      api.get('/dashboard/chart/kategori'),
      api.get('/dashboard/chart/top-service'),
    ]);

    kategoriChartData.value = {
      labels: (kategoriRes.data.data || []).map(k => k.kategori),
      datasets: [{
        data: (kategoriRes.data.data || []).map(k => k.total),
        backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b', '#06b6d4', '#14b8a6', '#f97316', '#a855f7'],
      }],
    };

    serviceChartData.value = {
      labels: (serviceRes.data.data || []).map(s => s.namaBarang),
      datasets: [{
        label: 'Frekuensi Service',
        data: (serviceRes.data.data || []).map(s => s.total),
        backgroundColor: '#f59e0b',
        borderRadius: 6,
      }],
    };
  } catch (err) {
    console.error(err);
  }
}

onMounted(() => {
  fetchSummary();
  fetchCharts();
});
</script>
