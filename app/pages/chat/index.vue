<script setup>
import { computed, watch, ref, nextTick } from 'vue'
import { updateProfile, onAuthStateChanged } from 'firebase/auth'
import { useAuthStore } from '~/stores/auth'
// Langkah 2A: Tambahkan deleteDoc di import
import { collection, query, onSnapshot, doc, updateDoc, getDoc, arrayUnion, setDoc, addDoc, serverTimestamp, orderBy, writeBatch, deleteDoc } from 'firebase/firestore'

definePageMeta({ layout: 'chat' })

const authStore = useAuthStore()
const selectedChat = ref(null)
const isDark = ref(true)

const cloudinaryCloudName = 'dazzpveus' 
const cloudinaryUploadPreset = 'ml_default'

// --- STATE MANAJEMEN ---
const allUsers = ref([])
const myContactsIds = ref([])
const showAddModal = ref(false)
const friendCode = ref('')
const isAdding = ref(false)
const isUploading = ref(false)
const fileInput = ref(null) 
const showProfileModal = ref(false)
const editName = ref('')
const isSavingProfile = ref(false)

// --- STATE CHAT ADVANCED ---
const newMessage = ref('')
const messages = ref([])
const replyingTo = ref(null) 
let chatUnsubscribe = null
const chatSummaries = ref({})

// Fitur Auto-Scroll & Preview Gambar
const chatContainerRef = ref(null)
const selectedImageFile = ref(null)
const imagePreviewUrl = ref(null)

// --- STATE GRUP (Langkah 4A) ---
const showGroupModal = ref(false)
const groupName = ref('')
const selectedGroupMembers = ref([])

// --- FUNGSI SCROLL OTOMATIS ---
const scrollToBottom = async () => {
  await nextTick()
  if (chatContainerRef.value) {
    chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight
  }
}

