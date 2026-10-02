<template>
  <div class="min-h-screen relative flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-x-hidden bg-[#e8efe9]">
    <!-- Blurred tropical leaves background image -->
    <div 
      class="fixed inset-0 bg-cover bg-center bg-no-repeat scale-105 pointer-events-none"
      style="background-image: url('/auth-bg.jpg'); filter: blur(4px);"
    ></div>

    <!-- Soft organic ambient light overlay -->
    <div class="fixed inset-0 bg-white/20 backdrop-blur-[2px] pointer-events-none"></div>

    <!-- Main View Slot -->
    <div class="relative z-10 w-full flex items-center justify-center my-auto">
      <router-view />
    </div>
  </div>
</template>

<script setup>
</script>
