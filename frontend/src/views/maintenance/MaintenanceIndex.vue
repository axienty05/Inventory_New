<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Maintenance PC</h1>
        <p class="text-sm text-slate-500 mt-0.5">Jadwal pemeliharaan dan perawatan berkala komputer kantor</p>
      </div>
      <button @click="openCreateModal" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-lg shadow-emerald-600/25 transition-all">
        <i class="pi pi-plus"></i>
        <span>Tambah Jadwal</span>
      </button>
    </div>

    <!-- Search Bar -->
    <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between gap-4">
      <div class="relative flex-1 max-w-md">
        <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
        <input v-model="search" @input="handleSearch" type="text" placeholder="Cari nama user, kode PC, catatan..." class="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500" />
      </div>
    </div>

    <!-- Data Table -->
    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <DataTable :value="items" :loading="loading" lazy :totalRecords="totalRecords" :rows="limit" :paginator="true" @page="onPage" class="p-datatable-sm">
        <Column header="User / Pemakai">
          <template #body="{ data }">
            <div>
              <p class="font-semibold text-slate-800 text-sm">{{ data.barang?.pemakai?.nama || 'Tanpa Pemakai' }}</p>
              <p class="text-xs text-slate-400">Kode PC: {{ data.barang?.kodeBarang || '-' }}</p>
            </div>
          </template>
        </Column>
        <Column header="Jadwal">
          <template #body="{ data }">
            <span class="text-sm font-semibold text-slate-700">{{ formatDate(data.scheduledDate) }}</span>
          </template>
        </Column>
        <Column field="notes" header="Catatan" />
        <Column header="Status Selesai">
          <template #body="{ data }">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold" :class="data.status ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'">
              {{ data.status ? 'Selesai' : 'Belum Selesai' }}
            </span>
          </template>
        </Column>
        <Column header="Aksi" style="width: 120px" class="text-right">
          <template #body="{ data }">
            <div class="flex items-center justify-end gap-2">
              <button @click="openEditModal(data)" class="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"><i class="pi pi-pencil text-sm"></i></button>
              <button @click="confirmDelete(data)" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"><i class="pi pi-trash text-sm"></i></button>
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Modal Form -->
    <Dialog v-model:visible="modalVisible" modal :header="modalTitle" :style="{ width: '480px' }" class="p-fluid">
      <form @submit.prevent="handleSave" class="space-y-4 pt-2">
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">User / Pemakai</label>
          <Select 
            v-model="form.m_barang_id" 
            :options="computerOptions" 
            optionLabel="label" 
            optionValue="value" 
            filter 
            filterPlaceholder="Ketik nama user atau kode..."
            placeholder="Pilih nama user..." 
            class="w-full"
            :panelStyle="{ maxWidth: '440px' }"
          >
            <template #value="slotProps">
              <div v-if="slotProps.value" class="flex items-center justify-between w-full py-0.5 pr-2">
                <span class="font-semibold text-slate-800 text-sm">{{ getSelectedUser(slotProps.value)?.userName }}</span>
                <span class="text-xs text-slate-500 bg-slate-100 font-mono px-2 py-0.5 rounded border border-slate-200/60">{{ getSelectedUser(slotProps.value)?.kodeBarang }}</span>
              </div>
              <span v-else class="text-slate-400 text-sm">{{ slotProps.placeholder }}</span>
            </template>
            <template #option="slotProps">
              <div class="flex items-center justify-between w-full py-1">
                <span class="font-medium text-slate-800 text-sm">{{ slotProps.option.userName }}</span>
                <span class="text-xs text-slate-500 bg-slate-100 font-mono px-2 py-0.5 rounded border border-slate-200/60">{{ slotProps.option.kodeBarang }}</span>
              </div>
            </template>
          </Select>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Tanggal Jadwal</label>
          <input v-model="form.scheduled_date" type="date" required class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500" />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Catatan Perawatan</label>
          <textarea v-model="form.notes" rows="3" placeholder="Contoh: Cleaning hardware, check pasta processor, update software..." class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500"></textarea>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Status Pengerjaan</label>
          <select v-model="form.status" class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500">
            <option :value="false">Belum Selesai</option>
            <option :value="true">Selesai</option>
          </select>
        </div>
        <div class="flex justify-end gap-2 pt-4 border-t border-slate-100">
          <button type="button" @click="modalVisible = false" class="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50">Batal</button>
          <button type="submit" :disabled="saving" class="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 disabled:opacity-50">
            {{ saving ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>
      </form>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import api from '@/api/axios';
import { formatDate } from '@/utils/formatters';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import Select from 'primevue/select';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';

const toast = useToast();
const confirm = useConfirm();
const items = ref([]);
const computerList = ref([]);
const totalRecords = ref(0);
const loading = ref(false);
const search = ref('');
const page = ref(1);
const limit = ref(20);
const modalVisible = ref(false);
const modalTitle = ref('Tambah Jadwal');
const saving = ref(false);
const editingId = ref(null);

const form = reactive({ m_barang_id: null, scheduled_date: new Date().toISOString().split('T')[0], notes: '', status: false });

const computerOptions = computed(() => {
  return computerList.value
    .map(b => ({
      label: b.pemakai?.nama ? `${b.pemakai.nama} (${b.kodeBarang})` : `${b.kodeBarang} (Tanpa Pemakai)`,
      userName: b.pemakai?.nama || 'Tanpa Pemakai',
      kodeBarang: b.kodeBarang,
      value: b.id,
    }))
    .sort((a, b) => a.userName.localeCompare(b.userName));
});

function getSelectedUser(id) {
  return computerOptions.value.find(c => c.value === id);
}

async function fetchData() {
  loading.value = true;
  try {
    const res = await api.get('/maintenances', { params: { page: page.value, limit: limit.value, search: search.value } });
    items.value = res.data.data;
    totalRecords.value = res.data.meta.total;
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat data', life: 3000 });
  } finally {
    loading.value = false;
  }
}

async function loadComputers() {
  try {
    const res = await api.get('/barangs?kategori=komputer,laptop&limit=500');
    computerList.value = res.data.data;
  } catch (err) {
    console.error(err);
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

function openCreateModal() {
  editingId.value = null;
  modalTitle.value = 'Tambah Jadwal Maintenance';
  Object.assign(form, { m_barang_id: null, scheduled_date: new Date().toISOString().split('T')[0], notes: '', status: false });
  modalVisible.value = true;
}

function openEditModal(data) {
  editingId.value = data.id;
  modalTitle.value = 'Edit Jadwal Maintenance';
  Object.assign(form, {
    m_barang_id: data.mBarangId,
    scheduled_date: data.scheduledDate ? data.scheduledDate.split('T')[0] : '',
    notes: data.notes || '',
    status: data.status,
  });
  modalVisible.value = true;
}

async function handleSave() {
  if (!form.m_barang_id) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: 'Harap pilih User / Pemakai', life: 3000 });
    return;
  }
  saving.value = true;
  try {
    const payload = {
      ...form,
      m_barang_id: parseInt(form.m_barang_id, 10),
    };
    if (editingId.value) {
      await api.put(`/maintenances/${editingId.value}`, payload);
      toast.add({ severity: 'success', summary: 'Sukses', detail: 'Jadwal berhasil diperbarui', life: 3000 });
    } else {
      await api.post('/maintenances', payload);
      toast.add({ severity: 'success', summary: 'Sukses', detail: 'Jadwal berhasil ditambahkan', life: 3000 });
    }
    modalVisible.value = false;
    fetchData();
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: err.response?.data?.message || 'Gagal menyimpan', life: 3000 });
  } finally {
    saving.value = false;
  }
}

function confirmDelete(data) {
  confirm.require({
    message: 'Yakin ingin menghapus jadwal maintenance ini?',
    header: 'Konfirmasi Hapus',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await api.delete(`/maintenances/${data.id}`);
        toast.add({ severity: 'success', summary: 'Sukses', detail: 'Jadwal berhasil dihapus', life: 3000 });
        fetchData();
      } catch (err) {
        toast.add({ severity: 'error', summary: 'Gagal', detail: 'Tidak dapat menghapus', life: 3000 });
      }
    },
  });
}

onMounted(() => {
  fetchData();
  loadComputers();
});
</script>
