import { defineStore } from 'pinia'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore' // Tambahan Firestore

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isLoading: false,
    errorMsg: null
  }),
  
  actions: {
    // 1. Fungsi Login (yang sudah ada)
    async login(email, password) {
      this.isLoading = true
      this.errorMsg = null
      try {
        const { $auth } = useNuxtApp()
        const userCredential = await signInWithEmailAndPassword($auth, email, password)
        this.user = userCredential.user
        navigateTo('/chat') 
      } catch (error) {
        this.errorMsg = "Email atau kata sandi salah."
      } finally {
        this.isLoading = false
      }
    },

    // 2. FUNGSI BARU: Register
    async register(name, email, password) {
      this.isLoading = true
      this.errorMsg = null
      try {
        const { $auth, $db } = useNuxtApp()
        
        // Buat akun di Authentication
        const userCredential = await createUserWithEmailAndPassword($auth, email, password)
        const user = userCredential.user

        // Update nama profil
        await updateProfile(user, { displayName: name })

        // Simpan data user ke database Firestore
        await setDoc(doc($db, "users", user.uid), {
          uid: user.uid,
          displayName: name,
          email: email,
          photoURL: "", 
          lastActive: serverTimestamp()
        })

        this.user = user
        navigateTo('/chat')
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          this.errorMsg = "Email ini sudah terdaftar."
        } else if (error.code === 'auth/weak-password') {
          this.errorMsg = "Kata sandi minimal 6 karakter."
        } else {
          this.errorMsg = "Gagal mendaftar. Silakan coba lagi."
        }
      } finally {
        this.isLoading = false
      }
    },

    // 3. Fungsi Logout
    async logout() {
      try {
        const { $auth } = useNuxtApp()
        await signOut($auth)
        this.user = null
        navigateTo('/login')
      } catch (error) {
        console.error("Logout error:", error.message)
      }
    }
  }
})