<script setup>
import { onMounted } from 'vue'
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
import { Calendar, BookOpen, CheckCircle2, LogOut } from 'lucide-vue-next'
import ThemeToggle from '@/components/ThemeToggle.vue'

const router = useRouter()
const { entries, fetchEntries, loading } = useJournal()
const { currentUser, logout, isAuthenticated } = useAuth()

onMounted(() => {
  fetchEntries()
})

const handleLogout = async () => {
  await logout()
  router.push('/login')
}

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(dateString).toLocaleDateString(undefined, options)
}

const truncate = (text, length = 100) => {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

const createNewEntry = () => {
  router.push('/new')
}

const openEntry = (id) => {
  router.push(`/entry/${id}`)
}
</script>

<template>
  <div class="container max-w-5xl mx-auto py-12 px-4">
    <header class="flex justify-between items-center mb-12">
      <div>
        <h1 class="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          Prayer Wall
        </h1>
        <p class="text-muted-foreground text-lg">
          Share your prayer requests and see how God is moving.
        </p>
      </div>
      <div class="flex items-center gap-4">
        <ThemeToggle />
        <template v-if="isAuthenticated">
          <Button @click="createNewEntry" size="lg" class="shadow-lg hover:shadow-xl transition-all">
            New Prayer Request
          </Button>
          <Button variant="ghost" size="icon" @click="handleLogout" title="Logout">
            <LogOut class="w-5 h-5" />
          </Button>
        </template>
        <template v-else>
          <Button @click="router.push('/login')" variant="outline" size="lg">
            Sign In to Share
          </Button>
        </template>
      </div>
    </header>

    <div v-if="loading" class="flex justify-center items-center min-h-[400px]">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="entries.length === 0" class="flex flex-col items-center justify-center min-h-[400px] text-center border-2 border-dashed rounded-lg bg-muted/30">
      <div class="max-w-md space-y-4">
        <h3 class="text-2xl font-semibold">No prayer requests yet</h3>
        <p class="text-muted-foreground">Be the first to share a prayer request today.</p>
        <Button variant="secondary" @click="createNewEntry">Share Request</Button>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card 
        v-for="entry in entries" 
        :key="entry.id" 
        class="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-muted overflow-hidden relative"
        @click="openEntry(entry.id)"
      >
        <div v-if="entry.is_answered" class="absolute top-0 right-0 p-2 text-green-600">
          <CheckCircle2 class="w-5 h-5 shadow-sm" />
        </div>
        <CardHeader class="space-y-3">
          <div class="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar class="w-3.5 h-3.5" />
            <span>{{ formatDate(entry.created_at) }}</span>
            <span v-if="currentUser && entry.user_id === currentUser.id" class="ml-auto bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">Owner</span>
          </div>
          <div class="flex items-start gap-3">
            <div class="mt-1 text-primary/80">
              <BookOpen class="w-5 h-5" />
            </div>
            <CardTitle class="text-xl group-hover:text-primary transition-colors leading-tight">
              {{ entry.title || 'Untitled Request' }}
            </CardTitle>
          </div>
        </CardHeader>
      </Card>
    </div>
  </div>
</template>
