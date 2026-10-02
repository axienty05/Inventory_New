<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Laporan Mutasi</h1>
        <p class="text-sm text-slate-500 mt-0.5">Laporan rekapitulasi pembelian, penjualan, dan perpindahan barang</p>
      </div>
      <button @click="handleExportExcel" :disabled="exporting" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold shadow-lg shadow-emerald-700/25 transition-all disabled:opacity-50">
        <i v-if="exporting" class="pi pi-spin pi-spinner"></i>
        <i v-else class="pi pi-file-excel"></i>
        <span>{{ exporting ? 'Mengunduh...' : 'Export Excel (.xlsx)' }}</span>
      </button>
    </div>

    <!-- Filters Card -->
    <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-wrap items-center gap-4">
        <!-- Jenis Mutasi Filter -->
        <div class="w-full sm:w-52">
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <i class="pi pi-tag text-emerald-600"></i>
            <span>Jenis Mutasi</span>
          </label>
          <Select 
            v-model="selectedJenis" 
            :options="jenisOptions" 
            optionLabel="label" 
            optionValue="value" 
            showClear
            placeholder="Semua Jenis" 
            @change="fetchData" 
            class="w-full"
          >
            <template #value="slotProps">
              <span v-if="slotProps.value" class="font-semibold text-sm capitalize">
                {{ getJenisLabel(slotProps.value) }}
              </span>
              <span v-else class="text-slate-400 text-sm">Semua Jenis</span>
            </template>
            <template #option="slotProps">
              <div class="flex items-center gap-2 py-0.5">
                <span 
                  class="inline-block w-2.5 h-2.5 rounded-full"
                  :class="{
                    'bg-emerald-500': slotProps.option.value === 'pembelian',
                    'bg-blue-500': slotProps.option.value === 'penjualan',
                    'bg-purple-500': slotProps.option.value === 'perpindahan',
                    'bg-slate-300': !slotProps.option.value,
                  }"
                ></span>
                <span class="font-medium text-sm">{{ slotProps.option.label }}</span>
              </div>
            </template>
          </Select>
        </div>

        <!-- Bulan Filter -->
        <div class="w-full sm:w-52">
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <i class="pi pi-calendar text-emerald-600"></i>
            <span>Bulan</span>
          </label>
          <Select 
            v-model="selectedMonth" 
            :options="monthOptions" 
            optionLabel="label" 
            optionValue="value" 
            showClear
            filter
            filterPlaceholder="Cari bulan..."
            placeholder="Semua Bulan" 
            @change="fetchData" 
            class="w-full"
          >
            <template #value="slotProps">
              <span v-if="slotProps.value" class="font-semibold text-sm">
                {{ getMonthLabel(slotProps.value) }}
              </span>
              <span v-else class="text-slate-400 text-sm">Semua Bulan</span>
            </template>
            <template #option="slotProps">
              <span class="font-medium text-sm py-0.5">{{ slotProps.option.label }}</span>
            </template>
          </Select>
        </div>

        <!-- Tahun Filter -->
        <div class="w-full sm:w-44">
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <i class="pi pi-clock text-emerald-600"></i>
            <span>Tahun</span>
          </label>
          <Select 
            v-model="selectedYear" 
            :options="yearOptions" 
            optionLabel="label" 
            optionValue="value" 
            showClear
            placeholder="Semua Tahun" 
            @change="fetchData" 
            class="w-full"
          >
            <template #value="slotProps">
              <span v-if="slotProps.value" class="font-semibold text-sm">
                {{ slotProps.value }}
              </span>
              <span v-else class="text-slate-400 text-sm">Semua Tahun</span>
            </template>
            <template #option="slotProps">
              <span class="font-medium text-sm py-0.5">{{ slotProps.option.label }}</span>
            </template>
          </Select>
        </div>
      </div>

      <!-- Reset Filter Button -->
      <button 
        v-if="hasActiveFilter" 
        @click="resetFilters" 
        class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all self-end"
      >
        <i class="pi pi-filter-slash"></i>
        <span>Reset Filter</span>
      </button>
    </div>

    <!-- Data Table -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <DataTable :value="mutasis" :loading="loading" lazy :totalRecords="totalRecords" :rows="limit" :paginator="true" @page="onPage" class="p-datatable-sm">
        <Column field="noMutasi" header="No. Mutasi">
          <template #body="{ data }"><span class="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2.5 py-1 rounded-md">{{ data.noMutasi }}</span></template>
        </Column>
        <Column field="jenisMutasi" header="Jenis Mutasi">
          <template #body="{ data }">
            <span 
              class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider"
              :class="{
                'bg-emerald-50 text-emerald-700 border border-emerald-200': data.jenisMutasi === 'pembelian',
                'bg-blue-50 text-blue-700 border border-blue-200': data.jenisMutasi === 'penjualan',
                'bg-purple-50 text-purple-700 border border-purple-200': data.jenisMutasi === 'perpindahan',
              }"
            >
              {{ data.jenisMutasi }}
            </span>
          </template>
        </Column>
        <Column header="Tanggal"><template #body="{ data }"><span class="text-sm font-semibold text-slate-700">{{ formatDate(data.tglMutasi) }}</span></template></Column>
        <Column header="Supplier"><template #body="{ data }"><span class="text-sm text-slate-800">{{ data.supplier?.namaSupplier || '-' }}</span></template></Column>
        <Column header="Jumlah Barang"><template #body="{ data }"><span class="text-sm font-bold text-slate-900">{{ data.dtMutasis?.length || 0 }} Unit</span></template></Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/api/axios';
