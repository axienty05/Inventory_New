<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Service Eksternal</h1>
        <p class="text-sm text-slate-500 mt-0.5">Kelola riwayat service perangkat ke vendor / service center resmi</p>
      </div>
      <router-link to="/dashboard/service/create" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-lg shadow-emerald-600/25 transition-all">
        <i class="pi pi-plus"></i>
        <span>Tambah Service</span>
      </router-link>
    </div>

    <!-- Search Bar -->
    <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between gap-4">
      <div class="relative flex-1 max-w-md">
        <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
        <input v-model="search" @input="handleSearch" type="text" placeholder="Cari No SJ, pemakai, barang, atau vendor..." class="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500" />
      </div>
    </div>

    <!-- Data Table -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <DataTable :value="services" :loading="loading" lazy :totalRecords="totalRecords" :rows="limit" :paginator="true" @page="onPage" class="p-datatable-sm">
        <Column header="Tanggal">
          <template #body="{ data }">
            <div>
              <p class="text-xs font-bold text-slate-800">{{ formatDate(data.tglService) }}</p>
              <p class="text-[11px] text-emerald-600 font-medium">Selesai: {{ data.tglSelesai ? formatDate(data.tglSelesai) : 'Sedang Service' }}</p>
            </div>
          </template>
        </Column>
        <Column field="noSj" header="No. SJ">
          <template #body="{ data }"><span class="font-mono text-xs font-semibold">{{ data.noSj || '-' }}</span></template>
        </Column>
        <Column header="Barang">
          <template #body="{ data }">
            <div>
              <p class="font-semibold text-slate-800 text-sm">{{ data.barang?.namaBarang || '-' }}</p>
              <p class="text-xs text-slate-400">S/N: {{ data.barang?.serialNumber || '-' }} | User: {{ data.pemakai?.nama || '-' }}</p>
            </div>
          </template>
        </Column>
        <Column header="Service Center">
          <template #body="{ data }">
            <span class="text-sm font-medium text-slate-700">{{ data.serviceCenter?.namaService || '-' }}</span>
          </template>
        </Column>
        <Column header="Biaya">
          <template #body="{ data }">
            <span class="font-bold text-slate-800 text-sm">{{ formatRupiah(data.biaya) }}</span>
          </template>
        </Column>
        <Column header="Aksi" style="width: 120px" class="text-right">
          <template #body="{ data }">
            <div class="flex items-center justify-end gap-2">
              <router-link :to="'/dashboard/service/edit/' + data.id" class="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50" title="Edit">
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
import { formatDate, formatRupiah } from '@/utils/formatters';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';

const toast = useToast();
const confirm = useConfirm();

const services = ref([]);
const totalRecords = ref(0);
const loading = ref(false);
const search = ref('');
const page = ref(1);
const limit = ref(20);

async function fetchData() {
  loading.value = true;
  try {
    const res = await api.get('/services', {
      params: { page: page.value, limit: limit.value, search: search.value },
    });
    services.value = res.data.data;
    totalRecords.value = res.data.meta.total;
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat data service', life: 3000 });
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
    message: `Yakin ingin menghapus data service untuk "${data.barang?.namaBarang}"?`,
    header: 'Konfirmasi Hapus',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await api.delete(`/services/${data.id}`);
        toast.add({ severity: 'success', summary: 'Sukses', detail: 'Data service berhasil dihapus', life: 3000 });
        fetchData();
      } catch (err) {
        toast.add({ severity: 'error', summary: 'Gagal', detail: err.response?.data?.message || 'Tidak dapat menghapus', life: 3000 });
      }
    },
  });
}

onMounted(fetchData);
</script>
