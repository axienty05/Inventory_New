<template>
  <div class="space-y-6 max-w-3xl">
    <div>
      <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Pengaturan Akun</h1>
      <p class="text-sm text-slate-500 mt-0.5">Kelola informasi profil dan keamanan kata sandi</p>
    </div>

    <!-- User Information Card -->
    <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
      <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
        <i class="pi pi-user text-emerald-600"></i>
        <span>Informasi Pengguna</span>
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div>
          <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Username</label>
          <p class="text-sm font-semibold text-slate-800 bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200">{{ auth.user?.username || '-' }}</p>
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Role / Peran</label>
          <p class="text-sm font-semibold text-slate-800 bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200 capitalize">{{ (auth.user?.roles || ['User']).join(', ') }}</p>
        </div>
      </div>
    </div>

    <!-- Change Password Card -->
    <div class="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-4">
      <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
        <i class="pi pi-lock text-emerald-600"></i>
        <span>Ubah Kata Sandi</span>
      </h2>

      <form @submit.prevent="handleChangePassword" class="space-y-4 pt-2">
        <!-- Current Password -->
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Password Saat Ini</label>
          <div class="relative">
            <input 
              v-model="passForm.current_password" 
              :type="showCurrent ? 'text' : 'password'" 
              required 
              placeholder="Masukkan password lama Anda"
              class="w-full px-3.5 pr-11 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 shadow-sm" 
            />
            <button 
              type="button" 
              @click="showCurrent = !showCurrent" 
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 focus:outline-none"
              tabindex="-1"
            >
              <i :class="showCurrent ? 'pi pi-eye-slash' : 'pi pi-eye'" class="text-base"></i>
            </button>
          </div>
        </div>

        <!-- New Password -->
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Password Baru</label>
          <div class="relative">
            <input 
              v-model="passForm.password" 
              :type="showNew ? 'text' : 'password'" 
              required 
              placeholder="Minimal 6 karakter"
              class="w-full px-3.5 pr-11 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 shadow-sm" 
            />
            <button 
              type="button" 
              @click="showNew = !showNew" 
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 focus:outline-none"
              tabindex="-1"
            >
              <i :class="showNew ? 'pi pi-eye-slash' : 'pi pi-eye'" class="text-base"></i>
            </button>
          </div>
          <p class="text-[11px] text-slate-400 mt-1">Gunakan kombinasi huruf dan angka minimal 6 karakter</p>
        </div>

        <!-- Confirm New Password -->
        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Konfirmasi Password Baru</label>
          <div class="relative">
            <input 
              v-model="passForm.password_confirmation" 
              :type="showConfirm ? 'text' : 'password'" 
              required 
              placeholder="Ketik ulang password baru"
              class="w-full px-3.5 pr-11 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 shadow-sm" 
            />
            <button 
              type="button" 
              @click="showConfirm = !showConfirm" 
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 focus:outline-none"
              tabindex="-1"
            >
              <i :class="showConfirm ? 'pi pi-eye-slash' : 'pi pi-eye'" class="text-base"></i>
            </button>
          </div>
        </div>

        <!-- Error Alert -->
        <div v-if="errorMessage" class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
          <i class="pi pi-exclamation-circle text-rose-500"></i>
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Submit Button -->
        <div class="pt-2">
          <button 
            type="submit" 
            :disabled="savingPass" 
            class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            <i v-if="savingPass" class="pi pi-spin pi-spinner"></i>
            <span>{{ savingPass ? 'Menyimpan...' : 'Perbarui Kata Sandi' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import api from '@/api/axios';
import { useAuthStore } from '@/stores/auth.store';
import { useToast } from 'primevue/usetoast';

const auth = useAuthStore();
const toast = useToast();

const passForm = reactive({
  current_password: '',
  password: '',
  password_confirmation: '',
});

const showCurrent = ref(false);
const showNew = ref(false);
const showConfirm = ref(false);
const savingPass = ref(false);
const errorMessage = ref('');

async function handleChangePassword() {
  errorMessage.value = '';

  if (passForm.password.length < 6) {
    errorMessage.value = 'Password baru minimal harus 6 karakter';
    return;
  }

  if (passForm.password !== passForm.password_confirmation) {
    errorMessage.value = 'Konfirmasi password baru tidak cocok';
    return;
  }

  savingPass.value = true;
  try {
    const res = await api.put('/auth/password', passForm);
    toast.add({ 
      severity: 'success', 
      summary: 'Sukses', 
      detail: res.data?.message || 'Password berhasil diperbarui', 
      life: 3000 
    });
    passForm.current_password = '';
    passForm.password = '';
    passForm.password_confirmation = '';
    showCurrent.value = false;
    showNew.value = false;
    showConfirm.value = false;
  } catch (err) {
    const msg = err.response?.data?.errors?.[0]?.message || err.response?.data?.message || 'Gagal mengubah password';
    errorMessage.value = msg;
    toast.add({ severity: 'error', summary: 'Gagal', detail: msg, life: 4000 });
  } finally {
    savingPass.value = false;
  }
}
</script>