import { formatDate } from '@/utils/formatters';
import { MonthList, JenisMutasiList } from '@/utils/constants';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Select from 'primevue/select';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const currentYear = new Date().getFullYear();

const mutasis = ref([]);
const totalRecords = ref(0);
const loading = ref(false);
const exporting = ref(false);
const selectedJenis = ref(null);
const selectedMonth = ref(null);
const selectedYear = ref(currentYear);
const page = ref(1);
const limit = ref(20);

const jenisOptions = [
  { label: 'Semua Jenis', value: null },
  ...JenisMutasiList.map(j => ({ label: j.label, value: j.value })),
];

const monthOptions = [
  { label: 'Semua Bulan', value: null },
  ...MonthList.map(m => ({ label: m.label, value: m.value })),
];

const yearOptions = [
  { label: 'Semua Tahun', value: null },
  ...Array.from({ length: 6 }, (_, i) => {
    const y = currentYear - i;
    return { label: y.toString(), value: y };
  }),
];

const hasActiveFilter = computed(() => {
  return selectedJenis.value || selectedMonth.value || selectedYear.value !== currentYear;
});

function getJenisLabel(value) {
  const found = jenisOptions.find(j => j.value === value);
  return found ? found.label : value;
}

function getMonthLabel(value) {
  const found = monthOptions.find(m => m.value === value);
  return found ? found.label : value;
}

function resetFilters() {
  selectedJenis.value = null;
  selectedMonth.value = null;
  selectedYear.value = currentYear;
  page.value = 1;
  fetchData();
}

async function fetchData() {
  loading.value = true;
  try {
    const res = await api.get('/mutasis', {
      params: {
        page: page.value,
        limit: limit.value,
        jenis: selectedJenis.value || undefined,
        month: selectedMonth.value || undefined,
        year: selectedYear.value || undefined,
      },
    });
    mutasis.value = res.data.data;
    totalRecords.value = res.data.meta.total;
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat data', life: 3000 });
  } finally {
    loading.value = false;
  }
}

function onPage(event) {
  page.value = event.page + 1;
  limit.value = event.rows;
  fetchData();
}

async function handleExportExcel() {
  exporting.value = true;
  try {
    const response = await api.get('/laporan/mutasi/export/excel', {
      params: {
        jenisMutasi: selectedJenis.value || undefined,
        month: selectedMonth.value || undefined,
        year: selectedYear.value || undefined,
      },
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'laporan-mutasi.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.add({ severity: 'success', summary: 'Sukses', detail: 'Laporan mutasi berhasil diunduh', life: 3000 });
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal mengunduh laporan', life: 3000 });
  } finally {
    exporting.value = false;
  }
}

onMounted(fetchData);
</script>
