<script setup>
import { RouterView } from 'vue-router'
import { useAuth } from './composables/useAuth'
import { Loader2 } from 'lucide-vue-next'

const { loading } = useAuth()
</script>

<template>
  <div v-if="loading" class="min-h-screen flex flex-col items-center justify-center bg-background">
    <Loader2 class="w-12 h-12 text-primary animate-spin mb-4" />
    <p class="text-muted-foreground font-medium animate-pulse">Initializing Journal...</p>
  </div>
  <RouterView v-else v-slot="{ Component }">
    <Transition name="fade" mode="out-in">
      <component :is="Component" />
    </Transition>
  </RouterView>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Global scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: hsl(var(--muted));
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--muted-foreground) / 0.3);
}
</style>
