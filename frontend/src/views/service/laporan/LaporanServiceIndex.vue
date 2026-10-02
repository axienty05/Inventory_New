<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Laporan Service Eksternal</h1>
        <p class="text-sm text-slate-500 mt-0.5">Rekapitulasi biaya dan riwayat perbaikan ke vendor</p>
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
      <DataTable :value="services" :loading="loading" lazy :totalRecords="totalRecords" :rows="limit" :paginator="true" @page="onPage" class="p-datatable-sm">
        <Column header="Tanggal"><template #body="{ data }"><span class="text-sm font-semibold text-slate-700">{{ formatDate(data.tglService) }}</span></template></Column>
        <Column field="noSj" header="No. SJ"><template #body="{ data }"><span class="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-1 rounded-md">{{ data.noSj || '-' }}</span></template></Column>
        <Column header="Barang">
          <template #body="{ data }">
            <div>
              <p class="font-semibold text-slate-800 text-sm">{{ data.barang?.namaBarang || '-' }}</p>
              <p class="text-xs text-slate-400">S/N: {{ data.barang?.serialNumber || '-' }}</p>
            </div>
          </template>
        </Column>
        <Column header="Service Center"><template #body="{ data }"><span class="text-sm text-slate-800">{{ data.serviceCenter?.namaService || '-' }}</span></template></Column>
        <Column header="Biaya"><template #body="{ data }"><span class="font-bold text-emerald-700 text-sm">{{ formatRupiah(data.biaya) }}</span></template></Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/api/axios';
import { formatDate, formatRupiah } from '@/utils/formatters';
import { MonthList } from '@/utils/constants';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Select from 'primevue/select';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const currentYear = new Date().getFullYear();

const services = ref([]);
const totalRecords = ref(0);
const loading = ref(false);
const exporting = ref(false);
const selectedMonth = ref(null);
const selectedYear = ref(currentYear);
const page = ref(1);
const limit = ref(20);

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
  return selectedMonth.value || selectedYear.value !== currentYear;
});

function getMonthLabel(value) {
  const found = monthOptions.find(m => m.value === value);
  return found ? found.label : value;
}

function resetFilters() {
  selectedMonth.value = null;
  selectedYear.value = currentYear;
  page.value = 1;
  fetchData();
}

async function fetchData() {
  loading.value = true;
  try {
    const res = await api.get('/services', {
      params: { page: page.value, limit: limit.value, month: selectedMonth.value || undefined, year: selectedYear.value || undefined },
    });
    services.value = res.data.data;
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
    const response = await api.get('/laporan/service/export/excel', {
      params: { month: selectedMonth.value || undefined, year: selectedYear.value || undefined },
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'laporan-service-eksternal.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.add({ severity: 'success', summary: 'Sukses', detail: 'Laporan service berhasil diunduh', life: 3000 });
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal mengunduh laporan', life: 3000 });
  } finally {
    exporting.value = false;
  }
}

onMounted(fetchData);
</script>
