<script setup>
import { ref, onMounted } from 'vue'
import { Sun, Moon } from 'lucide-vue-next'
import { Button } from './ui/button'

const isDark = ref(false)

onMounted(() => {
  // Check localStorage or system preference
  const savedTheme = localStorage.getItem('theme')
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  
  if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
    isDark.value = true
    document.documentElement.classList.add('dark')
  } else {
    isDark.value = false
    document.documentElement.classList.remove('dark')
  }
})

const toggleTheme = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}
</script>

<template>
  <Button 
    variant="ghost" 
    size="icon" 
    @click="toggleTheme" 
    class="rounded-full w-10 h-10 transition-all duration-300 hover:bg-accent"
    :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
  >
    <Sun v-if="isDark" class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
    <Moon v-else class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
    <span class="sr-only">Toggle theme</span>
  </Button>
</template>
