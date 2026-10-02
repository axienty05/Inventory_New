<template>
  <div class="min-h-screen bg-slate-100 flex">
    <Sidebar :is-open="sidebarOpen" @toggle-sidebar="sidebarOpen = !sidebarOpen" />
    
    <div class="flex-1 flex flex-col lg:pl-64 min-w-0">
      <Navbar @toggle-sidebar="sidebarOpen = !sidebarOpen" />
      <main class="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Sidebar from './Sidebar.vue';
import Navbar from './Navbar.vue';

const sidebarOpen = ref(false);
</script>
