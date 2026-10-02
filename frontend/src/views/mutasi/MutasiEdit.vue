<template>
  <div class="space-y-6 max-w-4xl">
    <div class="flex items-center gap-4">
      <router-link to="/dashboard/mutasi" class="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"><i class="pi pi-arrow-left text-base"></i></router-link>
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Edit Mutasi Barang</h1>
        <p class="text-sm text-slate-500 mt-0.5">
          Nomor Transaksi: <span class="font-mono font-bold text-slate-800">{{ form.no_mutasi || '-' }}</span>
        </p>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <i class="pi pi-spin pi-spinner text-3xl text-emerald-600"></i>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Main Info Card -->
      <div class="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Jenis Mutasi</label>
            <div class="mt-1">
              <span 
                class="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider"
                :class="{
                  'bg-emerald-50 text-emerald-700 border border-emerald-200': form.jenis_mutasi === 'pembelian',
                  'bg-blue-50 text-blue-700 border border-blue-200': form.jenis_mutasi === 'penjualan',
                  'bg-purple-50 text-purple-700 border border-purple-200': form.jenis_mutasi === 'perpindahan',
                }"
              >
                {{ form.jenis_mutasi }}
              </span>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">No. Mutasi</label>
            <input :value="form.no_mutasi" disabled class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 text-slate-600 font-mono font-bold cursor-not-allowed" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Tanggal Mutasi</label>
            <input v-model="form.tgl_mutasi" type="date" required class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500" />
          </div>
        </div>

        <div v-if="form.jenis_mutasi !== 'perpindahan'" class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Supplier / Vendor</label>
            <Select 
              v-model="form.m_supplier_id" 
              :options="supplierOptions" 
              optionLabel="label" 
              optionValue="value" 
              filter 
              placeholder="Pilih atau ketik supplier..." 
              class="w-full"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Keterangan</label>
            <input v-model="form.keterangan" type="text" placeholder="Catatan transaksi..." class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500" />
          </div>
        </div>

        <div v-else>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Keterangan</label>
          <input v-model="form.keterangan" type="text" placeholder="Catatan transaksi perpindahan..." class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500" />
        </div>
      </div>

      <!-- Detail Rows Card -->
      <div class="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 class="text-base font-bold text-slate-900">Daftar Barang Mutasi</h2>
          <button type="button" @click="addRow" class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors">
            <i class="pi pi-plus"></i>
            <span>Tambah Baris</span>
          </button>
        </div>

        <div class="space-y-3">
          <div 
            v-for="(row, idx) in form.dtMutasis" 
            :key="idx" 
            class="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row items-center gap-3"
          >
            <div class="flex-1 w-full">
              <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Pilih Barang #{{ idx + 1 }}</label>
              <Select 
                v-model="row.m_barang_id" 
                :options="barangOptions" 
                optionLabel="label" 
                optionValue="value" 
                filter 
                placeholder="Pilih atau ketik barang..." 
                @change="onBarangSelect(row)" 
                class="w-full"
              />
            </div>

            <div v-if="form.jenis_mutasi === 'perpindahan'" class="w-full md:w-56">
              <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Pemakai Baru</label>
              <Select 
                v-model="row.pemakai_baru" 
                :options="pemakaiOptions" 
                optionLabel="label" 
                optionValue="value" 
                filter 
                placeholder="Pilih pemakai baru..." 
                class="w-full"
              />
            </div>

            <div v-else class="w-full md:w-44">
              <label class="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Harga (Rp)</label>
              <input v-model.number="row.harga" type="number" min="0" placeholder="0" class="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 bg-white" />
            </div>

            <button 
              v-if="form.dtMutasis.length > 1" 
              type="button" 
              @click="removeRow(idx)"
              class="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 mt-4 md:mt-0"
              title="Hapus Baris"
            >
              <i class="pi pi-trash"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-end gap-3">
        <router-link to="/dashboard/mutasi" class="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50">Batal</router-link>
        <button type="submit" :disabled="saving" class="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 disabled:opacity-50">
          {{ saving ? 'Menyimpan Perubahan...' : 'Simpan Perubahan' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '@/api/axios';
import { useToast } from 'primevue/usetoast';
import Select from 'primevue/select';

const router = useRouter();
const route = useRoute();
const toast = useToast();

const loading = ref(true);
const saving = ref(false);
const suppliers = ref([]);
const allBarangs = ref([]);
const allPemakais = ref([]);

const form = reactive({
  no_mutasi: '',
  jenis_mutasi: 'pembelian',
  tgl_mutasi: '',
  m_supplier_id: null,
  keterangan: '',
  dtMutasis: [],
});

const supplierOptions = computed(() =>
  suppliers.value.map(s => ({ label: s.namaSupplier, value: s.id }))
);

const barangOptions = computed(() =>
  allBarangs.value.map(b => {
    const snText = b.serialNumber ? `(S/N: ${b.serialNumber})` : '(Tanpa S/N)';
    const pemakaiText = b.pemakai?.nama ? ` - ${b.pemakai.nama}` : '';
    return {
      label: `${b.namaBarang} ${snText}${pemakaiText}`,
      value: b.id,
    };
  })
);

const pemakaiOptions = computed(() =>
  allPemakais.value.map(p => ({ label: p.nama, value: p.id }))
);

async function loadInitial() {
  loading.value = true;
  try {
    const [supRes, barRes, pemRes, mutRes] = await Promise.all([
      api.get('/suppliers/active'),
      api.get('/barangs?limit=1000'),
      api.get('/pemakais/all'),
      api.get(`/mutasis/${route.params.id}`),
    ]);
    suppliers.value = supRes.data.data;
    allBarangs.value = barRes.data.data;
    allPemakais.value = pemRes.data.data;

    const data = mutRes.data.data;
    form.no_mutasi = data.noMutasi;
    form.jenis_mutasi = data.jenisMutasi;
    form.tgl_mutasi = data.tglMutasi ? data.tglMutasi.split('T')[0] : '';
    form.m_supplier_id = data.mSupplierId;
    form.keterangan = data.keterangan || '';
    form.dtMutasis = (data.dtMutasis || []).map(d => ({
      m_barang_id: d.mBarangId,
      pemakai_lama: d.pemakaiLama || 0,
      pemakai_baru: d.pemakaiBaru || null,
      harga: d.harga ? Number(d.harga) : 0,
    }));

    if (form.dtMutasis.length === 0) {
      form.dtMutasis.push({ m_barang_id: null, pemakai_lama: 0, pemakai_baru: null, harga: 0 });
    }
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Gagal memuat data mutasi', life: 3000 });
    router.push({ name: 'mutasi.index' });
  } finally {
    loading.value = false;
  }
}

function addRow() {
  form.dtMutasis.push({ m_barang_id: null, pemakai_lama: 0, pemakai_baru: null, harga: 0 });
}

function removeRow(index) {
  form.dtMutasis.splice(index, 1);
}

function onBarangSelect(row) {
  const selected = allBarangs.value.find(b => b.id === row.m_barang_id);
  if (selected) {
    row.pemakai_lama = selected.mPemakaiId || 0;
  }
}

async function handleSubmit() {
  if (form.dtMutasis.some(d => !d.m_barang_id)) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: 'Semua baris barang harus dipilih', life: 3000 });
    return;
  }
  saving.value = true;
  try {
    await api.put(`/mutasis/${route.params.id}`, {
      m_supplier_id: form.m_supplier_id ? parseInt(form.m_supplier_id, 10) : null,
      tgl_mutasi: form.tgl_mutasi,
      keterangan: form.keterangan || null,
      dtMutasis: form.dtMutasis.map(d => ({
        m_barang_id: parseInt(d.m_barang_id, 10),
        pemakai_lama: parseInt(d.pemakai_lama, 10) || 0,
        pemakai_baru: d.pemakai_baru ? parseInt(d.pemakai_baru, 10) : null,
        harga: Number(d.harga || 0),
      })),
    });
    toast.add({ severity: 'success', summary: 'Sukses', detail: 'Data mutasi berhasil diperbarui', life: 3000 });
    router.push({ name: 'mutasi.index' });
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Gagal', detail: err.response?.data?.message || 'Gagal memperbarui mutasi', life: 4000 });
  } finally {
    saving.value = false;
  }
}

onMounted(loadInitial);
</script>
