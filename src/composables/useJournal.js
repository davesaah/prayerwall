import { ref, watch } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

// Shared state
const entries = ref([])
const loading = ref(true)
let initialized = false
let subscription = null

// Load entries globally
const loadEntries = async () => {
  loading.value = true
  const { data, error } = await supabase
    .from('entries')
    .select('*, afterthoughts(*)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error loading entries:', error.message)
  } else {
    entries.value = data
  }
  loading.value = false
}

// Initialize subscriptions once
const initJournal = () => {
  if (initialized) return
  initialized = true

  loadEntries()

  // Set up realtime subscription
  subscription = supabase
    .channel('journal_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'entries' }, () => {
      loadEntries()
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'afterthoughts' }, () => {
      loadEntries()
    })
    .subscribe()
}

// Watch for auth changes to reload entries if needed
// (Though with current RLS select policy 'true', it's not strictly necessary for viewing, 
// but good practice for when users log in/out)
const { currentUser } = useAuth()
watch(currentUser, (user) => {
  if (user) {
    loadEntries() // Reload when user signs in to ensure correct view
  } else {
    entries.value = [] // Clear when signed out
  }
}, { immediate: true })

// Start initialization
initJournal()

export function useJournal() {
  const { currentUser } = useAuth()

  const addEntry = async (entry) => {
    if (!currentUser.value) return
    
    const { data, error } = await supabase
      .from('entries')
      .insert({
        title: entry.title,
        content: entry.content,
        author_id: currentUser.value.id,
        author_name: currentUser.value.user_metadata?.name || currentUser.value.email?.split('@')[0] || 'Anonymous',
        created_at: entry.created_at || new Date().toISOString()
      })
      .select()

    if (error) {
      console.error('Error adding entry:', error.message)
      return { success: false, error: error.message }
    }
    return { success: true, data: data[0] }
  }

  const getEntry = (id) => {
    return entries.value.find(e => e.id === id)
  }

  const addAfterthought = async (entryId, thought) => {
    const { data, error } = await supabase
      .from('afterthoughts')
      .insert({
        entry_id: entryId,
        content: thought
      })
      .select()

    if (error) {
      console.error('Error adding afterthought:', error.message)
      return { success: false, error: error.message }
    }
    return { success: true, data: data[0] }
  }

  const isOwnEntry = (entry) => {
    return entry && entry.author_id === currentUser.value?.id
  }

  return {
    entries,
    loading,
    addEntry,
    getEntry,
    addAfterthought,
    isOwnEntry
  }
}
