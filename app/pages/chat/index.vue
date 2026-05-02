<script setup>
import { computed, watch } from 'vue'
import { updateProfile, onAuthStateChanged } from 'firebase/auth'
import { useAuthStore } from '~/stores/auth'
import { collection, query, onSnapshot, doc, updateDoc, getDoc, arrayUnion, setDoc, addDoc, serverTimestamp, orderBy } from 'firebase/firestore'

definePageMeta({ layout: 'chat' })

const authStore = useAuthStore()
const selectedChat = ref(null)
const isDark = ref(true)

const isUploading = ref(false)
const fileInput = ref(null) 

const cloudinaryCloudName = 'dazzpveus' 
const cloudinaryUploadPreset = 'ml_default'

const allUsers = ref([])
const myContactsIds = ref([])
const showAddModal = ref(false)
const friendCode = ref('')
const isAdding = ref(false)

const showProfileModal = ref(false)
const editName = ref('')
const isSavingProfile = ref(false)

const openProfileModal = () => {
  editName.value = authStore.user?.displayName || ''
  showProfileModal.value = true
}

const saveProfile = async () => {
  if (!editName.value.trim()) return alert("Nama tidak boleh kosong!")
  
  isSavingProfile.value = true
  const { $db, $auth } = useNuxtApp()
  
  try {
    await setDoc(doc($db, "users", authStore.user.uid), {
      uid: authStore.user.uid,
      displayName: editName.value
    }, { merge: true })
    
    if ($auth.currentUser) {
      await updateProfile($auth.currentUser, { displayName: editName.value })
    }
    
    authStore.user.displayName = editName.value
    alert("Profil berhasil diperbarui!")
    showProfileModal.value = false
  } catch (error) {
    console.error("Error detail dari Firebase:", error)
    alert("Gagal memperbarui profil. Coba tekan F12 lalu cek Console.")
  } finally {
    isSavingProfile.value = false
  }
}

const filteredContacts = computed(() => {
  return allUsers.value.filter(user => myContactsIds.value.includes(user.id))
})

const copyMyCode = () => {
  navigator.clipboard.writeText(authStore.user.uid)
  alert('Kode Anda berhasil disalin!')
}

const handleAddContact = async () => {
  if (!friendCode.value) return
  if (friendCode.value === authStore.user.uid) return alert("Itu kode Anda sendiri!")

  isAdding.value = true
  const { $db } = useNuxtApp()

  try {
    const friendDoc = await getDoc(doc($db, "users", friendCode.value))
    if (!friendDoc.exists()) {
      alert("Kode tidak ditemukan!")
      isAdding.value = false
      return
    }

    await updateDoc(doc($db, "users", authStore.user.uid), { contacts: arrayUnion(friendCode.value) })
    await updateDoc(doc($db, "users", friendCode.value), { contacts: arrayUnion(authStore.user.uid) })

    alert("Berhasil terhubung dengan " + friendDoc.data().displayName + "!")
    showAddModal.value = false
    friendCode.value = ''
  } catch (error) {
    console.error(error)
    alert("Terjadi kesalahan sistem.")
  } finally {
    isAdding.value = false
  }
}

const triggerFileInput = () => {
  if (!isUploading.value) fileInput.value.click()
}

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) return alert('Ukuran gambar maksimal 2MB.')

  isUploading.value = true
  const { $db } = useNuxtApp()

  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', cloudinaryUploadPreset)

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`, { method: 'POST', body: formData })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error?.message)

    const newPhotoUrl = data.secure_url
    await updateDoc(doc($db, "users", authStore.user.uid), { photoURL: newPhotoUrl })
    authStore.user.photoURL = newPhotoUrl
  } catch (error) {
    alert("Gagal mengunggah foto profil.")
  } finally {
    isUploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

const sendImageMsg = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) return alert('Maksimal 5MB.')

  const { $db } = useNuxtApp()
  
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', cloudinaryUploadPreset)

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`, { method: 'POST', body: formData })
    const data = await res.json()
    const imageUrl = data.secure_url

    await addDoc(collection($db, 'chats', getChatId(), 'messages'), {
      senderId: authStore.user.uid,
      text: '',
      mediaUrl: imageUrl,
      timestamp: serverTimestamp()
    })
  } catch (error) {
    alert("Gagal mengirim gambar.")
  }
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
}

const handleLogout = async () => {
  await authStore.logout()
}

const newMessage = ref('')
const messages = ref([])
let chatUnsubscribe = null

