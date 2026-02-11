import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

// Shared state
const currentUser = ref(null)
const loading = ref(true)
let initialized = false

// Initialize auth state once globally
let authPromise = null

const initAuth = async () => {
  if (authPromise) return authPromise

  authPromise = (async () => {
    // Check current session
    const { data: { session } } = await supabase.auth.getSession()
    currentUser.value = session?.user ?? null
    loading.value = false

    // Listen for changes
    supabase.auth.onAuthStateChange((_event, session) => {
      currentUser.value = session?.user ?? null
    })

    return true
  })()

  return authPromise
}

// Start initialization immediately
initAuth()

export function useAuth() {
  const isAuthenticated = computed(() => currentUser.value !== null)
  const authReady = () => authPromise

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Login error:', error.message)
      return { success: false, error: error.message }
    }

    return { success: true }
  }

  const loginWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })

    if (error) {
      console.error('Google login error:', error.message)
      return { success: false, error: error.message }
    }

    return { success: true }
  }

  const signup = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      console.error('Signup error:', error.message)
      return { success: false, error: error.message }
    }

    return { success: true }
  }

  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Logout error:', error.message)
    }
    currentUser.value = null
  }

  return {
    currentUser,
    isAuthenticated,
    loading,
    authReady,
    login,
    loginWithGoogle,
    signup,
    logout
  }
}
