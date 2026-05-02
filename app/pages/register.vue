<script setup>
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'auth'
})

const name = ref('')
const email = ref('')
const password = ref('')
const authStore = useAuthStore()

const handleRegister = async () => {
  await authStore.register(name.value, email.value, password.value)
}
</script>

<template>
  <div class="min-h-screen flex">
    
    <!-- Bagian Kiri (Branding) -->
    <div class="hidden lg:flex lg:w-1/2 bg-slate-900 flex-col justify-center px-12 xl:px-24 relative overflow-hidden">
      <div class="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-600 opacity-20 blur-3xl"></div>
      <div class="absolute bottom-10 right-10 w-72 h-72 rounded-full bg-indigo-600 opacity-20 blur-3xl"></div>
      
      <div class="relative z-10">
        <div class="flex items-center gap-3 font-bold text-3xl tracking-tight text-white mb-10">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          WorkspaceChat
        </div>
        
        <h1 class="text-4xl xl:text-5xl font-extrabold text-white mb-6 leading-tight tracking-tight">
          Mulai kolaborasi <br/> dengan tim Anda <br/> 
          <span class="text-blue-400">hari ini.</span>
        </h1>
        <p class="text-lg text-slate-400 max-w-md leading-relaxed">
          Buat akun gratis dan nikmati komunikasi yang efisien, aman, dan terpusat.
        </p>
      </div>
    </div>

    <!-- Bagian Kanan (Form Register) -->
    <div class="flex flex-col justify-center w-full lg:w-1/2 px-6 sm:px-12 lg:px-24 bg-white">
      <div class="w-full max-w-md mx-auto">
        
        <div class="mb-10">
          <div class="lg:hidden flex items-center gap-2 font-bold text-2xl tracking-tight text-slate-900 mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            WorkspaceChat
          </div>
          
          <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">Buat Akun</h2>
          <p class="mt-2 text-sm text-slate-600">
            Sudah punya akun? 
            <NuxtLink to="/login" class="font-medium text-blue-600 hover:text-blue-700 transition-colors">Masuk di sini</NuxtLink>
          </p>
        </div>

        <form class="space-y-5" @submit.prevent="handleRegister">
          
          <div v-if="authStore.errorMsg" class="p-3 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
            {{ authStore.errorMsg }}
          </div>

          <!-- Input Nama -->
          <div>
            <label for="name" class="block text-sm font-semibold text-slate-700 mb-1.5">Nama Lengkap</label>
            <input id="name" type="text" required v-model="name"
              class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all"
              placeholder="John Doe" />
          </div>

          <!-- Input Email -->
          <div>
            <label for="email" class="block text-sm font-semibold text-slate-700 mb-1.5">Email pekerjaan</label>
            <input id="email" type="email" required v-model="email"
              class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all"
              placeholder="nama@perusahaan.com" />
          </div>

          <!-- Input Password -->
          <div>
            <label for="password" class="block text-sm font-semibold text-slate-700 mb-1.5">Kata Sandi</label>
            <input id="password" type="password" required v-model="password" minlength="6"
              class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all"
              placeholder="Minimal 6 karakter" />
          </div>

          <button type="submit" :disabled="authStore.isLoading"
            class="w-full mt-4 py-3 px-4 flex justify-center items-center rounded-lg shadow-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed">
            <span v-if="authStore.isLoading">Memproses...</span>
            <span v-else>Daftar Sekarang</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>