const getChatId = () => {
  if (!selectedChat.value || !authStore.user?.uid) return null
  const uid1 = authStore.user.uid
  const uid2 = selectedChat.value.id 
  return uid1 > uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`
}

watch(selectedChat, (newChat) => {
  if (chatUnsubscribe) chatUnsubscribe()
  if (!newChat || !authStore.user?.uid) return

  const { $db } = useNuxtApp()
  const chatId = getChatId()
  if (!chatId) return
  
  const q = query(collection($db, 'chats', chatId, 'messages'), orderBy('timestamp', 'asc'))
  chatUnsubscribe = onSnapshot(q, (snapshot) => {
    messages.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  })
})

const sendMessage = async () => {
  if (!newMessage.value.trim() || !selectedChat.value) return

  const text = newMessage.value
  newMessage.value = ''

  const { $db } = useNuxtApp()
  const chatId = getChatId()
  if (!chatId) return

  try {
    await addDoc(collection($db, 'chats', chatId, 'messages'), {
      senderId: authStore.user.uid,
      text: text,
      timestamp: serverTimestamp()
    })
  } catch (error) {
    console.error("Gagal ngirim pesan:", error)
  }
}

onMounted(() => {
  if (isDark.value) document.documentElement.classList.add('dark')
  
  const { $db, $auth } = useNuxtApp()

  onAuthStateChanged($auth, (currentUser) => {
    if (currentUser) {
      authStore.user = currentUser 

      onSnapshot(doc($db, "users", currentUser.uid), (docSnap) => {
        if (docSnap.exists()) myContactsIds.value = docSnap.data().contacts || []
      })

      onSnapshot(query(collection($db, "users")), (snapshot) => {
        const usersList = []
        snapshot.forEach((doc) => {
          if (doc.id !== currentUser.uid) {
            usersList.push({ 
              id: doc.id, 
              ...doc.data(), 
              lastMessage: 'Klik untuk mengobrol', 
              time: '', 
              unread: 0 
            })
          }
        })
        allUsers.value = usersList
      })
    } else {
      navigateTo('/login')
    }
  })
})
</script>

<template>
  <div class="flex h-screen w-full bg-slate-100 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 font-sans overflow-hidden">
    
    <!-- ==================== LEFT NAV (60px) ==================== -->
    <div class="w-[68px] flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col items-center py-5 z-30">
      <div class="flex flex-col items-center gap-y-2">
        <!-- Logo -->
        <div class="w-9 h-9 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-sm mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.75">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
      </div>

      <div class="mt-auto flex flex-col items-center gap-y-3">
        <!-- Theme Toggle -->
        <button @click="toggleTheme" class="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all" title="Ganti Tema">
          <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
        </button>

        <!-- Logout -->
        <button @click="handleLogout" class="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all" title="Keluar">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M17 16l4-4m0 0l-4-4m4 4V4m0 12v4m-4-4H3" /></svg>
        </button>

        <!-- Profile Avatar -->
        <div @click="openProfileModal" class="w-8 h-8 rounded-2xl overflow-hidden cursor-pointer ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900 ring-indigo-500/50 hover:ring-indigo-500 transition-all">
          <img v-if="authStore.user?.photoURL" :src="authStore.user.photoURL" class="w-full h-full object-cover" />
          <div v-else class="w-full h-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
            {{ authStore.user?.displayName?.charAt(0).toUpperCase() || 'U' }}
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== CONTACTS SIDEBAR ==================== -->
    <div class="w-full md:w-[360px] lg:w-[380px] flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-20">
      
      <!-- Header -->
      <div class="h-[68px] px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
        <div>
          <h1 class="text-2xl font-semibold tracking-tight">ChatMe</h1>
          <p class="text-xs text-slate-500 dark:text-slate-400 -mt-0.5">Tim Anda</p>
        </div>
        
        <button @click="showAddModal = true" class="flex items-center gap-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-2xl transition-all active:scale-[0.985]">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          <span class="hidden lg:inline">Tambah</span>
        </button>
      </div>

      <!-- Search -->
      <div class="px-4 py-4">
        <div class="relative">
          <div class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <input type="text" placeholder="Cari kontak..." class="w-full bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 pl-11 py-3 text-sm rounded-2xl focus:outline-none transition-all" />
        </div>
      </div>

      <!-- Contact List -->
      <div class="flex-1 overflow-y-auto px-2 custom-scrollbar">
        <div v-if="filteredContacts.length === 0" class="px-4 py-12 text-center">
          <div class="mx-auto w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 01-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 01-2 2 2 2 0 01-2-2 2 2 0 012-2 2 2 0 012 2z" /></svg>
          </div>
          <p class="text-sm text-slate-500 dark:text-slate-400">Belum ada kontak.<br>Tambahkan teman sekarang.</p>
        </div>

        <div v-for="contact in filteredContacts" :key="contact.id" @click="selectedChat = contact"
             class="group flex items-center gap-x-4 px-4 py-3.5 mx-2 rounded-2xl cursor-pointer transition-all mb-1"
             :class="selectedChat?.id === contact.id ? 'bg-indigo-50 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'">
          
          <div class="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0 bg-indigo-100 dark:bg-slate-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold text-xl">
            <img v-if="contact.photoURL" :src="contact.photoURL" class="w-full h-full object-cover" />
            <span v-else>{{ contact.displayName?.charAt(0).toUpperCase() || 'U' }}</span>
          </div>
          
          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <h4 class="font-semibold text-[15px] truncate pr-3">{{ contact.displayName }}</h4>
            </div>
            <p class="text-sm text-slate-500 dark:text-slate-400 truncate">{{ contact.lastMessage }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== CHAT AREA ==================== -->
    <div class="flex-1 flex flex-col bg-white dark:bg-slate-950 relative min-w-0">
      
      <!-- Empty State -->
      <div v-if="!selectedChat" class="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 z-10">
        <div class="text-center max-w-sm px-6">
          <div class="mx-auto w-16 h-16 bg-indigo-100 dark:bg-indigo-950 rounded-3xl flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
          </div>
          <h3 class="text-2xl font-semibold tracking-tight mb-2">Selamat datang di ChatMe</h3>
          <p class="text-slate-500 dark:text-slate-400 text-[15px]">Pilih kontak dari sidebar untuk mulai mengobrol. Semua pesan dienkripsi secara end-to-end.</p>
        </div>
      </div>

      <template v-else>
        <!-- Chat Header -->
        <div class="h-[68px] px-6 flex items-center justify-between bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-10 flex-shrink-0">
          <div class="flex items-center gap-x-4">
            <div class="w-10 h-10 rounded-2xl overflow-hidden bg-indigo-100 dark:bg-slate-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold">
              <img v-if="selectedChat.photoURL" :src="selectedChat.photoURL" class="w-full h-full object-cover" />
              <span v-else>{{ selectedChat.displayName?.charAt(0).toUpperCase() || 'U' }}</span>
            </div>
            <div>
              <h3 class="font-semibold text-lg tracking-tight">{{ selectedChat.displayName }}</h3>
              <p class="text-xs text-emerald-500 flex items-center gap-x-1">
                <span class="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Online
              </p>
            </div>
          </div>
          
          <div class="flex items-center gap-x-1 text-slate-400">
            <button class="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2 2 2 0 012 2v14a2 2 0 01-2 2 2 2 0 01-2-2V5z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01" /></svg></button>
            <button class="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors"><svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></button>
          </div>
        </div>

        <!-- Messages Area -->
        <div class="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar bg-[radial-gradient(#e5e7eb_0.8px,transparent_1px)] dark:bg-[radial-gradient(#334155_0.8px,transparent_1px)] bg-[length:4px_4px]">
          <div class="max-w-3xl mx-auto space-y-6">
            <div v-for="msg in messages" :key="msg.id" class="flex w-full" :class="msg.senderId === authStore.user.uid ? 'justify-end' : 'justify-start'">
              <div class="max-w-[75%] px-5 py-3 rounded-3xl text-[15px] leading-relaxed shadow-sm" 
                   :class="msg.senderId === authStore.user.uid ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-none'">
                
                <img v-if="msg.mediaUrl" :src="msg.mediaUrl" class="rounded-2xl max-h-72 mb-2" />
                <p v-if="msg.text">{{ msg.text }}</p>
                
                <div class="text-right mt-1 text-[10px] opacity-60" :class="msg.senderId === authStore.user.uid ? 'text-indigo-200' : 'text-slate-400'">
                  {{ msg.timestamp ? new Date(msg.timestamp.toDate()).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '...' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="px-6 py-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex-shrink-0 z-10">
          <div class="max-w-3xl mx-auto flex items-center gap-x-3 bg-slate-100 dark:bg-slate-800 rounded-3xl px-2 py-1.5">
            
            <!-- Upload Image -->
            <label class="p-3 text-slate-400 hover:text-indigo-600 cursor-pointer transition-colors">
              <input type="file" accept="image/*" class="hidden" @change="sendImageMsg" />
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </label>

            <input v-model="newMessage" @keyup.enter="sendMessage" type="text" placeholder="Ketik pesan..." class="flex-1 bg-transparent text-[15px] focus:outline-none px-2 py-2 placeholder:text-slate-400" />

            <button @click="sendMessage" :disabled="!newMessage.trim()" class="p-3 text-indigo-600 hover:text-indigo-700 disabled:text-slate-300 transition-all active:scale-95">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </div>
        </div>
      </template>
    </div>

    <!-- ==================== MODALS (Tetap Sama) ==================== -->
    <!-- Modal Tambah Kontak -->
    <div v-if="showAddModal" class="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div class="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700">
        <div class="p-8">
          <div class="flex justify-between items-start mb-8">
            <div>
              <h3 class="text-2xl font-semibold tracking-tight">Tambah Kontak</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Hubungkan dengan kode teman Anda</p>
            </div>
            <button @click="showAddModal = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6h12v12" /></svg>
            </button>
          </div>

          <div class="mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
            <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">KODE ANDA (bagikan ke teman)</p>
            <div class="flex items-center justify-between">
              <code class="font-mono text-sm text-indigo-600 dark:text-indigo-400">{{ authStore.user?.uid }}</code>
              <button @click="copyMyCode" class="text-indigo-600 hover:text-indigo-700 p-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16v-4m4 4v4m4-8v8m4-4v-4m-16 8h16a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </button>
            </div>
          </div>

          <div class="mb-6">
            <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider">MASUKKAN KODE TEMAN</label>
            <input v-model="friendCode" type="text" placeholder="Paste UID teman di sini..." class="mt-2 w-full px-5 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 transition-all" />
          </div>
        </div>

        <div class="border-t border-slate-100 dark:border-slate-800 p-4 flex gap-x-3">
          <button @click="showAddModal = false" class="flex-1 py-3 text-sm font-semibold rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Batal</button>
          <button @click="handleAddContact" :disabled="isAdding || !friendCode" class="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold rounded-2xl transition-all active:scale-[0.985]">
            {{ isAdding ? 'Menghubungkan...' : 'Tambahkan Teman' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Profil -->
    <div v-if="showProfileModal" class="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div class="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        
        <div class="p-8">
          <div class="flex justify-between items-center mb-8">
            <h3 class="text-xl font-semibold">Profil Saya</h3>
            <button @click="showProfileModal = false" class="text-slate-400 hover:text-red-500"><svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6h12v12" /></svg></button>
          </div>

          <div class="flex flex-col items-center mb-8">
            <div class="relative group" @click="triggerFileInput">
              <input type="file" ref="fileInput" accept="image/*" class="hidden" @change="handleFileUpload" />
              <div class="w-24 h-24 rounded-full overflow-hidden ring-4 ring-offset-4 ring-offset-white dark:ring-offset-slate-900 ring-indigo-100 dark:ring-indigo-900/50 cursor-pointer">
                <img v-if="authStore.user?.photoURL" :src="authStore.user.photoURL" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full bg-indigo-600 flex items-center justify-center text-white text-4xl font-bold">{{ authStore.user?.displayName?.charAt(0).toUpperCase() || 'U' }}</div>
              </div>
              <div class="absolute bottom-1 right-1 bg-white dark:bg-slate-800 p-1.5 rounded-full shadow border border-slate-200 dark:border-slate-700 opacity-0 group-hover:opacity-100 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2 2 2 0 012 2v10a2 2 0 01-2 2 2 2 0 01-2-2V9z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
              </div>
            </div>
            <p class="text-xs text-slate-400 mt-3">Klik foto untuk mengubah</p>
          </div>

          <div class="space-y-5">
            <div>
              <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider">NAMA TAMPILAN</label>
              <input v-model="editName" type="text" class="mt-2 w-full px-5 py-3 bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 rounded-2xl text-sm transition-all" />
            </div>
            
            <div>
              <label class="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wider">KODE ANDA (UID)</label>
              <div class="mt-2 flex items-center gap-x-2 px-5 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-sm font-mono text-slate-600 dark:text-slate-300">
                {{ authStore.user?.uid }}
                <button @click="copyMyCode" class="ml-auto text-indigo-600"><svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16v-4m4 4v4m4-8v8m4-4v-4m-16 8h16a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></button>
              </div>
            </div>
          </div>
        </div>

        <div class="border-t border-slate-100 dark:border-slate-800 p-4">
          <button @click="saveProfile" :disabled="isSavingProfile" class="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-2xl transition-all active:scale-[0.985]">
            {{ isSavingProfile ? 'Menyimpan...' : 'Simpan Perubahan' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #64748b30; border-radius: 20px; }
.custom-scrollbar:hover::-webkit-scrollbar-thumb { background-color: #64748b50; }
</style>