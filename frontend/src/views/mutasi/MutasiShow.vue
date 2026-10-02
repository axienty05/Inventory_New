<template>
  <div class="space-y-6 max-w-5xl">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center gap-4">
        <router-link to="/dashboard/mutasi" class="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"><i class="pi pi-arrow-left text-base"></i></router-link>
        <div>
          <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Detail Mutasi Barang</h1>
          <p class="text-sm text-slate-500 mt-0.5">Nomor Transaksi: <span class="font-mono font-bold text-slate-800">{{ mutasi?.noMutasi }}</span></p>
        </div>
      </div>
      <div v-if="mutasi" class="flex items-center gap-2">
        <router-link :to="'/dashboard/mutasi/edit/' + mutasi.id" class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-sm font-bold transition-all border border-blue-200/60">
          <i class="pi pi-pencil"></i>
          <span>Edit Mutasi</span>
        </router-link>
      </div>
    </div>

    <div v-if="mutasi" class="space-y-6">
      <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p class="text-xs text-slate-400 font-bold uppercase">Jenis Mutasi</p>
            <span 
              class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold uppercase mt-1 tracking-wider"
              :class="{
                'bg-emerald-50 text-emerald-700 border border-emerald-200': mutasi.jenisMutasi === 'pembelian',
                'bg-blue-50 text-blue-700 border border-blue-200': mutasi.jenisMutasi === 'penjualan',
                'bg-purple-50 text-purple-700 border border-purple-200': mutasi.jenisMutasi === 'perpindahan',
              }"
            >
              {{ mutasi.jenisMutasi }}
            </span>
          </div>
          <div>
            <p class="text-xs text-slate-400 font-bold uppercase">Tanggal Mutasi</p>
            <p class="text-sm font-semibold text-slate-800 mt-1">{{ formatDate(mutasi.tglMutasi) }}</p>
          </div>
          <div v-if="mutasi.jenisMutasi !== 'perpindahan'">
            <p class="text-xs text-slate-400 font-bold uppercase">Supplier / Vendor</p>
            <p class="text-sm font-semibold text-slate-800 mt-1">{{ mutasi.supplier?.namaSupplier || '-' }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-400 font-bold uppercase">Keterangan</p>
            <p class="text-sm font-semibold text-slate-800 mt-1">{{ mutasi.keterangan || '-' }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 class="text-base font-bold text-slate-900">Barang yang Dimutasi ({{ mutasi.dtMutasis?.length || 0 }} Unit)</h2>
        </div>
        <DataTable :value="mutasi.dtMutasis" class="p-datatable-sm">
          <Column header="No." style="width: 60px">
            <template #body="{ index }">{{ index + 1 }}</template>
          </Column>
          <Column header="Nama Barang">
            <template #body="{ data }">
              <span class="font-semibold text-slate-800">{{ data.barang?.namaBarang || '-' }}</span>
            </template>
          </Column>
          <Column header="Kode Barang">
            <template #body="{ data }">
              <span class="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">{{ data.barang?.kodeBarang || '-' }}</span>
            </template>
          </Column>
          <Column header="Serial Number">
            <template #body="{ data }">
              <span class="text-xs text-slate-500 font-mono">{{ data.barang?.serialNumber || '-' }}</span>
            </template>
          </Column>
          <Column v-if="mutasi.jenisMutasi === 'perpindahan'" header="Pemakai Lama">
            <template #body="{ data }">
              <span class="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                {{ data.pemakaiLamaData?.nama || 'Tanpa Pemakai' }}
              </span>
            </template>
          </Column>
          <Column v-if="mutasi.jenisMutasi === 'perpindahan'" header="Pemakai Baru">
            <template #body="{ data }">
              <span class="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-md">
                {{ data.pemakaiBaruData?.nama || '-' }}
              </span>
            </template>
          </Column>
          <Column v-if="mutasi.jenisMutasi !== 'perpindahan'" header="Harga">
            <template #body="{ data }">
              <span class="font-bold text-emerald-700 text-sm">{{ formatRupiah(data.harga) }}</span>
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/api/axios';
import { formatDate, formatRupiah } from '@/utils/formatters';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

const route = useRoute();
const mutasi = ref(null);

async function fetchDetail() {
  try {
    const res = await api.get(`/mutasis/${route.params.id}`);
    mutasi.value = res.data.data;
  } catch (err) {
    console.error(err);
  }
}

onMounted(fetchDetail);
</script>