// --- FUNGSI PROFIL & TEMA & KONTAK ---
const openProfileModal = () => { 
  editName.value = authStore.user?.displayName || ''; 
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

const toggleTheme = () => { 
  isDark.value = !isDark.value; 
  isDark.value ? document.documentElement.classList.add('dark') : document.documentElement.classList.remove('dark') 
}

const filteredContacts = computed(() => allUsers.value.filter(user => myContactsIds.value.includes(user.id)))

const copyMyCode = () => { 
  navigator.clipboard.writeText(authStore.user.uid); 
  alert('Kode disalin!') 
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

const uploadToCloudinary = async (file, resourceType = 'image') => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', cloudinaryUploadPreset)
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/${resourceType}/upload`, { 
    method: 'POST', 
    body: formData 
  })
  const data = await res.json()
  return data.secure_url
}

const triggerFileInput = () => fileInput.value.click()

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    alert('Ukuran gambar terlalu besar. Maksimal 2MB.')
    return
  }

  isUploading.value = true
  const { $db } = useNuxtApp()

  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', cloudinaryUploadPreset)

    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`,
      { method: 'POST', body: formData }
    )

    const cloudinaryData = await cloudinaryResponse.json()

    if (!cloudinaryResponse.ok) {
        throw new Error(cloudinaryData.error?.message || 'Gagal unggah ke Cloudinary')
    }

    const newPhotoUrl = cloudinaryData.secure_url

    // --- LANGKAH 1: TAMBAHKAN UPDATE PROFILE AUTH ---
    const { $auth } = useNuxtApp()
    if ($auth.currentUser) {
      await updateProfile($auth.currentUser, { photoURL: newPhotoUrl })
    }
    // ---------------------------------------------------

    const userRef = doc($db, "users", authStore.user.uid)
    await updateDoc(userRef, { photoURL: newPhotoUrl })

    authStore.user.photoURL = newPhotoUrl

  } catch (error) {
    console.error("Error uploading image:", error)
    alert("Gagal mengunggah foto profil. Periksa console.")
  } finally {
    isUploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

// --- LOGIKA CHAT REAL-TIME (DIPERBARUI) ---
// Langkah 4B: Update getChatId() untuk mendukung Grup
const getChatId = () => {
  if (!selectedChat.value || !authStore.user?.uid) return null
  // Jika ini adalah Grup, gunakan ID Grup langsung sebagai ID Chat Room
  if (selectedChat.value.isGroup) return selectedChat.value.id 
  
  const uids = [authStore.user.uid, selectedChat.value.id].sort()
  return `${uids[0]}_${uids[1]}`
}

watch(selectedChat, async (newChat) => {
  if (chatUnsubscribe) chatUnsubscribe()
  if (!newChat || !authStore.user?.uid) return
  
  const { $db } = useNuxtApp()
  const chatId = getChatId()
  if (!chatId) return
  
  const q = query(collection($db, 'chats', chatId, 'messages'), orderBy('timestamp', 'asc'))
  
  chatUnsubscribe = onSnapshot(q, async (snap) => {
    messages.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    await scrollToBottom()

    // Fitur: Menandai Pesan Terbaca (Blue Check)
    const batch = writeBatch($db)
    let hasUnread = false
    snap.docs.forEach(docSnap => {
      const data = docSnap.data()
      if (data.senderId !== authStore.user.uid && data.status !== 'read') {
        batch.update(docSnap.ref, { status: 'read' })
        hasUnread = true
      }
    })
    if (hasUnread) await batch.commit()
  })
})

const handleImageSelect = (e) => {
  const file = e.target.files[0]
  if (!file) return
  
  if (file.size > 5 * 1024 * 1024) {
    alert('Ukuran gambar terlalu besar. Maksimal 5MB.')
    return
  }
  
  selectedImageFile.value = file
  imagePreviewUrl.value = URL.createObjectURL(file)
}

const cancelImage = () => {
  selectedImageFile.value = null
  imagePreviewUrl.value = null
}

// Langkah 2B: Fungsi Hapus Pesan
const deleteMessage = async (msgId) => {
  if (!confirm("Yakin ingin menghapus pesan ini?")) return
  const { $db } = useNuxtApp()
  const chatId = getChatId()
  try {
    await deleteDoc(doc($db, 'chats', chatId, 'messages', msgId))
  } catch (error) {
    alert("Gagal menghapus pesan.")
  }
}

// Langkah 4A: Fungsi Buat Grup
const createGroup = async () => {
  if (!groupName.value.trim() || selectedGroupMembers.value.length === 0) {
    return alert("Nama grup dan anggota tidak boleh kosong!")
  }

  const { $db } = useNuxtApp()
  const groupId = 'group_' + Date.now()
  const members = [authStore.user.uid, ...selectedGroupMembers.value]

  try {
    // 1. Simpan profil Grup ke koleksi "users"
    await setDoc(doc($db, "users", groupId), {
      displayName: groupName.value,
      isGroup: true,
      members: members,
      photoURL: 'https://cdn-icons-png.flaticon.com/512/615/615075.png'
    })

    // 2. Tambahkan ID Grup ini ke daftar kontak semua anggotanya
    const batch = writeBatch($db)
    members.forEach(memberId => {
      batch.update(doc($db, "users", memberId), {
        contacts: arrayUnion(groupId)
      })
    })
    await batch.commit()

    showGroupModal.value = false
    groupName.value = ''
    selectedGroupMembers.value = []
    alert("Grup berhasil dibuat!")
  } catch (error) {
    console.error(error)
    alert("Gagal membuat grup.")
  }
}

const getChatIdForSummary = (contact) => {
  if (!contact || !authStore.user?.uid) return null
  if (contact.isGroup) return contact.id // Kalau grup, ambil ID grup
  const uids = [authStore.user.uid, contact.id].sort()
  return `${uids[0]}_${uids[1]}`
}

// 2. Logika Voice Note (VN) yang hilang
const isRecording = ref(false)
const mediaRecorder = ref(null)
const audioChunks = ref([])

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder.value = new MediaRecorder(stream)
    audioChunks.value = []

    mediaRecorder.value.ondataavailable = (e) => audioChunks.value.push(e.data)
    
    mediaRecorder.value.onstop = async () => {
      const audioBlob = new Blob(audioChunks.value, { type: 'audio/webm' })
      const file = new File([audioBlob], "vn.webm", { type: 'audio/webm' })
      
      const { $db } = useNuxtApp()
      const chatId = getChatId()
      if (!chatId) return

      try {
        const url = await uploadToCloudinary(file, 'video') 
        
        await addDoc(collection($db, 'chats', chatId, 'messages'), {
          senderId: authStore.user.uid,
          text: '',
          mediaUrl: url,
          type: 'audio',
          status: 'sent',
          timestamp: serverTimestamp()
        })

        await setDoc(doc($db, 'chats', chatId), {
          lastMessage: '🎤 Voice Note',
          lastSenderId: authStore.user.uid,
          timestamp: serverTimestamp()
        }, { merge: true })

        await scrollToBottom()
      } catch (err) {
        console.error("Gagal kirim VN:", err)
      }
      
      stream.getTracks().forEach(track => track.stop())
    }

    mediaRecorder.value.start()
    isRecording.value = true
  } catch (err) {
    alert("Gagal akses mikrofon: " + err.message)
  }
}

