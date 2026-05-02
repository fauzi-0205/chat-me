<template>
  <!-- h-screen dan overflow-hidden mengunci layar agar tidak bisa di-scroll global -->
  <div class="h-screen w-full bg-slate-100 flex overflow-hidden font-sans text-slate-900">
    <slot />
  </div>
</template>