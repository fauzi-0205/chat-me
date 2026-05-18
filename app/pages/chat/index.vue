<script setup>
import { computed, watch, ref, nextTick } from 'vue'
import { updateProfile, onAuthStateChanged } from 'firebase/auth'
import { useAuthStore } from '~/stores/auth'
// Langkah 2A: Tambahkan deleteDoc di import
import { collection, query, onSnapshot, doc, updateDoc, getDoc, arrayUnion, arrayRemove, setDoc, addDoc, serverTimestamp, orderBy, writeBatch, deleteDoc } from 'firebase/firestore'

definePageMeta({ layout: 'chat' })

const authStore = useAuthStore()
const selectedChat = ref(null)

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

// --- FITUR HAPUS LIST CHAT SEBELAH KIRI ---
const removeContact = async (contactId, e) => {
  e.stopPropagation() // Mencegah chat terbuka saat mengklik tombol hapus
  if (!confirm("Yakin ingin menghapus obrolan ini dari daftar?")) return
  
  const { $db } = useNuxtApp()
  try {
    // Menghapus ID teman dari array contacts kita di Firestore
    await updateDoc(doc($db, "users", authStore.user.uid), {
      contacts: arrayRemove(contactId) 
    })
    
    // Jika chat yang sedang dibuka yang dihapus, otomatis tutup chatnya
    if (selectedChat.value?.id === contactId) {
      selectedChat.value = null
    }
  } catch (error) {
    console.error("Gagal menghapus kontak:", error)
    alert("Gagal menghapus daftar obrolan.")
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
    el.classList.add('bg-blue-200')
    setTimeout(() => el.classList.remove('bg-blue-200'), 2000)
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

// Computed untuk story user sendiri
const myStory = computed(() => activeStories.value.find(s => s.userId === authStore.user.uid))

// Computed untuk story kontak lain
const contactStories = computed(() => activeStories.value.filter(s => s.userId !== authStore.user.uid))

const handleLogout = async () => {
  await authStore.logout()
}

onMounted(() => {
  document.documentElement.classList.remove('dark') // Pastikan selalu light mode
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
  <div class="h-dvh w-full p-4 md:p-6 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-gray-100">
    <div class="flex h-full w-full max-w-7xl mx-auto bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100">
      
      <!-- PANEL KIRI: SIDEBAR CARD GRID -->
      <div class="w-full md:w-[420px] flex-shrink-0 bg-white/80 backdrop-blur-sm border-r border-gray-100 flex flex-col transition-all duration-300" :class="{'hidden md:flex': selectedChat, 'flex': !selectedChat}">
        
        <!-- HEADER MINIMAL DENGAN PROFIL & AKSI -->
        <div class="flex items-center justify-between px-5 py-4 bg-white/90 backdrop-blur-md border-b border-gray-100">
          <div class="flex items-center gap-3 cursor-pointer" @click="openProfileModal">
            <div class="w-10 h-10 rounded-full overflow-hidden bg-blue-500 ring-2 ring-blue-100 shadow-sm flex items-center justify-center">
              <img v-if="authStore.user?.photoURL" :src="authStore.user.photoURL" alt="Profile" class="w-full h-full object-cover" />
              <span v-else class="text-white font-bold text-lg">{{ authStore.user?.displayName?.charAt(0).toUpperCase() || 'U' }}</span>
            </div>
            <span class="font-semibold text-gray-800">{{ authStore.user?.displayName }}</span>
          </div>
          <div class="flex gap-1">
            <button @click="showAddModal = true" class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Tambah Kontak">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>
            </button>
            <button @click="showGroupModal = true" class="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors" title="Buat Grup">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </button>
            <button @click="handleLogout" class="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors" title="Keluar">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
          </div>
        </div>

        <!-- STORY BAR (DIPERBAIKI: Tidak ada duplikasi) -->
        <div class="px-5 py-3 border-b border-gray-50 bg-white/70 flex gap-4 overflow-x-auto custom-scrollbar">
          
          <!-- Story Saya Sendiri (Kondisional) -->
          <template v-if="myStory">
            <div @click="viewStory(myStory)" class="flex flex-col items-center gap-1 cursor-pointer flex-shrink-0">
              <div class="w-12 h-12 rounded-full overflow-hidden bg-blue-600 ring-2 ring-blue-500 ring-offset-2">
                <img v-if="authStore.user?.photoURL" :src="authStore.user.photoURL" class="w-full h-full object-cover" />
                <span v-else class="flex h-full w-full items-center justify-center text-white font-bold">{{ authStore.user?.displayName?.charAt(0) }}</span>
              </div>
              <span class="text-[11px] text-gray-500 font-medium">Anda</span>
            </div>
          </template>
          <template v-else>
            <div class="flex flex-col items-center gap-1 cursor-pointer flex-shrink-0 relative" @click="() => storyFileInput.click()">
              <input type="file" accept="image/*" ref="storyFileInput" class="hidden" @change="handleStoryUpload" />
              <div class="w-12 h-12 rounded-full overflow-hidden bg-blue-600 relative ring-2 ring-blue-100">
                <img v-if="authStore.user?.photoURL" :src="authStore.user.photoURL" class="w-full h-full object-cover opacity-70" />
                <span v-else class="flex h-full w-full items-center justify-center text-white font-bold">{{ authStore.user?.displayName?.charAt(0) }}</span>
                <div class="absolute inset-0 flex items-center justify-center bg-black/20 text-white font-bold text-xl">+</div>
              </div>
              <span class="text-[11px] text-gray-500 font-medium">Status Saya</span>
            </div>
          </template>

          <!-- Story Kontak (Tanpa User Sendiri) -->
          <div v-for="story in contactStories" :key="story.id" @click="viewStory(story)" class="flex flex-col items-center gap-1 cursor-pointer flex-shrink-0">
            <div class="w-12 h-12 rounded-full overflow-hidden bg-gray-300 ring-2 ring-blue-500 ring-offset-2">
              <img v-if="story.userPhoto" :src="story.userPhoto" class="w-full h-full object-cover" />
              <span v-else class="flex h-full w-full items-center justify-center text-white bg-blue-500 font-bold">{{ story.userName?.charAt(0) }}</span>
            </div>
            <span class="text-[11px] text-gray-500 font-medium w-12 truncate text-center">{{ story.userName }}</span>
          </div>
        </div>

        <!-- CARD GRID KONTAK (DIPERBAIKI: Hilangkan dot online palsu) -->
        <div class="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div v-for="c in filteredContacts" :key="c.id" 
                 @click="selectedChat = c"
                 class="group relative flex flex-col items-center p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100"
                 :class="selectedChat?.id === c.id ? 'ring-2 ring-blue-200 bg-blue-50/50' : ''">
              
              <!-- Delete button -->
              <button @click="(e) => removeContact(c.id, e)"
                      class="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>

              <!-- Avatar TANPA status dot -->
              <div class="mb-3">
                <div class="w-16 h-16 rounded-full overflow-hidden shadow-sm" :class="c.isGroup ? 'bg-green-500' : 'bg-blue-500'">
                  <img v-if="c.photoURL" :src="c.photoURL" class="w-full h-full object-cover" />
                  <span v-else class="flex h-full w-full items-center justify-center text-white font-bold text-xl">
                    <template v-if="c.isGroup">👥</template>
                    <template v-else>{{ c.displayName?.charAt(0) }}</template>
                  </span>
                </div>
              </div>

              <!-- Nama -->
              <h4 class="font-semibold text-gray-800 text-center truncate w-full mb-1">{{ c.displayName }}</h4>
              
              <!-- Preview pesan terakhir -->
              <p class="text-xs text-gray-500 truncate w-full text-center mb-1">
                <span v-if="chatSummaries[getChatIdForSummary(c)]">
                  <span v-if="chatSummaries[getChatIdForSummary(c)].lastSenderId === authStore.user.uid" class="mr-1 text-blue-500">✓</span>
                  {{ chatSummaries[getChatIdForSummary(c)].lastMessage }}
                </span>
                <span v-else>Belum ada obrolan</span>
              </p>

              <!-- Timestamp -->
              <p class="text-[10px] text-gray-400">
                {{ chatSummaries[getChatIdForSummary(c)]?.timestamp?.toDate ? new Date(chatSummaries[getChatIdForSummary(c)].timestamp.toDate()).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- PANEL KANAN: CHAT AREA -->
      <div class="flex-1 flex flex-col bg-white min-w-0">
        <!-- Placeholder jika tidak ada chat yang dipilih -->
        <div v-if="!selectedChat" class="flex-1 flex flex-col items-center justify-center bg-gray-50">
          <div class="text-center px-6">
            <div class="w-20 h-20 rounded-full bg-blue-100 mx-auto mb-4 flex items-center justify-center">
              <svg class="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            </div>
            <h3 class="text-2xl font-light text-gray-700">WorkspaceChat</h3>
            <p class="text-sm text-gray-400 mt-2">Pilih kontak untuk mulai chatting</p>
          </div>
        </div>

        <template v-else>
          <!-- HEADER MINIMAL CHAT (DIPERBAIKI: Status kondisional) -->
          <div class="flex items-center gap-3 px-6 py-4 bg-white border-b border-gray-100 shadow-sm">
            <button @click="selectedChat = null" class="md:hidden p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-500">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <div class="w-10 h-10 rounded-full overflow-hidden flex-shrink-0" :class="selectedChat.isGroup ? 'bg-green-500' : 'bg-blue-500'">
              <img v-if="selectedChat.photoURL" :src="selectedChat.photoURL" class="w-full h-full object-cover" />
              <span v-else class="flex h-full w-full items-center justify-center text-white font-bold">
                <template v-if="selectedChat.isGroup">👥</template>
                <template v-else>{{ selectedChat.displayName?.charAt(0) }}</template>
              </span>
            </div>
            <div>
              <h3 class="font-medium text-gray-800 leading-tight">{{ selectedChat.displayName }}</h3>
              <span v-if="selectedChat.isGroup" class="text-xs text-blue-500">👥 Grup</span>
              <span v-else class="text-xs text-gray-400">Offline</span>
            </div>
          </div>

          <!-- AREA PESAN -->
          <div ref="chatContainerRef" class="flex-1 overflow-y-auto px-6 py-4 bg-gray-50 custom-scrollbar">
            <div class="flex flex-col gap-2 min-h-full justify-end">
              <div v-for="m in messages" :id="`msg-${m.id}`" :key="m.id" @dblclick="replyingTo = m" class="flex w-full transition-all duration-300" :class="m.senderId === authStore.user.uid ? 'justify-end' : 'justify-start'">
                <div class="px-4 py-2.5 max-w-[75%] shadow-sm relative group rounded-2xl"
                     :class="m.senderId === authStore.user.uid ? 'bg-blue-100 rounded-br-none' : 'bg-white border border-gray-100 rounded-bl-none'">
                  
                  <!-- Reply context -->
                  <div v-if="m.replyTo" @click="scrollToMsg(m.replyTo.id)" class="mb-2 p-2 bg-black/5 border-l-4 border-blue-500 rounded text-[11px] opacity-80 cursor-pointer hover:opacity-100">
                    <p class="font-bold text-blue-600">{{ m.replyTo.sender }}</p>
                    <p class="truncate text-gray-600">{{ m.replyTo.text || '📷 Gambar' }}</p>
                  </div>
                  
                  <!-- Media -->
                  <template v-if="m.mediaUrl">
                    <audio v-if="m.type === 'audio'" :src="m.mediaUrl" controls class="max-w-[220px] h-10 mb-1"></audio>
                    <img v-else :src="m.mediaUrl" class="rounded-lg max-h-64 mb-2 block mx-auto" @load="scrollToBottom" />
                  </template>
                  
                  <p v-if="m.text" class="text-sm pr-14 whitespace-pre-wrap text-gray-800">{{ m.text }}</p>
                  
                  <!-- Waktu + status centang -->
                  <div class="text-[9px] text-gray-400 absolute right-2 bottom-1.5 flex items-center gap-1">
                    <span>{{ m.timestamp ? new Date(m.timestamp.toDate()).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '...' }}</span>
                    <span v-if="m.senderId === authStore.user.uid">
                      <svg v-if="m.status === 'read'" class="w-3 h-3 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L7 17l-5-5 M22 6l-5 5"/></svg>
                      <svg v-else class="w-3 h-3 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>
                    </span>
                  </div>

                  <!-- Hapus pesan -->
                  <button v-if="m.senderId === authStore.user.uid" @click.stop="deleteMessage(m.id)" class="absolute -left-8 top-1/2 -translate-y-1/2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- INPUT AREA: FLOATING PILL (DIPERBAIKI: flex-shrink-0 + min-w-0) -->
          <div class="flex-shrink-0 bg-white border-t border-gray-100 px-4 md:px-6 py-4 relative">
            <!-- Preview Gambar -->
            <div v-if="imagePreviewUrl" class="absolute bottom-24 left-1/2 -translate-x-1/2 w-auto max-w-md p-3 bg-white shadow-xl rounded-xl border border-gray-200 z-20">
              <div class="relative">
                <img :src="imagePreviewUrl" class="h-32 object-contain rounded-lg mx-auto" />
                <button @click="cancelImage" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg></button>
              </div>
              <p class="text-xs text-center mt-2 text-gray-400">Tambahkan teks lalu tekan Enter</p>
            </div>

            <!-- Reply indicator -->
            <div v-if="replyingTo" class="mb-2 p-2 bg-blue-50 border-l-4 border-blue-500 flex justify-between rounded-lg">
              <div class="text-xs truncate"><p class="font-bold text-blue-600">Balas {{ replyingTo.senderId === authStore.user.uid ? 'Anda' : selectedChat.displayName }}</p><p class="truncate text-gray-600">{{ replyingTo.text || '📷 Gambar' }}</p></div>
              <button @click="replyingTo = null" class="text-gray-400 hover:text-gray-600 flex-shrink-0"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg></button>
            </div>

            <!-- Floating pill input (DIPERBAIKI) -->
            <div class="flex items-center gap-1.5 bg-white rounded-full shadow-lg border border-gray-200 p-1.5 pl-4 min-w-0">
              <label class="cursor-pointer text-gray-400 hover:text-blue-500 transition-colors flex-shrink-0">
                <input type="file" accept="image/*" class="hidden" @change="handleImageSelect" />
                <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              </label>
              <input v-model="newMessage" @keyup.enter="sendMessage()" type="text" placeholder="Ketik pesan..." class="flex-1 bg-transparent px-2 py-2 outline-none text-sm text-gray-800 placeholder-gray-400 min-w-0" />
              
              <button v-if="newMessage.trim() || imagePreviewUrl" @click="sendMessage()" class="text-blue-500 p-2 hover:bg-blue-50 rounded-full transition-colors flex-shrink-0">
                <svg class="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              </button>
              
              <button v-else 
                @mousedown="startRecording" 
                @mouseup="stopRecording" 
                @mouseleave="stopRecording" 
                @touchstart="startRecording" 
                @touchend="stopRecording"
                class="p-2 transition-colors rounded-full flex-shrink-0" 
                :class="isRecording ? 'text-red-500 animate-pulse bg-red-50' : 'text-gray-400 hover:bg-gray-100'">
                <svg class="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              </button>
            </div>
          </div>
        </template>
      </div>

      <!-- MODAL TAMBAH KONTAK -->
      <div v-if="showAddModal" class="absolute inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
        <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-gray-100 mx-4">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-bold text-gray-800">Hubungkan Kontak</h3>
            <button @click="showAddModal = false" class="text-gray-400 hover:text-red-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <div class="mb-6 bg-blue-50 p-4 rounded-lg text-center">
            <p class="text-sm text-gray-500 mb-2">Kode Anda (Bagikan untuk di-add teman)</p>
            <div class="flex items-center justify-center gap-2">
              <code class="text-lg font-mono font-bold text-blue-600">{{ authStore.user?.uid?.substring(0,8) }}...</code>
              <button @click="copyMyCode" class="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors" title="Salin Kode Lengkap">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </button>
            </div>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Masukkan Kode Teman</label>
            <input v-model="friendCode" type="text" placeholder="Paste kode UID teman..." class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-blue-500 transition-colors" />
          </div>

          <button @click="handleAddContact" :disabled="isAdding || !friendCode" class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <span v-if="isAdding">Menghubungkan...</span>
            <span v-else>Tambahkan Teman</span>
          </button>
        </div>
      </div>

      <!-- MODAL EDIT PROFIL -->
      <div v-if="showProfileModal" class="absolute inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
        <div class="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 border border-gray-100 mx-4">
          
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-bold text-gray-800">Profil Saya</h3>
            <button @click="showProfileModal = false" class="text-gray-400 hover:text-red-500 transition-colors">
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
            <p class="text-xs text-gray-400">Klik foto untuk mengubah</p>
          </div>

          <div class="mb-5 bg-gray-50 p-3 rounded-lg border border-gray-200">
            <label class="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">PIN / Kode Anda</label>
            <div class="flex items-center justify-between">
              <code class="text-sm font-mono text-gray-800 truncate mr-2">{{ authStore.user?.uid }}</code>
              <button @click="copyMyCode" class="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors flex-shrink-0" title="Salin Kode">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </button>
            </div>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Nama Tampilan</label>
            <input v-model="editName" type="text" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-blue-500 transition-colors" />
          </div>

          <button @click="saveProfile" :disabled="isSavingProfile" class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50">
            <span v-if="isSavingProfile">Menyimpan...</span>
            <span v-else>Simpan Perubahan</span>
          </button>

        </div>
      </div>

      <!-- MODAL BUAT GRUP -->
      <div v-if="showGroupModal" class="absolute inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
        <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-gray-100 mx-4">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-bold text-gray-800">Buat Grup Baru</h3>
            <button @click="showGroupModal = false" class="text-gray-400 hover:text-red-500"><svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
          </div>
          <input v-model="groupName" type="text" placeholder="Nama Grup..." class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 mb-4 text-gray-800" />
          
          <h4 class="font-medium mb-2 text-sm text-gray-700">Pilih Anggota:</h4>
          <div class="max-h-40 overflow-y-auto mb-4 custom-scrollbar bg-gray-50 p-2 rounded-lg">
            <label v-for="c in filteredContacts" :key="c.id" class="flex items-center gap-3 p-2 hover:bg-white cursor-pointer rounded">
              <input type="checkbox" :value="c.id" v-model="selectedGroupMembers" class="w-4 h-4 text-blue-600 rounded" />
              <div class="w-8 h-8 rounded-full bg-blue-500 overflow-hidden flex-shrink-0">
                <img v-if="c.photoURL" :src="c.photoURL" class="w-full h-full object-cover" />
                <span v-else class="text-white text-xs flex items-center justify-center h-full">{{ c.displayName?.charAt(0) }}</span>
              </div>
              <span class="text-sm font-medium text-gray-700">{{ c.displayName }}</span>
            </label>
          </div>

          <button @click="createGroup" class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors">Buat Grup</button>
        </div>
      </div>

      <!-- MODAL VIEWER STORY -->
      <div v-if="activeStory" class="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center backdrop-blur-sm">
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