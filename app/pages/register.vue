<script setup>
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'auth' })

const name = ref('')
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const authStore = useAuthStore()

const handleRegister = async () => {
  await authStore.register(name.value, email.value, password.value)
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center p-4 lg:p-8">
    <div class="w-full max-w-6xl mx-auto">
      <!-- Desktop: Split | Mobile: Single -->
      <div class="flex flex-col lg:flex-row bg-white rounded-3xl shadow-2xl shadow-indigo-500/10 overflow-hidden border border-slate-100">
        
        <!-- LEFT PANEL (Desktop Only) - Sama persis dengan Login -->
        <div class="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 p-12 flex-col justify-between relative overflow-hidden">
          
          <!-- Decorative Orbs -->
          <div class="absolute top-10 right-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"></div>
          <div class="absolute bottom-10 left-10 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl"></div>
          
          <div class="relative z-10">
            <!-- Logo -->
            <div class="flex items-center gap-x-3 mb-16">
              <div class="w-11 h-11 bg-white rounded-3xl flex items-center justify-center shadow-xl shadow-indigo-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.75">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <span class="font-bold text-4xl tracking-[-2px] text-white">ChatMe</span>
            </div>

            <h1 class="text-6xl font-semibold tracking-[-3px] leading-none text-white mb-6">
              Bergabung dengan<br>ChatMe sekarang.
            </h1>
            <p class="text-2xl text-slate-300 max-w-xs leading-tight">
              Kolaborasi tim yang cepat, fokus, dan produktif.
            </p>
          </div>

          <!-- Trust -->
          <div class="relative z-10 flex items-center gap-x-4 text-slate-400">
            <div class="flex -space-x-3">
              <img src="https://i.pravatar.cc/32?img=28" class="w-8 h-8 rounded-2xl ring-4 ring-slate-900" alt="">
              <img src="https://i.pravatar.cc/32?img=47" class="w-8 h-8 rounded-2xl ring-4 ring-slate-900" alt="">
              <img src="https://i.pravatar.cc/32?img=32" class="w-8 h-8 rounded-2xl ring-4 ring-slate-900" alt="">
            </div>
            <div>
              <p class="text-sm font-medium">Dipercaya oleh 12.840+ tim profesional</p>
            </div>
          </div>
        </div>

        <!-- RIGHT PANEL - Register Form -->
        <div class="w-full lg:w-7/12 p-8 lg:p-16 flex flex-col justify-center">
          <div class="max-w-md mx-auto w-full">
            
            <!-- Mobile Logo -->
            <div class="lg:hidden flex items-center gap-x-3 mb-12">
              <div class="w-10 h-10 bg-indigo-600 rounded-3xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <span class="font-bold text-3xl tracking-[-1.5px] text-slate-900">ChatMe</span>
            </div>

            <h2 class="text-4xl font-semibold tracking-tight text-slate-900 mb-2">Buat akun baru</h2>
            <p class="text-slate-600 mb-10">
              Sudah punya akun? 
              <NuxtLink to="/login" class="font-semibold text-indigo-600 hover:text-indigo-700">Masuk di sini</NuxtLink>
            </p>

            <!-- Error -->
            <div v-if="authStore.errorMsg" class="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex gap-x-3 text-sm">
              <span>{{ authStore.errorMsg }}</span>
            </div>

            <form @submit.prevent="handleRegister" class="space-y-7">
              
              <!-- Nama Lengkap -->
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Nama Lengkap</label>
                <div class="relative">
                  <div class="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7" />
                    </svg>
                  </div>
                  <input 
                    v-model="name"
                    type="text" 
                    required
                    class="w-full pl-12 pr-5 py-4 bg-white border border-slate-200 rounded-3xl text-base focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <!-- Email -->
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                <div class="relative">
                  <div class="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2.01 2.01 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2" />
                    </svg>
                  </div>
                  <input 
                    v-model="email"
                    type="email" 
                    required
                    class="w-full pl-12 pr-5 py-4 bg-white border border-slate-200 rounded-3xl text-base focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                    placeholder="nama@perusahaan.com"
                  />
                </div>
              </div>

              <!-- Password -->
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Kata Sandi</label>
                <div class="relative">
                  <div class="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5 16.477 5 20.268 7.943 21.542 12 20.268 16.057 16.477 19 12 19 7.523 19 3.732 16.057 2.458 12z" />
                    </svg>
                  </div>
                  <input 
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    required
                    minlength="6"
                    class="w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-3xl text-base focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                    placeholder="Minimal 6 karakter"
                  />
                  <button type="button" @click="showPassword = !showPassword" class="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908l3.42 3.42m-3.42-3.42l3.42-3.42" />
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5 16.477 5 20.268 7.943 21.542 12 20.268 16.057 16.477 19 12 19 7.523 19 3.732 16.057 2.458 12z" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Submit -->
              <button 
                type="submit"
                :disabled="authStore.isLoading"
                class="w-full py-4 mt-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold text-lg rounded-3xl shadow-lg shadow-indigo-500/30 active:scale-[0.985] transition-all disabled:opacity-70 flex items-center justify-center gap-x-3"
              >
                <span v-if="authStore.isLoading" class="flex items-center gap-x-2">
                  <svg class="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Memproses...
                </span>
                <span v-else>Daftar ke ChatMe</span>
              </button>
            </form>

            <p class="text-center text-xs text-slate-400 mt-10">
              Dengan mendaftar, Anda menyetujui<br>
              <a href="#" class="underline hover:text-slate-600">Ketentuan Layanan</a> &amp; 
              <a href="#" class="underline hover:text-slate-600">Kebijakan Privasi</a> ChatMe.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>