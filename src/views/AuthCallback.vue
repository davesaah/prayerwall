<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = useRouter()

onMounted(async () => {
  // Force Supabase to process OAuth response immediately
  await supabase.auth.getSession()

  // Clean URL completely
  window.history.replaceState({}, document.title, '/')

  // Go to home
  router.replace('/')
})
</script>

<template>
  <div>Signing you in...</div>
</template>
