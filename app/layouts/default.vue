<template>
  <div class="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
    <!-- Navbar Profesional -->
    <header class="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-800">
          <!-- Ikon SVG menggantikan Emoji -->
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          WorkspaceChat
        </div>
        <nav>
          <NuxtLink to="/login" class="text-sm font-medium text-slate-600 hover:text-slate-900 px-4 py-2 transition-colors">Masuk</NuxtLink>
          <NuxtLink to="/login" class="ml-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors shadow-sm">Mulai Gratis</NuxtLink>
        </nav>
      </div>
    </header>

    <!-- Konten Halaman (Otomatis diisi oleh index.vue nantinya) -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer Minimalis -->
    <footer class="bg-white border-t border-slate-200 py-8 text-center text-sm text-slate-500">
      <p>&copy; {{ new Date().getFullYear() }} WorkspaceChat. All rights reserved.</p>
    </footer>
  </div>
</template>