<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Laporan Data Barang</h1>
        <p class="text-sm text-slate-500 mt-0.5">Filter dan ekspor data aset perangkat ke format Excel</p>
      </div>
      <button @click="handleExportExcel" :disabled="exporting" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold shadow-lg shadow-emerald-700/25 transition-all disabled:opacity-50">
        <i v-if="exporting" class="pi pi-spin pi-spinner"></i>
        <i v-else class="pi pi-file-excel"></i>
        <span>{{ exporting ? 'Mengunduh...' : 'Export Excel (.xlsx)' }}</span>
      </button>
    </div>

    <!-- Filter Card -->
    <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
      <div class="flex flex-wrap items-end gap-4">

        <!-- Search -->
        <div class="flex-1 min-w-[200px]">
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <i class="pi pi-search text-emerald-600"></i>
            <span>Cari</span>
          </label>
          <div class="relative">
            <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
            <input v-model="search" @input="handleSearch" type="text" placeholder="Cari nama, kode, S/N..." class="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 outline-none transition-all" />
          </div>
        </div>

        <!-- Pemakai Filter -->
        <div class="w-full sm:w-56">
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <i class="pi pi-user text-emerald-600"></i>
            <span>Pemakai</span>
          </label>
          <Select
            v-model="selectedPemakai"
            :options="pemakaiOptions"
            optionLabel="label"
            optionValue="value"
            filter
            filterPlaceholder="Cari pemakai..."
            showClear
            placeholder="Semua Pemakai"
            @change="fetchData"
            class="w-full"
          >
            <template #value="slotProps">
              <span v-if="slotProps.value" class="font-semibold text-sm">
                {{ getPemakaiLabel(slotProps.value) }}
              </span>
              <span v-else class="text-slate-400 text-sm">Semua Pemakai</span>
            </template>
            <template #option="slotProps">
              <span class="font-medium text-sm py-0.5">{{ slotProps.option.label }}</span>
            </template>
          </Select>
        </div>

        <!-- Kategori Filter -->
        <div class="w-full sm:w-48">
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <i class="pi pi-tag text-emerald-600"></i>
            <span>Kategori</span>
          </label>
          <Select
            v-model="selectedKategori"
            :options="kategoriOptions"
            optionLabel="label"
            optionValue="value"
            filter
            filterPlaceholder="Cari kategori..."
            showClear
            placeholder="Semua Kategori"
            @change="fetchData"
            class="w-full"
          >
            <template #value="slotProps">
              <span v-if="slotProps.value" class="font-semibold text-sm capitalize">
                {{ getKategoriLabel(slotProps.value) }}
              </span>
              <span v-else class="text-slate-400 text-sm">Semua Kategori</span>
            </template>
            <template #option="slotProps">
              <span class="font-medium text-sm py-0.5 capitalize">{{ slotProps.option.label }}</span>
            </template>
          </Select>
        </div>

        <!-- Status Filter -->
        <div class="w-full sm:w-44">
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <i class="pi pi-info-circle text-emerald-600"></i>
            <span>Status</span>
          </label>
          <Select
            v-model="selectedStatus"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            showClear
            placeholder="Semua Status"
            @change="fetchData"
            class="w-full"
          >
            <template #value="slotProps">
              <span v-if="slotProps.value" class="font-semibold text-sm capitalize">
                {{ getStatusLabel(slotProps.value) }}
              </span>
              <span v-else class="text-slate-400 text-sm">Semua Status</span>
            </template>
            <template #option="slotProps">
              <span class="font-medium text-sm py-0.5 capitalize">{{ slotProps.option.label }}</span>
            </template>
          </Select>
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
    </div>

    <!-- Data Table -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <DataTable :value="barangs" :loading="loading" lazy :totalRecords="totalRecords" :rows="limit" :paginator="true" @page="onPage" class="p-datatable-sm">
        <Column field="kodeBarang" header="Kode" sortable>
          <template #body="{ data }"><span class="font-mono text-xs font-bold bg-slate-100 px-2 py-1 rounded-md">{{ data.kodeBarang }}</span></template>
        </Column>
        <Column field="namaBarang" header="Nama Barang" sortable>
          <template #body="{ data }">
            <span class="font-semibold text-slate-800">{{ data.namaBarang }}</span>
          </template>
        </Column>
        <Column field="serialNumber" header="S/N"><template #body="{ data }">{{ data.serialNumber || '-' }}</template></Column>
        <Column field="kategori" header="Kategori" sortable><template #body="{ data }"><span class="capitalize text-xs font-semibold text-slate-600">{{ data.kategori.replace(/_/g, ' ') }}</span></template></Column>
        <Column header="Pemakai"><template #body="{ data }"><span class="text-sm font-semibold text-slate-800">{{ data.pemakai?.nama || '-' }}</span></template></Column>
        <Column field="status" header="Status" sortable><template #body="{ data }"><StatusBadge :status="data.status" /></template></Column>
        <Column header="Aksi" style="width: 80px" class="text-right">
          <template #body="{ data }">
            <router-link :to="'/dashboard/laporanperbarang/' + data.id" class="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50" title="Histori Detail">
              <i class="pi pi-history text-sm"></i>
            </router-link>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/api/axios';
