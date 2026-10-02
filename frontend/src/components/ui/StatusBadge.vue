<template>
  <span 
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize"
    :class="statusClass"
  >
    {{ formattedStatus }}
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  status: [String, Boolean],
});

const formattedStatus = computed(() => {
  if (typeof props.status === 'boolean') {
    return props.status ? 'Aktif' : 'Tidak Aktif';
  }
  return (props.status || '-').replace(/_/g, ' ');
});

const statusClass = computed(() => {
  if (typeof props.status === 'boolean') {
    return props.status
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : 'bg-slate-100 text-slate-600 border-slate-200';
  }
  switch (props.status) {
    case 'aktif':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'tidak_aktif':
      return 'bg-slate-100 text-slate-600 border-slate-200';
    case 'sedang_service':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'rusak':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'dijual':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
});
</script>
