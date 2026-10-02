<template>
  <div class="space-y-6 max-w-4xl">
    <div class="flex items-center gap-4">
      <router-link to="/dashboard/barang" class="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100">
        <i class="pi pi-arrow-left text-base"></i>
      </router-link>
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Tambah Barang Baru</h1>
        <p class="text-sm text-slate-500 mt-0.5">Daftarkan aset perangkat baru ke dalam sistem</p>
      </div>
    </div>

    <div class="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Kode Barang</label>
            <input :value="kodeBarangPreview" type="text" disabled class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-mono text-sm font-semibold" />
            <p class="text-[11px] text-slate-400 mt-1">Kode otomatis digenerate oleh sistem</p>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Pemakai / Pengguna</label>
            <Select 
              v-model="form.m_pemakai_id" 
              :options="pemakaiOptions" 
              optionLabel="label" 
              optionValue="value" 
              filter 
              placeholder="Pilih atau ketik pemakai..." 
              class="w-full"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Nama Barang</label>
            <input v-model="form.nama_barang" type="text" required placeholder="Contoh: Laptop Asus ROG" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Serial Number (S/N)</label>
            <input v-model="form.serial_number" type="text" placeholder="Contoh: SN-88392-X" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Kategori</label>
            <Select 
              v-model="form.kategori" 
              :options="KategoriList" 
              optionLabel="label" 
              optionValue="value" 
              filter 
              placeholder="Pilih kategori..." 
              class="w-full capitalize"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Status Barang</label>
            <Select 
              v-model="form.status" 
              :options="StatusList" 
              optionLabel="label" 
              optionValue="value" 
              placeholder="Pilih status..." 
              class="w-full capitalize"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Keterangan / Spesifikasi</label>
          <textarea v-model="form.keterangan" rows="3" placeholder="Tambahkan catatan atau spesifikasi penting..." class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500"></textarea>
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <router-link to="/dashboard/barang" class="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50">Batal</router-link>
          <button type="submit" :disabled="saving" class="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 disabled:opacity-50">
            {{ saving ? 'Menyimpan...' : 'Simpan Barang' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/api/axios';
import { KategoriList, StatusList } from '@/utils/constants';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const toast = useToast();

const pemakais = ref([]);
const kodeBarangPreview = ref('B/......');
const saving = ref(false);

const form = reactive({
  m_pemakai_id: null,
  nama_barang: '',
  serial_number: '',
  kategori: 'komputer',
  keterangan: '',
  status: 'aktif',
});

const pemakaiOptions = computed(() =>
  pemakais.value.map(p => ({ label: `${p.nama} (${p.department.toUpperCase()})`, value: p.id }))
);

async function loadData() {
  try {
    const [pemakaiRes, kodeRes] = await Promise.all([
      api.get('/pemakais/all'),
      api.get('/barangs/generate-kode'),
    ]);
    pemakais.value = pemakaiRes.data.data;
    kodeBarangPreview.value = kodeRes.data.data.kodeBarang;
  } catch (err) {
    console.error(err);
  }
}

async function handleSubmit() {
  if (!form.m_pemakai_id) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: 'Harap pilih Pemakai / Pengguna barang', life: 3000 });
    return;
  }
  saving.value = true;
  try {
    await api.post('/barangs', {
      ...form,
      m_pemakai_id: parseInt(form.m_pemakai_id, 10),
    });
    toast.add({ severity: 'success', summary: 'Sukses', detail: 'Barang berhasil didaftarkan', life: 3000 });
    router.push({ name: 'barang.index' });
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: err.response?.data?.message || 'Gagal menyimpan barang', life: 4000 });
  } finally {
    saving.value = false;
  }
}

onMounted(loadData);
</script>
