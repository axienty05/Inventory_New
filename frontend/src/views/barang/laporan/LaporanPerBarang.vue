<template>
  <div class="space-y-6 max-w-5xl">
    <div class="flex items-center gap-4">
      <router-link to="/dashboard/laporanbarang" class="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"><i class="pi pi-arrow-left text-base"></i></router-link>
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Histori Detail Per-Barang</h1>
        <p class="text-sm text-slate-500 mt-0.5">{{ barang?.namaBarang }} (<span class="font-mono font-bold">{{ barang?.kodeBarang }}</span>)</p>
      </div>
    </div>

    <div v-if="barang" class="space-y-6">
      <!-- Info Header Card -->
      <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p class="text-xs font-bold text-slate-400 uppercase">Pemakai Saat Ini</p>
            <p class="text-sm font-semibold text-slate-800 mt-1">{{ barang.pemakai?.nama || '-' }}</p>
          </div>
          <div>
            <p class="text-xs font-bold text-slate-400 uppercase">Serial Number</p>
            <p class="text-sm font-semibold text-slate-800 mt-1 font-mono">{{ barang.serialNumber || '-' }}</p>
          </div>
          <div>
            <p class="text-xs font-bold text-slate-400 uppercase">Kategori</p>
            <p class="text-sm font-semibold text-slate-800 mt-1 capitalize">{{ barang.kategori }}</p>
          </div>
          <div>
            <p class="text-xs font-bold text-slate-400 uppercase">Status</p>
            <div class="mt-1"><StatusBadge :status="barang.status" /></div>
          </div>
        </div>
      </div>

      <!-- Riwayat Pembelian / Pengadaan -->
      <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
          <i class="pi pi-shopping-cart text-emerald-600"></i>
          <span>Riwayat Pembelian / Pengadaan</span>
        </h3>
        <div v-if="pembelians.length" class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="border-b border-slate-200 text-xs uppercase font-bold text-slate-400">
                <th class="pb-3">No. Mutasi</th>
                <th class="pb-3">Tanggal Pembelian</th>
                <th class="pb-3">Supplier / Vendor</th>
                <th class="pb-3 text-right">Harga Beli</th>
                <th class="pb-3">Keterangan</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="p in pembelians" :key="p.id">
                <td class="py-3 font-mono font-bold text-xs text-slate-800">
                  <router-link :to="'/dashboard/mutasi/show/' + p.mtMutasiId" class="text-emerald-600 hover:underline">
                    {{ p.mtMutasi?.noMutasi }}
                  </router-link>
                </td>
                <td class="py-3 font-medium">{{ formatDate(p.mtMutasi?.tglMutasi) }}</td>
                <td class="py-3">{{ p.mtMutasi?.supplier?.namaSupplier || '-' }}</td>
                <td class="py-3 text-right font-bold text-slate-900">{{ formatRupiah(p.harga) }}</td>
                <td class="py-3 text-slate-500">{{ p.mtMutasi?.keterangan || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="text-sm text-slate-400 italic">Belum ada riwayat mutasi pembelian</p>
      </div>

      <!-- Riwayat Perpindahan Pemakai -->
      <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
          <i class="pi pi-arrows-alt text-blue-600"></i>
          <span>Riwayat Perpindahan Pemakai</span>
        </h3>
        <div v-if="perpindahans.length" class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="border-b border-slate-200 text-xs uppercase font-bold text-slate-400">
                <th class="pb-3">No. Mutasi</th>
                <th class="pb-3">Tanggal Perpindahan</th>
                <th class="pb-3">Pemakai Lama</th>
                <th class="pb-3">Pemakai Baru</th>
                <th class="pb-3">Keterangan</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="p in perpindahans" :key="p.id">
                <td class="py-3 font-mono font-bold text-xs text-slate-800">
                  <router-link :to="'/dashboard/mutasi/show/' + p.mtMutasiId" class="text-blue-600 hover:underline">
                    {{ p.mtMutasi?.noMutasi }}
                  </router-link>
                </td>
                <td class="py-3 font-medium">{{ formatDate(p.mtMutasi?.tglMutasi) }}</td>
                <td class="py-3">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                    <i class="pi pi-user text-[11px] text-slate-400"></i>
                    {{ p.pemakaiLamaData?.nama || 'Tanpa Pemakai' }}
                  </span>
                </td>
                <td class="py-3">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                    <i class="pi pi-user-plus text-[11px] text-emerald-600"></i>
                    {{ p.pemakaiBaruData?.nama || '-' }}
                  </span>
                </td>
                <td class="py-3 text-slate-500">{{ p.mtMutasi?.keterangan || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="text-sm text-slate-400 italic">Belum ada riwayat perpindahan pemakai</p>
      </div>

      <!-- Riwayat Service Eksternal -->
      <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
          <i class="pi pi-wrench text-amber-600"></i>
          <span>Riwayat Service Eksternal</span>
        </h3>
        <div v-if="barang.services?.length" class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="border-b border-slate-200 text-xs uppercase font-bold text-slate-400">
                <th class="pb-3">Tanggal Mulai</th>
                <th class="pb-3">No. SJ</th>
                <th class="pb-3">Service Center</th>
                <th class="pb-3">Kerusakan</th>
                <th class="pb-3">Selesai</th>
                <th class="pb-3 text-right">Biaya</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="s in barang.services" :key="s.id">
                <td class="py-3 font-medium">{{ formatDate(s.tglService) }}</td>
                <td class="py-3 font-mono text-xs">{{ s.noSj || '-' }}</td>
                <td class="py-3">{{ s.serviceCenter?.namaService || '-' }}</td>
                <td class="py-3">{{ s.kerusakan }}</td>
                <td class="py-3">{{ s.tglSelesai ? formatDate(s.tglSelesai) : 'Sedang Proses' }}</td>
                <td class="py-3 text-right font-bold text-slate-900">{{ formatRupiah(s.biaya) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="text-sm text-slate-400 italic">Belum ada riwayat service eksternal</p>
      </div>

      <!-- Riwayat Service Internal -->
      <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
          <i class="pi pi-cog text-purple-600"></i>
          <span>Riwayat Service Internal</span>
        </h3>
        <div v-if="barang.serviceInternals?.length" class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="border-b border-slate-200 text-xs uppercase font-bold text-slate-400">
                <th class="pb-3">Tanggal Mulai</th>
                <th class="pb-3">Deskripsi Kerusakan</th>
                <th class="pb-3">Selesai</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="si in barang.serviceInternals" :key="si.id">
                <td class="py-3 font-medium">{{ formatDate(si.tglService) }}</td>
                <td class="py-3">{{ si.kerusakan }}</td>
                <td class="py-3">{{ si.tglSelesai ? formatDate(si.tglSelesai) : 'Sedang Proses' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="text-sm text-slate-400 italic">Belum ada riwayat service internal</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/api/axios';
import { formatDate, formatRupiah } from '@/utils/formatters';
import StatusBadge from '@/components/ui/StatusBadge.vue';

const route = useRoute();
const barang = ref(null);

const pembelians = computed(() => {
  if (!barang.value?.dtMutasis) return [];
  return barang.value.dtMutasis.filter(d => d.mtMutasi?.jenisMutasi === 'pembelian');
});

const perpindahans = computed(() => {
  if (!barang.value?.dtMutasis) return [];
  return barang.value.dtMutasis.filter(d => d.mtMutasi?.jenisMutasi === 'perpindahan');
});

onMounted(async () => {
  try {
    const res = await api.get('/barangs/' + route.params.id);
    barang.value = res.data.data;
  } catch (err) {
    console.error(err);
  }
});
</script>