import { KategoriList, StatusList } from '@/utils/constants';
import StatusBadge from '@/components/ui/StatusBadge.vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Select from 'primevue/select';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const barangs = ref([]);
const pemakais = ref([]);
const totalRecords = ref(0);
const loading = ref(false);
const exporting = ref(false);
const search = ref('');
const selectedPemakai = ref(null);
const selectedKategori = ref(null);
const selectedStatus = ref(null);
const page = ref(1);
const limit = ref(20);

const pemakaiOptions = computed(() =>
  pemakais.value.map(p => ({
    label: `${p.nama} (${p.department.toUpperCase()})`,
    value: p.id,
  }))
);

const kategoriOptions = computed(() =>
  KategoriList.map(k => ({ label: k.label, value: k.value }))
);

const statusOptions = computed(() =>
  StatusList.map(s => ({ label: s.label, value: s.value }))
);

const hasActiveFilter = computed(() => {
  return !!selectedPemakai.value || !!selectedKategori.value || !!selectedStatus.value || !!search.value;
});

function getPemakaiLabel(value) {
  const found = pemakaiOptions.value.find(p => p.value === value);
  return found ? found.label : value;
}

function getKategoriLabel(value) {
  const found = kategoriOptions.value.find(k => k.value === value);
  return found ? found.label : value;
}

function getStatusLabel(value) {
  const found = statusOptions.value.find(s => s.value === value);
  return found ? found.label : value;
}

function resetFilters() {
  selectedPemakai.value = null;
  selectedKategori.value = null;
  selectedStatus.value = null;
  search.value = '';
  page.value = 1;
  fetchData();
}

async function loadPemakais() {
  try {
    const res = await api.get('/pemakais/all');
    pemakais.value = res.data.data;
  } catch (err) {
    console.error(err);
  }
}

async function fetchData() {
  loading.value = true;
  try {
    const res = await api.get('/barangs', {
      params: {
        page: page.value,
        limit: limit.value,
        search: search.value,
        m_pemakai_id: selectedPemakai.value || undefined,
        kategori: selectedKategori.value || undefined,
        status: selectedStatus.value || undefined
      },
    });
    barangs.value = res.data.data;
    totalRecords.value = res.data.meta.total;
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat data', life: 3000 });
  } finally {
    loading.value = false;
  }
}

let timeout = null;
function handleSearch() {
  clearTimeout(timeout);
  timeout = setTimeout(() => { page.value = 1; fetchData(); }, 300);
}

function onPage(event) {
  page.value = event.page + 1;
  limit.value = event.rows;
  fetchData();
}

async function handleExportExcel() {
  exporting.value = true;
  try {
    const response = await api.get('/laporan/barang/export/excel', {
      params: {
        search: search.value,
        m_pemakai_id: selectedPemakai.value || undefined,
        kategori: selectedKategori.value || undefined,
        status: selectedStatus.value || undefined
      },
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'laporan-barang.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.add({ severity: 'success', summary: 'Sukses', detail: 'Laporan berhasil diunduh', life: 3000 });
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: 'Gagal mengunduh laporan', life: 3000 });
  } finally {
    exporting.value = false;
  }
}

onMounted(() => {
  loadPemakais();
  fetchData();
});
</script>
