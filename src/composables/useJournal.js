import { ref } from 'vue'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

const entries = ref([])
const loading = ref(false)

export function useJournal() {
  const { currentUser } = useAuth()

  const fetchEntries = async () => {
    loading.value = true
    const { data, error } = await supabase
      .from('prayer_requests')
      .select('*, afterthoughts(*), testimonies(*)')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching entries:', error.message)
    } else {
      entries.value = data
    }
    loading.value = false
  }

  const addEntry = async (entry) => {
    if (!currentUser.value) return { error: 'Must be logged in' }

    const { data, error } = await supabase
      .from('prayer_requests')
      .insert([
        {
          user_id: currentUser.value.id,
          title: entry.title,
          content: entry.content,
        }
      ])
      .select()

    if (error) {
      console.error('Error adding entry:', error.message)
      return { error: error.message }
    }
    
    await fetchEntries()
    return { success: true, data: data[0] }
  }

  const updateEntry = async (id, updatedFields) => {
    const { error } = await supabase
      .from('prayer_requests')
      .update({
        ...updatedFields,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      console.error('Error updating entry:', error.message)
      return { error: error.message }
    }

    await fetchEntries()
    return { success: true }
  }

  const markAsAnswered = async (id) => {
    return await updateEntry(id, { is_answered: true })
  }

  const deleteEntry = async (id) => {
    const { error } = await supabase
      .from('prayer_requests')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting entry:', error.message)
      return { error: error.message }
    }

    await fetchEntries()
    return { success: true }
  }

  const getEntry = (id) => {
    return entries.value.find(e => e.id === id)
  }

  const addAfterthought = async (entryId, content) => {
    if (!currentUser.value) return { error: 'Must be logged in' }

    const { error } = await supabase
      .from('afterthoughts')
      .insert([
        {
          prayer_request_id: entryId,
          user_id: currentUser.value.id,
          content: content,
        }
      ])

    if (error) {
      console.error('Error adding afterthought:', error.message)
      return { error: error.message }
    }

    await fetchEntries()
    return { success: true }
  }

  const addTestimony = async (entryId, content) => {
    if (!currentUser.value) return { error: 'Must be logged in' }

    const { error } = await supabase
      .from('testimonies')
      .insert([
        {
          prayer_request_id: entryId,
          user_id: currentUser.value.id,
          content: content,
        }
      ])

    if (error) {
      console.error('Error adding testimony:', error.message)
      return { error: error.message }
    }

    await fetchEntries()
    return { success: true }
  }

  return {
    entries,
    loading,
    fetchEntries,
    addEntry,
    updateEntry,
    deleteEntry,
    getEntry,
    addAfterthought,
    addTestimony,
    markAsAnswered
  }
}
