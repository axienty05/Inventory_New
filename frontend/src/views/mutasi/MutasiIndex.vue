<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Mutasi Barang</h1>
        <p class="text-sm text-slate-500 mt-0.5">Kelola transaksi pengadaan, penjualan, dan perpindahan aset</p>
      </div>
      <router-link to="/dashboard/mutasi/create" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-lg shadow-emerald-600/25 transition-all">
        <i class="pi pi-plus"></i>
        <span>Buat Mutasi Baru</span>
      </router-link>
    </div>

    <!-- Search Bar -->
    <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between gap-4">
      <div class="relative flex-1 max-w-md">
        <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
        <input v-model="search" @input="handleSearch" type="text" placeholder="Cari nomor mutasi atau supplier..." class="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500" />
      </div>
    </div>

    <!-- Data Table -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <DataTable :value="mutasis" :loading="loading" lazy :totalRecords="totalRecords" :rows="limit" :paginator="true" @page="onPage" class="p-datatable-sm">
        <Column field="noMutasi" header="No. Mutasi" sortable>
          <template #body="{ data }">
            <span class="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-1 rounded-md">{{ data.noMutasi }}</span>
          </template>
        </Column>
        <Column header="Jenis Mutasi">
          <template #body="{ data }">
            <span 
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider"
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
        <Column header="Tanggal">
          <template #body="{ data }">
            <span class="text-sm font-semibold text-slate-700">{{ formatDate(data.tglMutasi) }}</span>
          </template>
        </Column>
        <Column header="Jumlah Barang">
          <template #body="{ data }">
            <span class="text-sm font-bold text-slate-800">{{ data.dtMutasis?.length || 0 }} Unit</span>
          </template>
        </Column>
        <Column header="Supplier">
          <template #body="{ data }">
            <span>{{ data.supplier?.namaSupplier || '-' }}</span>
          </template>
        </Column>
        <Column header="Aksi" style="width: 140px" class="text-right">
          <template #body="{ data }">
            <div class="flex items-center justify-end gap-2">
              <router-link :to="'/dashboard/mutasi/show/' + data.id" class="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50" title="Detail">
                <i class="pi pi-eye text-sm"></i>
              </router-link>
              <router-link :to="'/dashboard/mutasi/edit/' + data.id" class="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50" title="Edit">
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
import { ref, onMounted } from 'vue';
import api from '@/api/axios';
import { formatDate } from '@/utils/formatters';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';

const toast = useToast();
const confirm = useConfirm();
const mutasis = ref([]);
const totalRecords = ref(0);
const loading = ref(false);
const search = ref('');
const page = ref(1);
const limit = ref(20);

async function fetchData() {
  loading.value = true;
  try {
    const res = await api.get('/mutasis', { params: { page: page.value, limit: limit.value, search: search.value } });
    mutasis.value = res.data.data;
    totalRecords.value = res.data.meta.total;
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat data mutasi', life: 3000 });
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
    message: `Yakin ingin menghapus mutasi "${data.noMutasi}"? Tindakan ini akan mengembalikan perubahan status/pemakai barang.`,
    header: 'Konfirmasi Hapus Mutasi',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await api.delete(`/mutasis/${data.id}`);
        toast.add({ severity: 'success', summary: 'Sukses', detail: 'Data mutasi berhasil dihapus', life: 3000 });
        fetchData();
      } catch (err) {
        toast.add({ severity: 'error', summary: 'Gagal', detail: err.response?.data?.message || 'Tidak dapat menghapus', life: 3000 });
      }
    },
  });
}

onMounted(fetchData);
</script>
