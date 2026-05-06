<script setup>
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'auth' })

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const authStore = useAuthStore()

const handleLogin = async () => {
  await authStore.login(email.value, password.value)
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center p-4 lg:p-8">
    <div class="w-full max-w-6xl mx-auto">
      <!-- Desktop: Split | Mobile: Single -->
      <div class="flex flex-col lg:flex-row bg-white rounded-3xl shadow-2xl shadow-indigo-500/10 overflow-hidden border border-slate-100">
        
        <!-- LEFT PANEL (Desktop Only) - Premium Branding -->
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
              Selamat datang<br>di ChatMe.
            </h1>
            <p class="text-2xl text-slate-300 max-w-xs leading-tight">
              Komunikasi tim yang cepat, fokus, dan produktif.
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

        <!-- RIGHT PANEL - Form -->
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

            <h2 class="text-4xl font-semibold tracking-tight text-slate-900 mb-2">Masuk ke akun Anda</h2>
            <p class="text-slate-600 mb-10">
              Belum punya akun? 
              <NuxtLink to="/register" class="font-semibold text-indigo-600 hover:text-indigo-700">Daftar gratis sekarang</NuxtLink>
            </p>

            <!-- Error -->
            <div v-if="authStore.errorMsg" class="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex gap-x-3 text-sm">
              <span>{{ authStore.errorMsg }}</span>
            </div>

            <form @submit.prevent="handleLogin" class="space-y-7">
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
                <div class="flex justify-between mb-2">
                  <label class="block text-sm font-semibold text-slate-700">Kata Sandi</label>
                  <a href="#" class="text-sm text-indigo-600 hover:text-indigo-700 font-medium">Lupa sandi?</a>
                </div>
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
                    class="w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-3xl text-base focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all"
                    placeholder="••••••••"
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

              <!-- Remember -->
              <div class="flex items-center">
                <input type="checkbox" id="remember" class="w-5 h-5 text-indigo-600 border-slate-300 rounded-xl focus:ring-indigo-500" />
                <label for="remember" class="ml-3 text-sm text-slate-600 cursor-pointer">Ingat saya di perangkat ini</label>
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
                <span v-else>Masuk ke ChatMe</span>
              </button>
            </form>

            <!-- Divider -->
            <div class="my-10 flex items-center">
              <div class="flex-1 h-px bg-slate-200"></div>
              <span class="px-6 text-xs font-medium text-slate-400 tracking-widest">ATAU</span>
              <div class="flex-1 h-px bg-slate-200"></div>
            </div>

            <!-- Google -->
            <button class="w-full flex items-center justify-center gap-x-3 py-4 border border-slate-200 hover:bg-slate-50 rounded-3xl font-semibold text-slate-700 transition-all">
              <svg class="w-6 h-6" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Lanjutkan dengan Google
            </button>

            <p class="text-center text-xs text-slate-400 mt-10">
              Dengan melanjutkan, Anda menyetujui<br>
              <a href="#" class="underline hover:text-slate-600">Ketentuan Layanan</a> &amp; 
              <a href="#" class="underline hover:text-slate-600">Kebijakan Privasi</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>