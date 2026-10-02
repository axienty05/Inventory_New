<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Data Pemakai</h1>
        <p class="text-sm text-slate-500 mt-0.5">Kelola data pengguna/karyawan yang memegang aset</p>
      </div>
      <button @click="openCreateModal" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-lg shadow-emerald-600/25 transition-all">
        <i class="pi pi-plus"></i>
        <span>Tambah Pemakai</span>
      </button>
    </div>

    <div class="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between gap-4">
      <div class="relative flex-1 max-w-md">
        <i class="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
        <input v-model="search" @input="handleSearch" type="text" placeholder="Cari nama atau department..." class="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500" />
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      <DataTable :value="pemakais" :loading="loading" lazy :totalRecords="totalRecords" :rows="limit" :paginator="true" @page="onPage" class="p-datatable-sm">
        <Column field="nama" header="Nama Pemakai" sortable>
          <template #body="{ data }"><span class="font-semibold text-slate-800">{{ data.nama }}</span></template>
        </Column>
        <Column field="department" header="Department" sortable>
          <template #body="{ data }"><span class="uppercase text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">{{ data.department }}</span></template>
        </Column>
        <Column field="status" header="Status" sortable>
          <template #body="{ data }"><StatusBadge :status="data.status" /></template>
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

    <Dialog v-model:visible="modalVisible" modal :header="modalTitle" :style="{ width: '450px' }" class="p-fluid">
      <form @submit.prevent="handleSave" class="space-y-4 pt-2">
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Nama Pemakai</label>
          <input v-model="form.nama" type="text" required placeholder="Contoh: John Doe" class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500" />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Department</label>
          <select v-model="form.department" required class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 capitalize">
            <option v-for="d in DepartmentList" :key="d.value" :value="d.value">{{ d.label }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Status</label>
          <select v-model="form.status" class="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500">
            <option :value="true">Aktif</option>
            <option :value="false">Tidak Aktif</option>
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
import { ref, reactive, onMounted } from 'vue';
import api from '@/api/axios';
import { DepartmentList } from '@/utils/constants';
import StatusBadge from '@/components/ui/StatusBadge.vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';

const toast = useToast();
const confirm = useConfirm();
const pemakais = ref([]);
const totalRecords = ref(0);
const loading = ref(false);
const search = ref('');
const page = ref(1);
const limit = ref(20);
const modalVisible = ref(false);
const modalTitle = ref('Tambah Pemakai');
const saving = ref(false);
const editingId = ref(null);
const form = reactive({ nama: '', department: 'it', status: true });

async function fetchData() {
  loading.value = true;
  try {
    const res = await api.get('/pemakais', { params: { page: page.value, limit: limit.value, search: search.value } });
    pemakais.value = res.data.data;
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

function openCreateModal() {
  editingId.value = null;
  modalTitle.value = 'Tambah Pemakai';
  form.nama = ''; form.department = 'it'; form.status = true;
  modalVisible.value = true;
}

function openEditModal(data) {
  editingId.value = data.id;
  modalTitle.value = 'Edit Pemakai';
  form.nama = data.nama; form.department = data.department; form.status = data.status;
  modalVisible.value = true;
}

async function handleSave() {
  saving.value = true;
  try {
    if (editingId.value) {
      await api.put(`/pemakais/${editingId.value}`, form);
      toast.add({ severity: 'success', summary: 'Sukses', detail: 'Pemakai berhasil diperbarui', life: 3000 });
    } else {
      await api.post('/pemakais', form);
      toast.add({ severity: 'success', summary: 'Sukses', detail: 'Pemakai berhasil ditambahkan', life: 3000 });
    }
    modalVisible.value = false;
    fetchData();
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: err.response?.data?.message || 'Terjadi kesalahan', life: 3000 });
  } finally {
    saving.value = false;
  }
}

function confirmDelete(data) {
  confirm.require({
    message: `Yakin ingin menghapus pemakai "${data.nama}"?`,
    header: 'Konfirmasi Hapus',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await api.delete(`/pemakais/${data.id}`);
        toast.add({ severity: 'success', summary: 'Sukses', detail: 'Data berhasil dihapus', life: 3000 });
        fetchData();
      } catch (err) {
        toast.add({ severity: 'error', summary: 'Gagal', detail: err.response?.data?.message || 'Tidak dapat menghapus', life: 3000 });
      }
    },
  });
}

onMounted(fetchData);
</script>
