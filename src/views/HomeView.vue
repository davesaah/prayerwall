<script setup>
import { useRouter } from 'vue-router'
import { useJournal } from '../composables/useJournal'
import { useAuth } from '../composables/useAuth'
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, BookOpen, LogOut, Loader2 } from 'lucide-vue-next'

const router = useRouter()
const { entries, loading: journalLoading } = useJournal()
const { currentUser, logout, loading: authLoading } = useAuth()

const handleLogout = async () => {
  await logout()
  router.push('/login')
}

const formatDate = (dateString) => {
  if (!dateString) return 'No date'
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString(undefined, options)
}

const createNewEntry = () => {
  router.push('/new')
}

const openEntry = (id) => {
  router.push(`/entry/${id}`)
}

const getUserDisplayName = (user) => {
  if (!user) return ''
  return user.user_metadata?.name || user.email?.split('@')[0] || 'User'
}
</script>

<template>
  <div class="container max-w-6xl mx-auto py-6 md:py-8 px-4">
    <header class="mb-8 md:mb-12">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 class="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Journal
          </h1>
          <p class="text-muted-foreground text-sm md:text-base font-medium tracking-tight">
            Welcome back, <span class="text-foreground">{{ getUserDisplayName(currentUser) }}</span>!
          </p>
        </div>
        <div class="flex items-center gap-2 sm:gap-3">
          <Button @click="createNewEntry" class="flex-1 sm:flex-none gap-2 shadow-lg shadow-primary/20 h-11 md:h-12 px-4 md:px-6">
            <BookOpen class="w-4 h-4 md:w-5 md:h-5" />
            <span class="text-sm md:text-base">New Entry</span>
          </Button>
          <Button @click="handleLogout" variant="outline" class="gap-2 border-primary/20 hover:bg-primary/5 h-11 md:h-12 px-4 md:px-6">
            <LogOut class="w-4 h-4" />
            <span class="hidden sm:inline text-sm md:text-base">Logout</span>
          </Button>
        </div>
      </div>
    </header>

    <div v-if="journalLoading || authLoading" class="flex flex-col items-center justify-center min-h-[400px]">
      <Loader2 class="w-12 h-12 text-primary animate-spin mb-4" />
      <p class="text-muted-foreground animate-pulse">Loading your thoughts...</p>
    </div>

    <div v-else-if="entries.length === 0" class="flex flex-col items-center justify-center min-h-[400px] text-center border-2 border-dashed rounded-2xl bg-muted/20 border-primary/10 transition-colors hover:border-primary/20 p-8">
      <div class="max-w-md space-y-6">
        <div class="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <BookOpen class="w-8 h-8 text-primary" />
        </div>
        <div class="space-y-2">
          <h3 class="text-2xl font-semibold">No entries yet</h3>
          <p class="text-muted-foreground">Your digital garden is empty. Let's plant your first memory today.</p>
        </div>
        <Button size="lg" @click="createNewEntry" class="px-8">Create First Entry</Button>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card 
        v-for="entry in entries" 
        :key="entry.id" 
        class="group cursor-pointer hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-primary/5 hover:border-primary/20 overflow-hidden bg-card/50 backdrop-blur-sm"
        @click="openEntry(entry.id)"
      >
        <CardHeader class="space-y-4">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2 text-xs font-medium text-muted-foreground/80">
              <Calendar class="w-3.5 h-3.5 text-primary" />
              <span>{{ formatDate(entry.created_at) }}</span>
            </div>
            <span 
              class="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold"
              :class="entry.author_id === currentUser?.id 
                ? 'bg-primary/10 text-primary border border-primary/20' 
                : 'bg-muted text-muted-foreground'"
            >
              {{ entry.author_name || 'Anonymous' }}
            </span>
          </div>
          <div class="flex items-start gap-3">
            <CardTitle class="text-xl group-hover:text-primary transition-colors leading-tight line-clamp-2">
              {{ entry.title || 'Untitled Entry' }}
            </CardTitle>
          </div>
        </CardHeader>
      </Card>
    </div>
  </div>
</template>