const stopRecording = () => {
  if (mediaRecorder.value && isRecording.value) {
    mediaRecorder.value.stop()
    isRecording.value = false
  }
}
const sendMessage = async () => {
  if (!newMessage.value.trim() && !selectedImageFile.value) return
  
  const { $db } = useNuxtApp()
  const textToSend = newMessage.value
  const chatId = getChatId()
  if (!chatId) return
  
  const replyData = replyingTo.value ? { 
    id: replyingTo.value.id, 
    text: replyingTo.value.text || '📷 Gambar', 
    sender: replyingTo.value.senderId === authStore.user.uid ? 'Anda' : selectedChat.value.displayName 
  } : null
  
  newMessage.value = ''
  replyingTo.value = null
  
  let mediaUrl = null
  const fileToUpload = selectedImageFile.value
  cancelImage()

  if (fileToUpload) {
    try {
      mediaUrl = await uploadToCloudinary(fileToUpload, 'image')
    } catch (error) {
      console.error("Gagal upload gambar:", error)
      alert("Gagal mengunggah gambar.")
      return
    }
  }

  try {
    await addDoc(collection($db, 'chats', chatId, 'messages'), {
      senderId: authStore.user.uid,
      text: textToSend,
      mediaUrl: mediaUrl,
      replyTo: replyData,
      status: 'sent',
      timestamp: serverTimestamp()
    })

    await setDoc(doc($db, 'chats', chatId), {
      lastMessage: textToSend || '📷 Gambar',
      lastSenderId: authStore.user.uid,
      timestamp: serverTimestamp()
    }, { merge: true })

    await scrollToBottom()
  } catch (e) { 
    console.error("Gagal kirim pesan:", e)
    alert("Gagal mengirim pesan.")
  }
}

const scrollToMsg = (id) => {
  const el = document.getElementById(`msg-${id}`)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.classList.add('bg-blue-200', 'dark:bg-blue-900')
    setTimeout(() => el.classList.remove('bg-blue-200', 'dark:bg-blue-900'), 2000)
  }
}

// --- FITUR STORY (STATUS) ---
const stories = ref([])
const activeStory = ref(null)
const storyFileInput = ref(null)

const handleStoryUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  isUploading.value = true
  const { $db } = useNuxtApp()
  
  try {
    const url = await uploadToCloudinary(file, 'image')
    
    await addDoc(collection($db, 'stories'), {
      userId: authStore.user.uid,
      userName: authStore.user.displayName,
      userPhoto: authStore.user.photoURL || '',
      mediaUrl: url,
      timestamp: serverTimestamp()
    })
    alert('Story berhasil diunggah!')
  } catch (error) {
    console.error("Gagal upload story:", error)
    alert('Gagal mengunggah story.')
  } finally {
    isUploading.value = false
    if (storyFileInput.value) storyFileInput.value.value = ''
  }
}

let storyTimer = null
const viewStory = (story) => {
  activeStory.value = story
  if (storyTimer) clearTimeout(storyTimer)
  storyTimer = setTimeout(() => {
    activeStory.value = null
  }, 5000)
}
const closeStory = () => {
  activeStory.value = null
  if (storyTimer) clearTimeout(storyTimer)
}

const activeStories = computed(() => {
  const now = new Date()
  return stories.value.filter(s => {
    const isContactOrMe = s.userId === authStore.user.uid || myContactsIds.value.includes(s.userId)
    if (!isContactOrMe || !s.timestamp) return false
    const storyDate = s.timestamp.toDate()
    const diffHours = Math.abs(now - storyDate) / 36e5
    return diffHours < 24
  })
})

const handleLogout = async () => {
  await authStore.logout()
}

