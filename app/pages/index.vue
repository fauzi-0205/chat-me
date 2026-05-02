<template>
  <div class="bg-white font-sans overflow-hidden">
    <!-- ==================== NAVBAR ==================== -->
    <nav class="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-slate-100">
      <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <!-- Logo -->
        <div class="flex items-center gap-x-3">
          <div class="w-9 h-9 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <span class="font-semibold text-2xl tracking-tighter text-slate-900">ChatMe</span>
            <span class="text-[10px] font-mono text-indigo-600 tracking-[3px] block -mt-1">TEAM CHAT</span>
          </div>
        </div>

        <!-- Desktop Nav -->
        <div class="hidden md:flex items-center gap-x-9 text-sm font-medium text-slate-600">
          <a href="#features" class="hover:text-slate-900 transition-colors">Fitur</a>
          <a href="#how" class="hover:text-slate-900 transition-colors">Cara Kerja</a>
          <a href="#" class="hover:text-slate-900 transition-colors">Solusi</a>
        </div>

        <!-- Right Side -->
        <div class="flex items-center gap-x-4">
          <NuxtLink 
            to="/login" 
            class="hidden md:block px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-all active:scale-[0.985]">
            Masuk
          </NuxtLink>
          
          <NuxtLink 
            to="/register" 
            class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-2xl flex items-center gap-x-2 transition-all active:scale-[0.985] shadow-sm">
            Mulai Gratis
          </NuxtLink>

          <button class="md:hidden w-10 h-10 flex items-center justify-center text-slate-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </nav>

    <!-- ==================== HERO ==================== -->
    <section class="pt-20 pb-16 lg:pt-24 lg:pb-24 bg-white">
      <div class="max-w-7xl mx-auto px-6">
        <div class="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          <!-- Left Content -->
          <div class="lg:col-span-7 max-w-2xl scroll-animate fade-up">
            <div class="inline-flex items-center gap-x-2 px-4 py-1.5 rounded-3xl bg-indigo-50 text-indigo-700 text-xs font-semibold tracking-wider mb-6">
              <div class="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse"></div>
              BARU: Mode Kolaborasi Tim 3.0
            </div>

            <h1 class="text-5xl lg:text-7xl font-semibold tracking-tighter text-slate-900 leading-none mb-6">
              Komunikasi tim<br>yang <span class="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">benar-benar</span><br>terpusat.
            </h1>

            <p class="text-xl lg:text-2xl text-slate-600 leading-snug max-w-lg mb-10">
              Platform pesan instan modern untuk tim yang serius. 
              Tanpa notifikasi berlebih. Fokus penuh. Sinkron sempurna di desktop & mobile.
            </p>

            <div class="flex flex-col sm:flex-row gap-4">
              <NuxtLink 
                to="/register" 
                class="group flex items-center justify-center gap-x-3 px-9 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-3xl text-lg transition-all active:scale-[0.985] shadow-xl shadow-indigo-600/30">
                Mulai Gratis Sekarang
                <span class="group-hover:translate-x-0.5 transition">→</span>
              </NuxtLink>
              
              <a 
                href="#demo" 
                class="flex items-center justify-center gap-x-3 px-8 py-4 border border-slate-200 hover:bg-slate-50 font-semibold text-slate-700 rounded-3xl text-lg transition-all active:scale-[0.985]">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 4.01V8" />
                </svg>
                Lihat Demo 45 Detik
              </a>
            </div>

            <div class="mt-8 flex items-center gap-x-4 text-sm text-slate-500">
              <div class="flex -space-x-2">
                <img src="https://i.pravatar.cc/24?img=28" class="w-6 h-6 rounded-full ring-2 ring-white" alt="">
                <img src="https://i.pravatar.cc/24?img=47" class="w-6 h-6 rounded-full ring-2 ring-white" alt="">
                <img src="https://i.pravatar.cc/24?img=32" class="w-6 h-6 rounded-full ring-2 ring-white" alt="">
              </div>
              <span>Dipercaya <span class="font-semibold text-slate-700">12.840+</span> tim di Indonesia</span>
            </div>
          </div>

          <!-- Right: Live Chat Mockup -->
          <div class="lg:col-span-5 relative mt-8 lg:mt-0 scroll-animate fade-up delay-200">
            <div id="demo" class="relative mx-auto max-w-[380px] lg:max-w-none rounded-3xl shadow-2xl shadow-slate-900/10 border border-slate-100 bg-white overflow-hidden">
              <!-- Mockup Header -->
              <div class="bg-slate-900 px-5 py-4 flex items-center justify-between text-white">
                <div class="flex items-center gap-x-3">
                  <div class="w-8 h-8 bg-white/10 rounded-2xl flex items-center justify-center">
                    <span class="text-xs font-mono">TS</span>
                  </div>
                  <div>
                    <div class="font-semibold text-sm">Tim Produk • ChatMe</div>
                    <div class="text-[10px] text-emerald-400 flex items-center gap-x-1">
                      <div class="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                      8 online
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-x-px text-xs font-mono text-white/60">09:41</div>
              </div>

              <!-- Messages -->
              <div class="h-[320px] bg-slate-50 p-5 space-y-5 overflow-hidden text-sm">
                <div class="flex gap-x-3">
                  <div class="w-8 h-8 bg-violet-200 rounded-2xl flex-shrink-0 flex items-center justify-center text-xs font-bold text-violet-700">AS</div>
                  <div>
                    <div class="flex items-center gap-x-2 mb-px">
                      <span class="font-semibold text-slate-900 text-sm">Andi Saputra</span>
                      <span class="text-[10px] text-slate-400">09:38</span>
                    </div>
                    <div class="bg-white shadow-sm border border-slate-100 px-4 py-2.5 rounded-3xl rounded-tl-none max-w-[240px]">
                      Sudah cek revisi landing page-nya? Menurutku sudah sangat clean.
                    </div>
                  </div>
                </div>

                <div class="flex justify-end gap-x-3">
                  <div class="max-w-[240px]">
                    <div class="bg-indigo-600 text-white px-4 py-2.5 rounded-3xl rounded-tr-none">
                      Sudah! Tinggal nunggu approval dari marketing. Siap deploy hari ini.
                    </div>
                    <div class="text-right text-[10px] text-slate-400 mt-px pr-1">09:39 • Delivered</div>
                  </div>
                </div>

                <div class="flex gap-x-3 items-center">
                  <div class="w-8 h-8 bg-emerald-200 rounded-2xl flex-shrink-0 flex items-center justify-center text-xs font-bold text-emerald-700">RN</div>
                  <div class="flex items-center gap-x-1.5 bg-white shadow-sm border border-slate-100 px-4 py-2 rounded-3xl">
                    <div class="flex gap-x-px">
                      <div class="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                      <div class="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                      <div class="w-1 h-1 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
                    </div>
                    <span class="text-xs text-slate-500">Rina mengetik...</span>
                  </div>
                </div>
              </div>

              <!-- Input -->
              <div class="border-t border-slate-100 bg-white px-4 py-3 flex items-center gap-x-3">
                <div class="flex-1 bg-slate-100 rounded-3xl px-5 py-2.5 text-sm text-slate-400 flex items-center">
                  Ketik pesan...
                </div>
                <button class="w-9 h-9 bg-indigo-600 hover:bg-indigo-700 transition-colors rounded-2xl flex items-center justify-center text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>

            <div class="absolute -inset-6 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 rounded-[4rem] -z-10 blur-3xl"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== TRUST BAR ==================== -->
    <div class="border-y border-slate-100 py-5 bg-slate-50 scroll-animate fade-in">
      <div class="max-w-5xl mx-auto px-6">
        <div class="flex flex-wrap justify-center items-center gap-x-12 gap-y-4 opacity-70">
          <div class="font-semibold text-slate-400 text-sm tracking-[1px]">DIpercaya OLEH</div>
          <div class="flex items-center gap-x-9 text-slate-400 text-sm font-medium">
            <div>Tokopedia</div>
            <div>Gojek</div>
            <div>Traveloka</div>
            <div class="hidden sm:block">BCA</div>
            <div class="hidden md:block">Shopee</div>
            <div class="hidden lg:block">Grab</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== FEATURES ==================== -->
    <section id="features" class="max-w-7xl mx-auto px-6 pt-20 pb-16">
      <div class="text-center mb-14 scroll-animate fade-up">
        <div class="text-indigo-600 font-semibold tracking-[1px] text-sm mb-3">FITUR UNGGULAN</div>
        <h2 class="text-4xl lg:text-5xl font-semibold tracking-tight text-slate-900">Didesain untuk tim yang bergerak cepat</h2>
        <p class="mt-4 text-xl text-slate-600 max-w-md mx-auto">Setiap detail dibuat agar Anda bisa fokus pada pekerjaan, bukan pada alatnya.</p>
      </div>

      <div class="grid md:grid-cols-3 gap-6">
        <!-- Feature 1 -->
        <div class="group bg-white border border-slate-100 rounded-3xl p-8 hover:shadow-xl hover:border-indigo-100 transition-all duration-300 flex flex-col scroll-animate fade-up delay-100">
          <div class="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 class="font-semibold text-2xl tracking-tight mb-3">Antarmuka Desktop Premium</h3>
          <p class="text-slate-600 leading-relaxed flex-1">Tata letak dua panel klasik industri dengan navigasi instan. Beralih channel dalam 0.2 detik tanpa reload halaman.</p>
          <div class="mt-8 text-xs font-mono text-indigo-600 flex items-center gap-x-1">
            SPLIT VIEW • KEYBOARD SHORTCUTS
          </div>
        </div>

        <!-- Feature 2 -->
        <div class="group bg-white border border-slate-100 rounded-3xl p-8 hover:shadow-xl hover:border-indigo-100 transition-all duration-300 flex flex-col scroll-animate fade-up delay-200">
          <div class="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 8.618 11.818a11.955 11.955 0 01-8.618-3.04z" />
            </svg>
          </div>
          <h3 class="font-semibold text-2xl tracking-tight mb-3">Keamanan Kelas Enterprise</h3>
          <p class="text-slate-600 leading-relaxed flex-1">End-to-end encryption, SSO, MFA, dan audit SOC 2 Type II. Data Anda tetap aman di infrastruktur Google Cloud.</p>
          <div class="mt-8 text-xs font-mono text-emerald-600 flex items-center gap-x-1">
            E2EE • SOC 2 • ISO 27001
          </div>
        </div>

        <!-- Feature 3 -->
        <div class="group bg-white border border-slate-100 rounded-3xl p-8 hover:shadow-xl hover:border-indigo-100 transition-all duration-300 flex flex-col scroll-animate fade-up delay-300">
          <div class="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 class="font-semibold text-2xl tracking-tight mb-3">Real-time Tanpa Latensi</h3>
          <p class="text-slate-600 leading-relaxed flex-1">Status kehadiran live, indikator mengetik, dan pesan masuk dalam &lt;50ms. Terasa seperti obrolan tatap muka.</p>
          <div class="mt-8 text-xs font-mono text-rose-600 flex items-center gap-x-1">
            &lt;50MS LATENCY • GLOBAL EDGE
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== STATS ==================== -->
    <section class="bg-slate-900 py-16 text-white scroll-animate fade-in">
      <div class="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-y-12 text-center">
        <div class="scroll-animate fade-up delay-100">
          <div class="text-5xl font-semibold tracking-tighter">48k</div>
          <div class="text-sm text-white/60 mt-2">Tim Aktif</div>
        </div>
        <div class="scroll-animate fade-up delay-200">
          <div class="text-5xl font-semibold tracking-tighter">99.99</div>
          <div class="text-sm text-white/60 mt-2">% Uptime (30 hari terakhir)</div>
        </div>
        <div class="scroll-animate fade-up delay-300">
          <div class="text-5xl font-semibold tracking-tighter">4.98</div>
          <div class="text-sm text-white/60 mt-2">Rating App Store & Play</div>
        </div>
        <div class="scroll-animate fade-up delay-400">
          <div class="text-5xl font-semibold tracking-tighter">127</div>
          <div class="text-sm text-white/60 mt-2">Negara</div>
        </div>
      </div>
    </section>

    <!-- ==================== FINAL CTA ==================== -->
    <section class="max-w-4xl mx-auto px-6 py-24 text-center scroll-animate fade-up">
      <div class="mx-auto max-w-lg">
        <h2 class="text-4xl font-semibold tracking-tight text-slate-900">Siap membuat tim Anda 3× lebih produktif?</h2>
        <p class="mt-4 text-xl text-slate-600">ChatMe 100% gratis selamanya. Tidak perlu kartu kredit.</p>
        
        <div class="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <NuxtLink 
            to="/register" 
            class="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-3xl text-lg transition-all flex items-center justify-center gap-x-3 active:scale-[0.985]">
            Mulai Gratis Sekarang
          </NuxtLink>
          <a href="#features" class="px-10 py-4 border border-slate-200 hover:bg-slate-50 font-semibold rounded-3xl text-lg transition-all text-slate-700 flex items-center justify-center">
            Pelajari Fitur Lengkap
          </a>
        </div>
        <p class="text-xs text-slate-400 mt-6">Gratis selamanya • Tanpa kartu kredit • Data Anda 100% milik Anda</p>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in')
        observer.unobserve(entry.target)
      }
    })
  }, { 
    threshold: 0.12,
    rootMargin: '0px 0px -80px 0px'
  })

  document.querySelectorAll('.scroll-animate').forEach(el => {
    observer.observe(el)
  })
})
</script>

<style scoped>
/* ==================== SCROLL ANIMATIONS ==================== */
.scroll-animate {
  opacity: 0;
  transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}

.scroll-animate.fade-up {
  transform: translateY(40px);
}

.scroll-animate.fade-in {
  transform: translateY(20px);
}

.scroll-animate.animate-in {
  opacity: 1;
  transform: translateY(0);
}

/* Staggered delays */
.delay-100 { transition-delay: 100ms; }
.delay-200 { transition-delay: 200ms; }
.delay-300 { transition-delay: 300ms; }
.delay-400 { transition-delay: 400ms; }

/* Hover effects */
.group:hover {
  transform: translateY(-4px);
}

/* Chat mockup shadow */
#demo {
  box-shadow: 
    0 25px 50px -12px rgb(15 23 42 / 0.15),
    0 10px 10px -6px rgb(15 23 42 / 0.1);
}

/* Smooth scroll for anchor links */
html {
  scroll-behavior: smooth;
}
</style>