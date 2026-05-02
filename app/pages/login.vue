<script setup>
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'auth' })

const email = ref('')
const password = ref('')
const authStore = useAuthStore()

const handleLogin = async () => {
  await authStore.login(email.value, password.value)
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4 lg:p-8">
    <div class="w-full max-w-5xl mx-auto">
      <!-- Desktop: Split Layout | Mobile: Single Column -->
      <div class="flex flex-col lg:flex-row bg-white rounded-3xl shadow-xl shadow-slate-200/70 overflow-hidden border border-slate-100">
        
        <!-- ==================== LEFT PANEL (Desktop Only) ==================== -->
        <div class="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 p-12 flex-col justify-between relative overflow-hidden">
          <!-- Decorative Elements -->
          <div class="absolute top-0 right-0 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl -translate-y-1/4 translate-x-1/4"></div>
          <div class="absolute bottom-0 left-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4"></div>

          <div class="relative z-10">
            <!-- Logo -->
            <div class="flex items-center gap-x-3 mb-16">
              <div class="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5.5 h-5.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.75">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <span class="font-semibold text-3xl tracking-[-1.5px] text-white">ChatMe</span>
            </div>

            <div class="max-w-[340px]">
              <h1 class="text-5xl font-semibold tracking-tighter text-white leading-none mb-6">
                Selamat datang<br>di ChatMe.
              </h1>
              <p class="text-xl text-slate-300 leading-relaxed">
                Platform komunikasi tim yang dibuat untuk fokus dan produktivitas.
              </p>
            </div>
          </div>

          <!-- Bottom Trust -->
          <div class="relative z-10 flex items-center gap-x-3 text-sm text-slate-400">
            <div class="flex -space-x-2">
              <img src="https://i.pravatar.cc/28?img=28" class="w-7 h-7 rounded-full ring-2 ring-slate-800" />
              <img src="https://i.pravatar.cc/28?img=47" class="w-7 h-7 rounded-full ring-2 ring-slate-800" />
              <img src="https://i.pravatar.cc/28?img=32" class="w-7 h-7 rounded-full ring-2 ring-slate-800" />
            </div>
            <span>Dipercaya 12.840+ tim</span>
          </div>
        </div>

        <!-- ==================== RIGHT PANEL (Form) ==================== -->
        <div class="w-full lg:w-7/12 p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
          <div class="max-w-md mx-auto w-full">
            
            <!-- Mobile Header -->
            <div class="lg:hidden flex items-center gap-x-3 mb-10">
              <div class="w-9 h-9 bg-indigo-600 rounded-2xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.75">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <span class="font-semibold text-2xl tracking-tight text-slate-900">ChatMe</span>
            </div>

            <!-- Form Header -->
            <div class="mb-9">
              <h2 class="text-3xl font-semibold tracking-tight text-slate-900">Masuk ke akun Anda</h2>
              <p class="mt-2 text-slate-600">
                Belum punya akun? 
                <NuxtLink to="/register" class="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">Daftar gratis</NuxtLink>
              </p>
            </div>

            <!-- Error Alert -->
            <div v-if="authStore.errorMsg" class="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 text-sm rounded-2xl flex items-start gap-x-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mt-px flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 4.01V8" />
              </svg>
              <span>{{ authStore.errorMsg }}</span>
            </div>

            <!-- Form -->
            <form @submit.prevent="handleLogin" class="space-y-5">
              
              <!-- Email -->
              <div>
                <label class="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                <input 
                  v-model="email"
                  type="email" 
                  required
                  class="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300 transition-all"
                  placeholder="nama@perusahaan.com"
                />
              </div>

              <!-- Password -->
              <div>
                <div class="flex justify-between mb-2">
                  <label class="block text-sm font-semibold text-slate-700">Kata Sandi</label>
                  <a href="#" class="text-sm font-medium text-indigo-600 hover:text-indigo-700">Lupa sandi?</a>
                </div>
                <input 
                  v-model="password"
                  type="password" 
                  required
                  class="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300 transition-all"
                  placeholder="••••••••"
                />
              </div>

              <!-- Remember Me -->
              <div class="flex items-center pt-1">
                <input type="checkbox" id="remember" class="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer" />
                <label for="remember" class="ml-2.5 text-sm text-slate-600 cursor-pointer select-none">Ingat saya di perangkat ini</label>
              </div>

              <!-- Submit -->
              <button 
                type="submit" 
                :disabled="authStore.isLoading"
                class="w-full py-[17px] mt-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-2xl flex items-center justify-center gap-x-2 text-base transition-all disabled:bg-indigo-400 disabled:cursor-not-allowed shadow-sm active:scale-[0.985]"
              >
                <span v-if="authStore.isLoading" class="flex items-center gap-x-2">
                  <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Memproses...
                </span>
                <span v-else>Masuk ke ChatMe</span>
              </button>
            </form>

            <!-- Divider -->
            <div class="my-8 flex items-center gap-x-4">
              <div class="flex-1 h-px bg-slate-200"></div>
              <span class="text-xs font-medium text-slate-400 tracking-wider">ATAU</span>
              <div class="flex-1 h-px bg-slate-200"></div>
            </div>

            <!-- Google Button -->
            <button 
              type="button"
              class="w-full flex items-center justify-center gap-x-3 py-3.5 px-5 border border-slate-200 hover:bg-slate-50 active:bg-slate-100 rounded-2xl text-sm font-semibold text-slate-700 transition-all"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Lanjutkan dengan Google
            </button>

            <p class="text-center text-[11px] text-slate-400 mt-8 leading-relaxed">
              Dengan melanjutkan, Anda menyetujui<br>
              <a href="#" class="underline hover:text-slate-600">Ketentuan Layanan</a> dan <a href="#" class="underline hover:text-slate-600">Kebijakan Privasi</a> ChatMe.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>