onMounted(() => {
  if (isDark.value) document.documentElement.classList.add('dark')
  const { $db, $auth } = useNuxtApp()
  
  onAuthStateChanged($auth, (user) => {
    if (user) {
      authStore.user = user
      
      onSnapshot(doc($db, "users", user.uid), (s) => { 
        if (s.exists()) myContactsIds.value = s.data().contacts || [] 
      })
      
      onSnapshot(query(collection($db, "users")), (s) => {
        allUsers.value = s.docs.filter(d => d.id !== user.uid).map(d => ({ id: d.id, ...d.data() }))
      })

      onSnapshot(query(collection($db, "chats")), (snap) => {
        const summaries = {}
        snap.forEach(doc => { summaries[doc.id] = doc.data() })
        chatSummaries.value = summaries
      })

      onSnapshot(query(collection($db, "stories"), orderBy('timestamp', 'desc')), (snap) => {
        stories.value = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      })
    } else {
      navigateTo('/index')
    }
  })
})
</script>

<template>
  <div class="h-dvh w-full p-4 md:p-6 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
    <div class="flex flex-col md:flex-row h-full w-full max-w-7xl mx-auto bg-white/70 dark:bg-black/40 backdrop-blur-xl rounded-[2rem] shadow-2xl overflow-hidden border border-white/30 dark:border-white/10 transition-colors duration-300 pb-safe">
      
      <!-- PANEL 1: Navigasi Paling Kiri -->
      <div class="flex flex-row md:flex-col items-center justify-between md:justify-start w-full h-[60px] md:h-full md:w-[60px] flex-shrink-0 bg-white/60 dark:bg-black/30 backdrop-blur-md border-b md:border-b-0 md:border-r border-white/20 dark:border-white/10 px-4 py-2 md:py-4 z-20 transition-colors duration-300">
        <button class="p-2 bg-white/40 dark:bg-white/10 backdrop-blur-sm rounded-full text-slate-700 dark:text-slate-200 shadow-sm order-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"></path></svg>
        </button>

        <div class="flex flex-row md:flex-col items-center gap-6 order-2 md:order-3 md:mt-auto">
          <button @click="toggleTheme" class="p-2 text-[#54656f] dark:text-[#aebac1] hover:bg-white/30 dark:hover:bg-white/10 rounded-full transition-colors" title="Ganti Tema">
            <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="4.22" x2="19.78" y2="5.64"></line></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
          </button>
          <button @click="handleLogout" class="p-2 text-[#54656f] dark:text-[#aebac1] hover:bg-white/30 dark:hover:bg-white/10 rounded-full transition-colors" title="Keluar">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </button>
          <div @click="openProfileModal" class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer shadow-sm overflow-hidden bg-blue-600 hover:ring-2 hover:ring-blue-400 transition-all">
            <img v-if="authStore.user?.photoURL" :src="authStore.user.photoURL" alt="Profile" class="w-full h-full object-cover" />
            <span v-else>{{ authStore.user?.displayName?.charAt(0).toUpperCase() || 'U' }}</span>
          </div>
        </div>
      </div>

      <!-- PANEL 2: Sidebar Daftar Kontak -->
      <div class="w-full md:w-[350px] flex-shrink-0 bg-white/50 dark:bg-black/30 backdrop-blur-md flex flex-col border-r border-white/20 dark:border-white/10 transition-colors duration-300" :class="{'hidden md:flex': selectedChat, 'flex': !selectedChat}">
        <!-- Langkah 4C: Tambahkan Tombol Buat Grup -->
        <div class="h-[60px] px-4 flex items-center justify-between backdrop-blur-sm bg-white/70 dark:bg-white/10 border-b border-white/20 dark:border-white/10">
          <h2 class="font-bold text-xl">Chat</h2>
          <div class="flex gap-2">
            <button @click="showGroupModal = true" class="p-2 hover:bg-white/30 dark:hover:bg-white/10 rounded-full transition-colors" title="Buat Grup">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </button>
            <button @click="showAddModal = true" class="p-2 hover:bg-white/30 dark:hover:bg-white/10 rounded-full transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
            </button>
          </div>
        </div>
        
        <div class="flex-1 overflow-y-auto custom-scrollbar">
          <!-- BARIS STORY (STATUS) -->
          <div class="px-4 py-3 border-b border-white/10 dark:border-white/5 bg-white/30 dark:bg-white/5 flex gap-4 overflow-x-auto custom-scrollbar">
            <div class="flex flex-col items-center gap-1 cursor-pointer flex-shrink-0 relative" @click="() => storyFileInput.click()">
              <input type="file" accept="image/*" ref="storyFileInput" class="hidden" @change="handleStoryUpload" />
              <div class="w-12 h-12 rounded-full overflow-hidden bg-blue-600 relative ring-2 ring-transparent">
                <img v-if="authStore.user?.photoURL" :src="authStore.user.photoURL" class="w-full h-full object-cover opacity-70" />
                <span v-else class="flex h-full w-full items-center justify-center text-white font-bold">{{ authStore.user?.displayName?.charAt(0) }}</span>
                <div class="absolute inset-0 flex items-center justify-center bg-black/20 text-white font-bold text-xl">+</div>
              </div>
              <span class="text-[11px] text-slate-500 font-medium">Status Saya</span>
            </div>

            <div v-for="story in activeStories" :key="story.id" @click="viewStory(story)" class="flex flex-col items-center gap-1 cursor-pointer flex-shrink-0">
              <div class="w-12 h-12 rounded-full overflow-hidden bg-slate-300 ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-[#111b21]">
                <img v-if="story.userPhoto" :src="story.userPhoto" class="w-full h-full object-cover" />
                <span v-else class="flex h-full w-full items-center justify-center text-white bg-blue-500 font-bold">{{ story.userName?.charAt(0) }}</span>
              </div>
              <span class="text-[11px] text-slate-500 font-medium w-12 truncate text-center">{{ story.userId === authStore.user.uid ? 'Anda' : story.userName }}</span>
            </div>
          </div>

          <!-- Looping Daftar Teman (Termasuk Grup) -->
          <div v-for="c in filteredContacts" :key="c.id" @click="selectedChat = c" class="flex items-center p-3 cursor-pointer hover:bg-white/30 dark:hover:bg-white/10 transition-colors" :class="selectedChat?.id === c.id ? 'bg-white/50 dark:bg-white/20' : ''">
            <div class="w-12 h-12 rounded-full overflow-hidden flex-shrink-0" :class="c.isGroup ? 'bg-green-500' : 'bg-blue-500'">
              <img v-if="c.photoURL" :src="c.photoURL" class="w-full h-full object-cover" />
              <span v-else class="flex h-full w-full items-center justify-center text-white font-bold">
                <template v-if="c.isGroup">👥</template>
                <template v-else>{{ c.displayName?.charAt(0) }}</template>
              </span>
            </div>
            <div class="ml-3 flex-1 border-b border-white/10 dark:border-white/5 pb-3 min-w-0">
               <h4 class="font-medium truncate">{{ c.displayName }}</h4>
               
               <p class="text-[13px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                 <span v-if="chatSummaries[getChatIdForSummary(c)]">
                   <span v-if="chatSummaries[getChatIdForSummary(c)].lastSenderId === authStore.user.uid" class="mr-1">✓</span>
                   {{ chatSummaries[getChatIdForSummary(c)].lastMessage }}
                 </span>
                 <span v-else>Belum ada obrolan</span>
               </p>
            </div>
          </div>
        </div>
      </div>

      <!-- PANEL 3: Ruang Obrolan -->
      <div class="flex-1 flex flex-col bg-white/40 dark:bg-black/30 backdrop-blur-md relative transition-colors duration-300">
        <div v-if="!selectedChat" class="flex-1 flex flex-col items-center justify-center dark:bg-transparent border-b-4 border-[#00a884]">
           <h3 class="text-2xl font-light">WorkspaceChat</h3>
           <p class="text-sm text-slate-500 dark:text-slate-400 mt-2">Pilih kontak untuk mulai chatting</p>
        </div>

        <template v-else>
          <div class="h-[60px] px-4 flex items-center bg-white/70 dark:bg-white/10 backdrop-blur-md border-b border-white/20 dark:border-white/10 z-10">
             <button @click="selectedChat = null" class="md:hidden mr-2 p-2 -ml-2 hover:bg-white/30 rounded-full text-slate-600 dark:text-slate-300">
               <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
             </button>
             <div class="w-10 h-10 rounded-full overflow-hidden flex-shrink-0" :class="selectedChat.isGroup ? 'bg-green-500' : 'bg-blue-500'">
               <img v-if="selectedChat.photoURL" :src="selectedChat.photoURL" class="w-full h-full object-cover" />
               <span v-else class="flex h-full w-full items-center justify-center text-white font-bold">
                 <template v-if="selectedChat.isGroup">👥</template>
                 <template v-else>{{ selectedChat.displayName?.charAt(0) }}</template>
               </span>
             </div>
             <h3 class="font-medium ml-3">{{ selectedChat.displayName }}</h3>
          </div>

          <!-- Area Obrolan (Auto Scroll Ref) - Langkah 3: pb-28 + min-h-full + justify-end -->
          <div ref="chatContainerRef" class="flex-1 overflow-y-auto p-4 custom-scrollbar backdrop-blur-sm bg-white/30 dark:bg-white/5 pb-28" style="background-image: url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png'); background-blend-mode: overlay; opacity: 0.9;">
            <div class="flex flex-col gap-1 min-h-full justify-end">
              <div v-for="m in messages" :id="`msg-${m.id}`" :key="m.id" @dblclick="replyingTo = m" class="flex w-full transition-all duration-500 p-1 rounded-lg mt-auto" :class="m.senderId === authStore.user.uid ? 'justify-end' : 'justify-start'">
                <div class="px-3 py-1.5 max-w-[80%] shadow-sm relative group cursor-pointer rounded-2xl" :class="m.senderId === authStore.user.uid ? 'bg-[#d9fdd3]/90 dark:bg-[#005c4b]/90 rounded-tr-none' : 'bg-white/90 dark:bg-[#202c33]/90 rounded-tl-none'">
                  
                  <!-- Reply Section -->
                  <div v-if="m.replyTo" @click="scrollToMsg(m.replyTo.id)" class="mb-1 p-2 bg-black/5 dark:bg-white/5 border-l-4 border-blue-500 rounded text-[11px] opacity-80 cursor-pointer hover:opacity-100">
                    <p class="font-bold text-blue-500">{{ m.replyTo.sender }}</p>
                    <p class="truncate">{{ m.replyTo.text || '📷 Gambar' }}</p>
                  </div>
                  
                  <!-- Media -->
                  <template v-if="m.mediaUrl">
                    <audio v-if="m.type === 'audio'" :src="m.mediaUrl" controls class="max-w-[220px] h-10 mb-1"></audio>
                    <img v-else :src="m.mediaUrl" class="rounded-lg max-h-64 mb-1 block mx-auto" @load="scrollToBottom" />
                  </template>
                  
                  <!-- Teks -->
                  <p v-if="m.text" class="text-sm pr-14 whitespace-pre-wrap">{{ m.text }}</p>
                  
                  <!-- Waktu & Centang & Tombol Hapus (Langkah 2C) -->
                  <div class="text-[9px] opacity-60 absolute right-2 bottom-1 flex items-center gap-1">
                    <span>{{ m.timestamp ? new Date(m.timestamp.toDate()).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '...' }}</span>
                    <span v-if="m.senderId === authStore.user.uid">
                      <svg v-if="m.status === 'read'" class="w-3 h-3 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L7 17l-5-5 M22 6l-5 5"/></svg>
                      <svg v-else class="w-3 h-3 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
                    </span>
                  </div>

                  <!-- Tombol Hapus (Muncul saat di-hover) -->
                  <button v-if="m.senderId === authStore.user.uid" @click.stop="deleteMessage(m.id)" class="absolute -left-8 top-1/2 -translate-y-1/2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- ====== INPUT AREA STICKY ====== -->
          <div class="sticky bottom-0 z-10 w-full bg-white/40 dark:bg-black/30 backdrop-blur-md border-t border-white/10 dark:border-white/10 pb-safe">
            <div class="mx-auto max-w-2xl px-3 md:px-4 pt-2 pb-3">
              
              <!-- Preview Gambar -->
              <div v-if="imagePreviewUrl" class="absolute bottom-full left-0 mb-2 p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-lg rounded-xl border border-white/30 dark:border-white/10 ml-4">
                 <div class="relative">
                    <img :src="imagePreviewUrl" class="h-32 object-contain rounded-lg" />
                    <button @click="cancelImage" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg></button>
                 </div>
                 <p class="text-xs text-center mt-2 text-slate-500">Tambahkan teks lalu tekan Enter</p>
              </div>

              <!-- Kotak Reply -->
              <div v-if="replyingTo" class="mb-2 p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-l-4 border-blue-500 flex justify-between rounded-t-lg">
                 <div class="text-xs truncate"><p class="font-bold text-blue-500">Balas {{ replyingTo.senderId === authStore.user.uid ? 'Anda' : selectedChat.displayName }}</p><p class="truncate">{{ replyingTo.text || '📷 Gambar' }}</p></div>
                 <button @click="replyingTo = null"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg></button>
              </div>
              
              <!-- Pill Input -->
              <div class="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full shadow-xl border border-white/30 dark:border-white/10 p-1 pl-4">
                <label class="cursor-pointer text-slate-500 hover:text-blue-500 flex-shrink-0">
                  <input type="file" accept="image/*" class="hidden" @change="handleImageSelect" />
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                </label>
                <input v-model="newMessage" @keyup.enter="sendMessage()" type="text" placeholder="Ketik pesan..." class="flex-1 bg-transparent px-2 py-2.5 outline-none text-sm placeholder-slate-400 dark:placeholder-gray-500 min-w-0" />
                <button v-if="newMessage.trim() || imagePreviewUrl" @click="sendMessage()" class="text-blue-500 p-2 hover:bg-white/30 dark:hover:bg-white/10 rounded-full transition-colors flex-shrink-0">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                </button>
                
                <button v-else 
                  @mousedown="startRecording" 
                  @mouseup="stopRecording" 
                  @mouseleave="stopRecording" 
                  @touchstart="startRecording" 
                  @touchend="stopRecording"
                  class="p-2 transition-colors rounded-full flex-shrink-0" 
                  :class="isRecording ? 'text-red-500 animate-pulse bg-red-100 dark:bg-red-900/30' : 'text-slate-500 hover:bg-white/30 dark:hover:bg-white/10'">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- Modal Tambah Kontak -->
      <div v-if="showAddModal" class="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
        <div class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg w-full max-w-md rounded-2xl shadow-2xl p-6 border border-white/30 dark:border-white/10 mx-4 sm:mx-0">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-bold text-[#111b21] dark:text-[#e9edef]">Hubungkan Kontak</h3>
            <button @click="showAddModal = false" class="text-[#54656f] dark:text-[#8696a0] hover:text-red-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <div class="mb-6 bg-white/50 dark:bg-white/5 backdrop-blur-sm p-4 rounded-lg text-center">
            <p class="text-sm text-[#54656f] dark:text-[#8696a0] mb-2">Kode Anda (Bagikan untuk di-add teman)</p>
            <div class="flex items-center justify-center gap-2">
              <code class="text-lg font-mono font-bold text-blue-600 dark:text-blue-400">{{ authStore.user?.uid?.substring(0,8) }}...</code>
              <button @click="copyMyCode" class="p-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded hover:bg-blue-200 transition-colors" title="Salin Kode Lengkap">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </button>
            </div>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium text-[#111b21] dark:text-[#e9edef] mb-2">Masukkan Kode Teman</label>
            <input v-model="friendCode" type="text" placeholder="Paste kode UID teman..." class="w-full px-4 py-3 bg-white/60 dark:bg-white/10 backdrop-blur-sm border border-white/30 dark:border-white/10 rounded-lg text-[#111b21] dark:text-[#e9edef] focus:outline-none focus:border-blue-500 transition-colors" />
          </div>

          <button @click="handleAddContact" :disabled="isAdding || !friendCode" class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <span v-if="isAdding">Menghubungkan...</span>
            <span v-else>Tambahkan Teman</span>
          </button>
        </div>
      </div>

      <!-- MODAL EDIT PROFIL -->
      <div v-if="showProfileModal" class="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
        <div class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg w-full max-w-sm rounded-2xl shadow-2xl p-6 border border-white/30 dark:border-white/10 mx-4 sm:mx-0">
          
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-bold text-[#111b21] dark:text-[#e9edef]">Profil Saya</h3>
            <button @click="showProfileModal = false" class="text-[#54656f] dark:text-[#8696a0] hover:text-red-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <div class="flex flex-col items-center mb-6">
            <div class="relative group cursor-pointer mb-3">
              <input type="file" ref="fileInput" accept="image/*" class="hidden" @change="handleFileUpload" />
              
              <div @click="triggerFileInput" class="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold overflow-hidden bg-blue-600 shadow-md transition-opacity" :class="{ 'opacity-50': isUploading }">
                <img v-if="authStore.user?.photoURL" :src="authStore.user.photoURL" alt="Profile" class="w-full h-full object-cover" />
                <span v-else>{{ authStore.user?.displayName?.charAt(0).toUpperCase() || 'U' }}</span>
                
                <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                </div>
              </div>

              <div v-if="isUploading" class="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                <svg class="animate-spin w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              </div>
            </div>
            <p class="text-xs text-[#54656f] dark:text-[#8696a0]">Klik foto untuk mengubah</p>
          </div>

          <div class="mb-5 bg-white/50 dark:bg-white/5 backdrop-blur-sm p-3 rounded-lg border border-white/30 dark:border-white/10">
            <label class="block text-xs font-semibold text-[#54656f] dark:text-[#8696a0] mb-1 uppercase tracking-wider">PIN / Kode Anda</label>
            <div class="flex items-center justify-between">
              <code class="text-sm font-mono text-[#111b21] dark:text-[#e9edef] truncate mr-2">{{ authStore.user?.uid }}</code>
              <button @click="copyMyCode" class="p-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded hover:bg-blue-200 transition-colors flex-shrink-0" title="Salin Kode">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </button>
            </div>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium text-[#111b21] dark:text-[#e9edef] mb-2">Nama Tampilan</label>
            <input v-model="editName" type="text" class="w-full px-4 py-2.5 bg-white/60 dark:bg-white/10 backdrop-blur-sm border border-white/30 dark:border-white/10 rounded-lg text-[#111b21] dark:text-[#e9edef] focus:outline-none focus:border-blue-500 transition-colors" />
          </div>

          <button @click="saveProfile" :disabled="isSavingProfile" class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50">
            <span v-if="isSavingProfile">Menyimpan...</span>
            <span v-else>Simpan Perubahan</span>
          </button>

        </div>
      </div>

      <!-- Langkah 4D: Modal Buat Grup -->
      <div v-if="showGroupModal" class="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
        <div class="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg w-full max-w-md rounded-2xl shadow-2xl p-6 border border-white/30 dark:border-white/10 mx-4">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-bold">Buat Grup Baru</h3>
            <button @click="showGroupModal = false" class="hover:text-red-500"><svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
          </div>
          <input v-model="groupName" type="text" placeholder="Nama Grup..." class="w-full px-4 py-3 bg-white/60 dark:bg-white/10 backdrop-blur-sm border rounded-lg focus:outline-none focus:border-blue-500 mb-4" />
          
          <h4 class="font-medium mb-2 text-sm">Pilih Anggota:</h4>
          <div class="max-h-40 overflow-y-auto mb-4 custom-scrollbar bg-white/40 dark:bg-black/20 p-2 rounded-lg">
            <label v-for="c in filteredContacts" :key="c.id" class="flex items-center gap-3 p-2 hover:bg-white/50 cursor-pointer rounded">
              <input type="checkbox" :value="c.id" v-model="selectedGroupMembers" class="w-4 h-4 text-blue-600 rounded" />
              <div class="w-8 h-8 rounded-full bg-blue-500 overflow-hidden">
                <img v-if="c.photoURL" :src="c.photoURL" class="w-full h-full object-cover" />
                <span v-else class="text-white text-xs flex items-center justify-center h-full">{{ c.displayName?.charAt(0) }}</span>
              </div>
              <span class="text-sm font-medium">{{ c.displayName }}</span>
            </label>
          </div>

          <button @click="createGroup" class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors">Buat Grup</button>
        </div>
      </div>

      <!-- MODAL VIEWER STORY (STATUS) -->
      <div v-if="activeStory" class="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center backdrop-blur-sm transition-opacity">
        
        <div class="absolute top-4 left-4 right-4 flex gap-1 z-10">
          <div class="h-1 bg-white/30 rounded-full flex-1 overflow-hidden">
            <div class="h-full bg-white animate-[storyProgress_5s_linear_forward]"></div>
          </div>
        </div>

        <div class="absolute top-8 left-4 right-4 flex justify-between items-center z-10">
          <div class="flex items-center gap-2">
            <img v-if="activeStory.userPhoto" :src="activeStory.userPhoto" class="w-10 h-10 rounded-full border border-white/50" />
            <div class="text-white drop-shadow-md">
              <p class="font-bold text-sm">{{ activeStory.userName }}</p>
              <p class="text-xs opacity-70">{{ activeStory.timestamp ? new Date(activeStory.timestamp.toDate()).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : 'Baru saja' }}</p>
            </div>
          </div>
          <button @click="closeStory" class="text-white p-2 hover:bg-white/20 rounded-full"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg></button>
        </div>

        <img :src="activeStory.mediaUrl" class="max-w-full max-h-screen object-contain" />
      </div>
    </div>
  </div>
</template>