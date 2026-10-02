<template>
  <header class="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-6">
    <div class="flex items-center gap-4">
      <button 
        @click="$emit('toggle-sidebar')"
        class="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
      >
        <i class="pi pi-bars text-lg"></i>
      </button>
      <div class="hidden sm:block">
        <p class="text-xs text-slate-400 font-medium leading-none">Sistem Manajemen Inventory</p>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <!-- Date Range Display -->
      <div class="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-600">
        <i class="pi pi-calendar text-slate-400 text-sm"></i>
        <span>{{ formattedDate }}</span>
        <i class="pi pi-chevron-down text-slate-400 text-xs"></i>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue';

defineEmits(['toggle-sidebar']);

const formattedDate = computed(() => {
  const now = new Date();
  const opts = { day: 'numeric', month: 'short', year: 'numeric' };
  return now.toLocaleDateString('id-ID', opts);
});
</script>
