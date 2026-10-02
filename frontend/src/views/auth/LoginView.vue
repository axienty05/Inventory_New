<template>
  <div class="w-full max-w-[920px] bg-[#fbfdfc] rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(20,40,30,0.18)] border border-white/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-all duration-300">
    
    <!-- Mobile Header Banner (Visible only on mobile/tablet) -->
    <div class="lg:hidden relative h-44 w-full overflow-hidden bg-[#1f382b]">
      <img 
        src="/auth-art.jpg" 
        alt="Botanical Art" 
        class="w-full h-full object-cover object-center scale-105"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-[#fbfdfc] via-[#fbfdfc]/10 to-transparent"></div>
    </div>

    <!-- Form Column (Left side on desktop) -->
    <div class="lg:col-span-7 px-8 sm:px-14 py-12 sm:py-16 flex flex-col justify-center bg-[#fbfdfc]">
      
      <!-- Title -->
      <div class="text-center mb-8">
        <h1 class="text-2xl sm:text-3xl font-semibold text-slate-800 tracking-tight">Log in</h1>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="space-y-4 max-w-sm mx-auto w-full">
        
        <!-- Field: Username -->
        <div>
          <label class="block text-[12px] italic text-slate-500 font-normal mb-1.5 ml-3">
            Username
          </label>
          <div class="relative">
            <input 
              v-model="form.username" 
              type="text" 
              required 
              placeholder=""
              autocomplete="username"
              class="w-full px-5 py-2.5 sm:py-3 rounded-full border border-slate-300/90 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#354c41]/30 focus:border-[#354c41] transition-all bg-white/90"
            />
          </div>
        </div>

        <!-- Field: Password -->
        <div>
          <label class="block text-[12px] italic text-slate-500 font-normal mb-1.5 ml-3">
            Password
          </label>
          <div class="relative">
            <input 
              v-model="form.password" 
              :type="showPassword ? 'text' : 'password'" 
              required 
              placeholder=""
              autocomplete="current-password"
              class="w-full px-5 pr-12 py-2.5 sm:py-3 rounded-full border border-slate-300/90 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#354c41]/30 focus:border-[#354c41] transition-all bg-white/90"
            />
            <button 
              type="button" 
              @click="showPassword = !showPassword" 
              class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 focus:outline-none"
              tabindex="-1"
            >
              <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'" class="text-sm"></i>
            </button>
          </div>
        </div>

        <!-- Error Message Notification -->
        <div v-if="errorMessage" class="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2 my-2">
          <i class="pi pi-exclamation-circle text-rose-500 flex-shrink-0"></i>
          <span>{{ errorMessage }}</span>
        </div>

        <!-- Submit Button -->
        <div class="pt-2">
          <button 
            type="submit" 
            :disabled="auth.isLoading"
            class="w-full py-3 px-6 rounded-full bg-[#354c41] hover:bg-[#283d33] text-white font-medium text-sm tracking-wide shadow-md shadow-[#354c41]/20 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer active:scale-[0.99]"
          >
            <i v-if="auth.isLoading" class="pi pi-spin pi-spinner text-sm"></i>
            <span>{{ auth.isLoading ? 'Processing...' : 'Log in' }}</span>
          </button>
        </div>

        <!-- Footer Links -->
        <div class="text-center pt-6 space-y-3">
          <button 
            type="button" 
            @click="handleForgotNotice" 
            class="text-[11px] text-slate-400 hover:text-slate-600 transition-colors block mx-auto cursor-pointer"
          >
            forgot login or password?
          </button>
          
          <div class="pt-3 border-t border-slate-200/60 flex items-center justify-center gap-1.5 text-xs text-slate-500">
            <span>Belum punya akun?</span>
            <router-link to="/register" class="font-semibold text-[#354c41] hover:underline">
              Daftar Akun
            </router-link>
          </div>
        </div>

      </form>
    </div>

    <!-- Art Column (Right side on desktop) -->
    <div class="lg:col-span-5 relative hidden lg:block overflow-hidden bg-[#1f382b]">
      <img 
        src="/auth-art.jpg" 
        alt="Paper Cut Tropical Foliage Artwork" 
        class="w-full h-full object-cover object-left scale-105"
      />
    </div>

  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import { useToast } from 'primevue/usetoast';

const auth = useAuthStore();
const router = useRouter();
const toast = useToast();

const form = reactive({ username: '', password: '' });
const showPassword = ref(false);
const errorMessage = ref('');

async function handleLogin() {
  errorMessage.value = '';
  try {
    await auth.login(form.username, form.password);
    toast.add({ severity: 'success', summary: 'Berhasil', detail: 'Login berhasil!', life: 3000 });
    router.push({ name: 'dashboard' });
  } catch (err) {
    errorMessage.value = err.response?.data?.message || 'Login gagal. Periksa username dan password.';
  }
}

function handleForgotNotice() {
  toast.add({
    severity: 'info',
    summary: 'Informasi Akun',
    detail: 'Silakan hubungi administrator sistem IT untuk reset login/password akun Anda.',
    life: 5000,
  });
}
</script>
