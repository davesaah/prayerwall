<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useJournal } from '../composables/useJournal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@/components/ui/card'
import { ArrowLeft, MessageSquare, Send, Bold, Italic, Heading1, Heading2, List, ListOrdered, Link, Quote, Book, Search, X, Loader2 } from 'lucide-vue-next'
import { marked } from 'marked'

const route = useRoute()
const router = useRouter()
const { getEntry, addAfterthought, addTestimony } = useJournal()

const entry = computed(() => getEntry(route.params.id))
const newEncouragement = ref('')
const newTestimony = ref('')
const activeSection = ref('encouragement') // 'encouragement' or 'testimony'

// Bible Integration State
const isBibleModalOpen = ref(false)
const bibleSearchQuery = ref('')
const bibleSearchResult = ref(null)
const isSearchingBible = ref(false)
const bibleError = ref('')

// Configure marked for better rendering
marked.setOptions({
  breaks: true,
  gfm: true,
})

const renderedContent = computed(() => {
  if (!entry.value?.content) return ''
  return marked(entry.value.content)
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
  return new Date(dateString).toLocaleDateString(undefined, options)
}

const formatRelativeDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return new Date(dateString).toLocaleDateString(undefined, { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

const goBack = () => {
  router.back()
}

const submitEncouragement = () => {
  if (!newEncouragement.value.trim()) return
  addAfterthought(entry.value.id, newEncouragement.value.trim())
  newEncouragement.value = ''
}

const submitTestimony = () => {
  if (!newTestimony.value.trim()) return
  addTestimony(entry.value.id, newTestimony.value.trim())
  newTestimony.value = ''
}

// Bible Search Logic
const searchBible = async () => {
  if (!bibleSearchQuery.value.trim()) return
  
  isSearchingBible.value = true
  bibleError.value = ''
  bibleSearchResult.value = null
  
  try {
    const response = await fetch(`https://bible-api.com/${encodeURIComponent(bibleSearchQuery.value)}`)
    if (!response.ok) throw new Error('Verse not found. Please check the reference.')
    const data = await response.json()
    bibleSearchResult.value = data
  } catch (err) {
    bibleError.value = err.message
  } finally {
    isSearchingBible.value = false
  }
}

const closeBibleModal = () => {
  isBibleModalOpen.value = false
  bibleSearchQuery.value = ''
  bibleSearchResult.value = null
  bibleError.value = ''
}

const insertVerse = () => {
  if (!bibleSearchResult.value) return
  
  const reference = bibleSearchResult.value.reference
  const text = bibleSearchResult.value.text.trim()
  const formattedVerse = `\n\n> "${text}" — ${reference}\n\n`
  
  // We always insert into encouragement when using the bible button
  newEncouragement.value += formattedVerse
  closeBibleModal()
}

// Formatting functions for editors
const insertMarkdown = (target, before, after = '') => {
  const textarea = document.getElementById(target === 'encouragement' ? 'encouragement-editor' : 'testimony-editor')
  if (!textarea) return
  
  const currentVal = target === 'encouragement' ? newEncouragement.value : newTestimony.value
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = currentVal.substring(start, end)
  
  const newText = before + selectedText + after
  const newContent = 
    currentVal.substring(0, start) + 
    newText + 
    currentVal.substring(end)
  
  if (target === 'encouragement') {
    newEncouragement.value = newContent
  } else {
    newTestimony.value = newContent
  }
  
  // Set cursor position
  setTimeout(() => {
    const newCursorPos = selectedText 
      ? start + newText.length 
      : start + before.length
    textarea.focus()
    textarea.setSelectionRange(newCursorPos, newCursorPos)
  }, 0)
}

const formatActions = [
  { icon: Bold, handler: (target) => insertMarkdown(target, '**', '**'), label: 'Bold' },
  { icon: Italic, handler: (target) => insertMarkdown(target, '*', '*'), label: 'Italic' },
  { icon: Heading1, handler: (target) => insertMarkdown(target, '# '), label: 'Heading 1' },
  { icon: Heading2, handler: (target) => insertMarkdown(target, '## '), label: 'Heading 2' },
  { icon: List, handler: (target) => insertMarkdown(target, '- '), label: 'Bullet List' },
  { icon: ListOrdered, handler: (target) => insertMarkdown(target, '1. '), label: 'Numbered List' },
  { icon: Link, handler: (target) => insertMarkdown(target, '[', '](url)'), label: 'Link' },
  { icon: Quote, handler: (target) => insertMarkdown(target, '> '), label: 'Quote' },
  { 
    icon: Book, 
    handler: (target) => {
      if (target === 'encouragement') isBibleModalOpen.value = true
    }, 
    label: 'Bible Verse' 
  },
]

</script>

<template>
  <div v-if="entry" class="container max-w-3xl mx-auto py-12 px-4">
    <header class="flex justify-between items-center mb-8">
      <Button variant="ghost" @click="goBack" class="gap-2 pl-0 hover:pl-2 transition-all">
        <ArrowLeft class="w-4 h-4" /> Back to Wall
      </Button>
    </header>

    <article class="mb-12">
      <h1 class="mb-2 text-4xl font-extrabold tracking-tight">{{ entry.title || 'Untitled Request' }}</h1>
      <time class="block text-muted-foreground mb-8 text-lg">{{ formatDate(entry.date) }}</time>
      <div 
        class="prose prose-lg max-w-none"
        v-html="renderedContent"
      />
    </article>

    <!-- Words of Encouragement Section -->
    <section class="border-t border-border pt-12 mb-16">
      <div class="flex items-center gap-2 mb-8">
        <div class="p-2 bg-blue-100 rounded-full text-primary">
          <MessageSquare class="w-6 h-6" />
        </div>
        <h2 class="text-3xl font-bold">Words of Encouragement</h2>
      </div>

      <!-- Existing Encouragements -->
      <div v-if="entry.afterthoughts && entry.afterthoughts.length > 0" class="space-y-6 mb-8">
        <Card 
          v-for="thought in entry.afterthoughts" 
          :key="thought.id"
          class="border-l-4 border-l-blue-500 bg-blue-50/30"
        >
          <CardContent class="pt-6">
            <div class="prose prose-sm max-w-none" v-html="marked(thought.content)" />
            <p class="text-xs text-muted-foreground mt-4 font-medium">{{ formatRelativeDate(thought.createdAt) }}</p>
          </CardContent>
        </Card>
      </div>

      <div v-else class="text-center py-12 bg-muted/20 rounded-xl border border-dashed mb-8">
        <MessageSquare class="w-12 h-12 mx-auto mb-3 opacity-20" />
        <p class="text-muted-foreground">Be the first to share a word of encouragement.</p>
      </div>

      <!-- Add New Encouragement -->
      <div class="space-y-4 bg-muted/30 p-6 rounded-xl border">
        <h3 class="font-semibold text-lg">Share Encouragement</h3>
        <div class="flex flex-wrap gap-1 p-1 bg-background/50 rounded-md border">
          <Button 
            v-for="action in formatActions" 
            :key="action.label"
            variant="ghost" 
            size="sm" 
            @click="action.handler('encouragement')"
            class="h-8 w-8 p-0"
            :title="action.label"
          >
            <component :is="action.icon" class="w-4 h-4" />
          </Button>
        </div>

        <Textarea 
          id="encouragement-editor"
          v-model="newEncouragement" 
          placeholder="Share a word from God or words of encouragement..."
          class="min-h-[120px] resize-none bg-background focus-visible:ring-primary shadow-sm"
          @keydown.ctrl.enter="submitEncouragement"
          @keydown.meta.enter="submitEncouragement"
        />
        <div class="flex justify-between items-center">
          <p class="text-xs text-muted-foreground">Ctrl/Cmd + Enter to submit</p>
          <Button @click="submitEncouragement" class="gap-2 px-6" :disabled="!newEncouragement.trim()">
            <Send class="w-4 h-4" /> Post Encouragement
          </Button>
        </div>
      </div>
    </section>

    <!-- Testimony Section -->
    <section class="border-t border-border pt-12">
      <div class="flex items-center gap-2 mb-8">
        <div class="p-2 bg-green-100 rounded-full text-green-600">
          <Quote class="w-6 h-6" />
        </div>
        <h2 class="text-3xl font-bold">Testimonies</h2>
      </div>

      <!-- Existing Testimonies -->
      <div v-if="entry.testimonies && entry.testimonies.length > 0" class="space-y-6 mb-8">
        <Card 
          v-for="testimony in entry.testimonies" 
          :key="testimony.id"
          class="border-l-4 border-l-green-500 bg-green-50/30"
        >
          <CardContent class="pt-6">
            <div class="prose prose-sm max-w-none" v-html="marked(testimony.content)" />
            <p class="text-xs text-muted-foreground mt-4 font-medium">{{ formatRelativeDate(testimony.createdAt) }}</p>
          </CardContent>
        </Card>
      </div>

      <div v-else class="text-center py-12 bg-muted/20 rounded-xl border border-dashed mb-8">
        <Quote class="w-12 h-12 mx-auto mb-3 opacity-20" />
        <p class="text-muted-foreground">No testimonies yet. Share how God answered this prayer!</p>
      </div>

      <!-- Add New Testimony -->
      <div class="space-y-4 bg-muted/30 p-6 rounded-xl border">
        <h3 class="font-semibold text-lg">Share a Testimony</h3>
        <div class="flex flex-wrap gap-1 p-1 bg-background/50 rounded-md border">
          <Button 
            v-for="action in formatActions" 
            :key="action.label"
            variant="ghost" 
            size="sm" 
            @click="action.handler('testimony')"
            class="h-8 w-8 p-0"
            :title="action.label"
          >
            <component :is="action.icon" class="w-4 h-4" />
          </Button>
        </div>

        <Textarea 
          id="testimony-editor"
          v-model="newTestimony" 
          placeholder="How has God answered this prayer? Share your testimony..."
          class="min-h-[120px] resize-none bg-background focus-visible:ring-green-500 shadow-sm"
          @keydown.ctrl.enter="submitTestimony"
          @keydown.meta.enter="submitTestimony"
        />
        <div class="flex justify-between items-center">
          <p class="text-xs text-muted-foreground">Ctrl/Cmd + Enter to submit</p>
          <Button @click="submitTestimony" class="gap-2 px-6 bg-green-600 hover:bg-green-700" :disabled="!newTestimony.trim()">
            <Send class="w-4 h-4" /> Share Testimony
          </Button>
        </div>
      </div>
    </section>

    <!-- Bible Search Modal -->
    <Transition name="fade">
      <div v-if="isBibleModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <Card class="w-full max-w-lg shadow-2xl border-primary/20">
          <CardHeader class="flex flex-row items-center justify-between border-b pb-4">
            <div class="flex items-center gap-2">
              <Book class="w-5 h-5 text-primary" />
              <CardTitle>Bible Verse Search</CardTitle>
            </div>
            <Button variant="ghost" size="icon" @click="closeBibleModal" class="h-8 w-8">
              <X class="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent class="pt-6 space-y-4">
            <div class="flex gap-2">
              <div class="relative flex-1">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  v-model="bibleSearchQuery" 
                  placeholder="e.g. John 3:16 or Psalm 23"
                  class="pl-9"
                  @keydown.enter="searchBible"
                />
              </div>
              <Button @click="searchBible" :disabled="isSearchingBible">
                <Loader2 v-if="isSearchingBible" class="w-4 h-4 mr-2 animate-spin" />
                Search
              </Button>
            </div>

            <div v-if="bibleError" class="p-3 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20">
              {{ bibleError }}
            </div>

            <div v-if="bibleSearchResult" class="space-y-4">
              <div class="p-4 bg-muted/30 rounded-lg border border-dashed text-sm italic leading-relaxed">
                "{{ bibleSearchResult.text.trim() }}"
                <p class="not-italic font-bold mt-2 text-primary">— {{ bibleSearchResult.reference }}</p>
              </div>
              <Button @click="insertVerse" class="w-full gap-2">
                Insert into Encouragement
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Transition>
  </div>
  
  <div v-else class="flex flex-col items-center justify-center min-h-[50vh] text-center">
    <h3 class="text-xl font-semibold mb-2">Entry not found</h3>
    <Button @click="goBack">Go Back</Button>
  </div>
</template>

<style scoped>
/* Custom prose styling for markdown rendering */
:deep(.prose) {
  color: hsl(var(--foreground));
}

:deep(.prose h1),
:deep(.prose h2),
:deep(.prose h3),
:deep(.prose h4) {
  color: hsl(var(--foreground));
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

:deep(.prose h1) {
  font-size: 2.25rem;
  margin-top: 0;
}

:deep(.prose h2) {
  font-size: 1.875rem;
}

:deep(.prose h3) {
  font-size: 1.5rem;
}

:deep(.prose p) {
  margin-bottom: 1.25rem;
  line-height: 1.75;
}

:deep(.prose a) {
  color: hsl(var(--primary));
  text-decoration: underline;
  transition: opacity 0.2s;
}

:deep(.prose a:hover) {
  opacity: 0.8;
}

:deep(.prose strong) {
  font-weight: 700;
  color: hsl(var(--foreground));
}

:deep(.prose em) {
  font-style: italic;
}

:deep(.prose code) {
  background: hsl(var(--muted));
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
  font-family: monospace;
}

:deep(.prose pre) {
  background: hsl(var(--muted));
  padding: 1.5rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1.5rem 0;
}

:deep(.prose pre code) {
  background: transparent;
  padding: 0;
}

:deep(.prose blockquote) {
  border-left: 4px solid hsl(var(--primary));
  padding-left: 1.5rem;
  margin-left: 0;
  font-style: italic;
  color: hsl(var(--muted-foreground));
}

:deep(.prose ul),
:deep(.prose ol) {
  padding-left: 2rem;
  margin-bottom: 1.25rem;
}

:deep(.prose ul) {
  list-style-type: disc;
}

:deep(.prose ul li::marker) {
  color: hsl(var(--primary));
  font-weight: bold;
}

:deep(.prose ol li::marker) {
  color: hsl(var(--primary));
  font-weight: 600;
}

:deep(.prose li) {
  margin-bottom: 0.5rem;
}

:deep(.prose hr) {
  border-color: hsl(var(--border));
  margin: 2rem 0;
}

:deep(.prose img) {
  border-radius: 0.5rem;
  margin: 1.5rem 0;
}

:deep(.prose table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
}

:deep(.prose th),
:deep(.prose td) {
  border: 1px solid hsl(var(--border));
  padding: 0.75rem;
  text-align: left;
}

:deep(.prose th) {
  background: hsl(var(--muted));
  font-weight: 600;
}
</style>
