<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Data Barang</h1>
        <p class="text-sm text-slate-500 mt-0.5">Kelola seluruh data aset, perangkat, dan inventaris kantor</p>
      </div>
      <router-link to="/dashboard/barang/create" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-lg shadow-emerald-600/25 transition-all">
        <i class="pi pi-plus"></i>
        <span>Tambah Barang</span>
      </router-link>
    </div>

    <!-- Filter Bar -->
    <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
      <div class="relative flex-1 w-full lg:max-w-xs">
        <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
        <input v-model="search" @input="handleSearch" type="text" placeholder="Cari nama, kode, S/N..." class="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500" />
      </div>
      <div class="flex flex-wrap items-center gap-3 w-full lg:w-auto">
        <!-- Pemakai Filter -->
        <Select 
          v-model="selectedPemakai" 
          :options="pemakaiOptions" 
          optionLabel="label" 
          optionValue="value" 
          filter 
          showClear
          placeholder="Semua Pemakai" 
          @change="fetchData" 
          class="w-full sm:w-56"
        />

        <!-- Kategori Filter -->
        <Select 
          v-model="selectedKategori" 
          :options="kategoriOptions" 
          optionLabel="label" 
          optionValue="value" 
          filter
          showClear
          placeholder="Semua Kategori" 
          @change="fetchData" 
          class="w-full sm:w-44 capitalize"
        />

        <!-- Status Filter -->
        <Select 
          v-model="selectedStatus" 
          :options="statusOptions" 
          optionLabel="label" 
          optionValue="value" 
          showClear
          placeholder="Semua Status" 
          @change="fetchData" 
          class="w-full sm:w-40 capitalize"
        />
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
        <Column header="Aksi" style="width: 120px" class="text-right">
          <template #body="{ data }">
            <div class="flex items-center justify-end gap-2">
              <router-link :to="'/dashboard/barang/edit/' + data.id" class="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50" title="Edit">
                <i class="pi pi-pencil text-sm"></i>
              </router-link>
              <button @click="confirmDelete(data)" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50" title="Hapus">
                <i class="pi pi-trash text-sm"></i>
              </button>
            </div>
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
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';

const toast = useToast();
const confirm = useConfirm();

const barangs = ref([]);
const pemakais = ref([]);
const totalRecords = ref(0);
const loading = ref(false);
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
        status: selectedStatus.value || undefined,
      },
    });
    barangs.value = res.data.data;
    totalRecords.value = res.data.meta.total;
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat data barang', life: 3000 });
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

function confirmDelete(data) {
  confirm.require({
    message: `Yakin ingin menghapus "${data.namaBarang}" (${data.kodeBarang})?`,
    header: 'Konfirmasi Hapus',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await api.delete(`/barangs/${data.id}`);
        toast.add({ severity: 'success', summary: 'Sukses', detail: 'Barang berhasil dihapus', life: 3000 });
        fetchData();
      } catch (err) {
        toast.add({ severity: 'error', summary: 'Gagal', detail: err.response?.data?.message || 'Tidak dapat menghapus', life: 4000 });
      }
    },
  });
}

onMounted(() => {
  loadPemakais();
  fetchData();
});
</script>
