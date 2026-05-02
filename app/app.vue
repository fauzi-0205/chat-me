<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
/* Animasi untuk perpindahan Halaman dan Layout */
.page-enter-active,
.page-leave-active,
.layout-enter-active,
.layout-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Kondisi awal saat halaman baru mau masuk, dan kondisi akhir saat halaman lama pergi */
.page-enter-from,
.page-leave-to,
.layout-enter-from,
.layout-leave-to {
  opacity: 0;
  transform: translateY(10px); /* Efek bergeser dari bawah sedikit */
}
</style>