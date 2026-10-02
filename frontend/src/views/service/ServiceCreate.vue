<template>
  <div class="space-y-6 max-w-4xl">
    <div class="flex items-center gap-4">
      <router-link to="/dashboard/service" class="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"><i class="pi pi-arrow-left text-base"></i></router-link>
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Tambah Service Eksternal</h1>
        <p class="text-sm text-slate-500 mt-0.5">Catat pengiriman barang ke service center vendor</p>
      </div>
    </div>

    <div class="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Pemakai</label>
            <Select 
              v-model="form.m_pemakai_id" 
              :options="pemakaiOptions" 
              optionLabel="label" 
              optionValue="value" 
              filter 
              placeholder="Pilih atau ketik pemakai..." 
              @change="loadBarangs" 
              class="w-full"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Barang</label>
            <Select 
              v-model="form.m_barang_id" 
              :options="barangOptions" 
              optionLabel="label" 
              optionValue="value" 
              filter 
              :disabled="!form.m_pemakai_id" 
              placeholder="Pilih atau ketik barang..." 
              class="w-full"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Service Center (Vendor)</label>
            <Select 
              v-model="form.m_service_center_id" 
              :options="scOptions" 
              optionLabel="label" 
              optionValue="value" 
              filter 
              placeholder="Pilih atau ketik service center..." 
              class="w-full"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">No. Surat Jalan (SJ)</label>
            <input v-model="form.no_sj" type="text" placeholder="Contoh: SJ-2026/001" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Tanggal Service (Mulai)</label>
            <input v-model="form.tgl_service" type="date" required class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Tanggal Selesai</label>
            <input v-model="form.tgl_selesai" type="date" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500" />
            <p class="text-[11px] text-slate-400 mt-1">Kosongkan jika masih dalam proses</p>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Biaya (Rp)</label>
            <input v-model.number="form.biaya" type="number" min="0" placeholder="0" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Deskripsi Kerusakan</label>
          <textarea v-model="form.kerusakan" rows="2" required placeholder="Jelaskan kendala atau gejala kerusakan..." class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500"></textarea>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Analisa Teknisi</label>
            <textarea v-model="form.analisa" rows="2" placeholder="Hasil analisa dari service center..." class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500"></textarea>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Solusi / Tindakan</label>
            <textarea v-model="form.solusi" rows="2" placeholder="Tindakan perbaikan atau penggantian part..." class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500"></textarea>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <router-link to="/dashboard/service" class="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50">Batal</router-link>
          <button type="submit" :disabled="saving" class="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 disabled:opacity-50">
            {{ saving ? 'Menyimpan...' : 'Simpan Data Service' }}
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
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const toast = useToast();

const pemakais = ref([]);
const barangs = ref([]);
const serviceCenters = ref([]);
const saving = ref(false);

const form = reactive({
  m_pemakai_id: null,
  m_barang_id: null,
  m_service_center_id: null,
  no_sj: '',
  tgl_service: new Date().toISOString().split('T')[0],
  tgl_selesai: '',
  biaya: 0,
  kerusakan: '',
  analisa: '',
  solusi: '',
});

const pemakaiOptions = computed(() =>
  pemakais.value.map(p => ({ label: `${p.nama} (${p.department.toUpperCase()})`, value: p.id }))
);

const barangOptions = computed(() =>
  barangs.value.map(b => ({
    label: b.serialNumber ? `${b.namaBarang} (S/N: ${b.serialNumber})` : `${b.namaBarang} (Tanpa S/N)`,
    value: b.id,
  }))
);

const scOptions = computed(() =>
  serviceCenters.value.map(sc => ({ label: sc.namaService, value: sc.id }))
);

async function loadInitial() {
  try {
    const [pemakaiRes, scRes] = await Promise.all([
      api.get('/pemakais/all'),
      api.get('/service-centers/active'),
    ]);
    pemakais.value = pemakaiRes.data.data;
    serviceCenters.value = scRes.data.data;
  } catch (err) {
    console.error(err);
  }
}

async function loadBarangs() {
  if (!form.m_pemakai_id) {
    barangs.value = [];
    form.m_barang_id = null;
    return;
  }
  try {
    const res = await api.get(`/barangs/by-pemakai/${form.m_pemakai_id}`, {
      params: { exclude: 'sparepart,license,storage,memory,keyboard,mouse,stavolt' },
    });
    barangs.value = res.data.data;
  } catch (err) {
    console.error(err);
  }
}

async function handleSubmit() {
  if (!form.m_pemakai_id || !form.m_barang_id || !form.m_service_center_id) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: 'Harap lengkapi Pemakai, Barang, dan Service Center', life: 3000 });
    return;
  }
  saving.value = true;
  try {
    await api.post('/services', {
      ...form,
      m_pemakai_id: parseInt(form.m_pemakai_id, 10),
      m_barang_id: parseInt(form.m_barang_id, 10),
      m_service_center_id: parseInt(form.m_service_center_id, 10),
      biaya: Number(form.biaya || 0),
    });
    toast.add({ severity: 'success', summary: 'Sukses', detail: 'Data service berhasil disimpan', life: 3000 });
    router.push({ name: 'service.index' });
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: err.response?.data?.message || 'Gagal menyimpan', life: 4000 });
  } finally {
    saving.value = false;
  }
}

onMounted(loadInitial);
</script>
