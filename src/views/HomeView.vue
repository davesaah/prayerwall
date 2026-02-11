<script setup>
import { useRouter } from 'vue-router'
import { useJournal } from '../composables/useJournal'
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, BookOpen } from 'lucide-vue-next'

const router = useRouter()
const { entries } = useJournal()

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
        <h1 class="text-4xl font-bold tracking-tight mb-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          My Journal
        </h1>
        <p class="text-muted-foreground text-lg">
          Capture your thoughts, ideas, and memories.
        </p>
      </div>
      <Button @click="createNewEntry" size="lg" class="shadow-lg hover:shadow-xl transition-all">
        New Entry
      </Button>
    </header>

    <div v-if="entries.length === 0" class="flex flex-col items-center justify-center min-h-[400px] text-center border-2 border-dashed rounded-lg bg-muted/30">
      <div class="max-w-md space-y-4">
        <h3 class="text-2xl font-semibold">No entries yet</h3>
        <p class="text-muted-foreground">Start writing your first journal entry today.</p>
        <Button variant="secondary" @click="createNewEntry">Create Entry</Button>
      </div>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card 
        v-for="entry in entries" 
        :key="entry.id" 
        class="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-muted overflow-hidden"
        @click="openEntry(entry.id)"
      >
        <CardHeader class="space-y-3">
          <div class="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar class="w-3.5 h-3.5" />
            <span>{{ formatDate(entry.date) }}</span>
          </div>
          <div class="flex items-start gap-3">
            <div class="mt-1 text-primary/80">
              <BookOpen class="w-5 h-5" />
            </div>
            <CardTitle class="text-xl group-hover:text-primary transition-colors leading-tight">
              {{ entry.title || 'Untitled Entry' }}
            </CardTitle>
          </div>
        </CardHeader>
      </Card>
    </div>
  </div>
</template>
