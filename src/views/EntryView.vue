<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useJournal } from '../composables/useJournal'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { 
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@/components/ui/card'
import { ArrowLeft, MessageSquare, Send, Bold, Italic, Heading1, Heading2, List, ListOrdered, Link, Quote, Loader2 } from 'lucide-vue-next'
import { marked } from 'marked'

const route = useRoute()
const router = useRouter()
const { getEntry, addAfterthought, isOwnEntry, loading } = useJournal()

const entry = computed(() => getEntry(route.params.id))
const newThought = ref('')
const isSubmitting = ref(false)
const canEdit = computed(() => entry.value && isOwnEntry(entry.value))

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

const formatThoughtDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 8400000)
  
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
  router.push('/')
}

const submitThought = async () => {
  if (!newThought.value.trim() || isSubmitting.value) return
  
  isSubmitting.value = true
  const result = await addAfterthought(entry.value.id, newThought.value.trim())
  if (result.success) {
    newThought.value = ''
  }
  isSubmitting.value = false
}

// Formatting functions for afterthoughts
const insertMarkdown = (before, after = '') => {
  const textarea = document.getElementById('afterthought-editor')
  if (!textarea) return
  
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = newThought.value.substring(start, end)
  
  const newText = before + selectedText + after
  const newContent = 
    newThought.value.substring(0, start) + 
    newText + 
    newThought.value.substring(end)
  
  newThought.value = newContent
  
  // Set cursor position
  setTimeout(() => {
    const newCursorPos = selectedText 
      ? start + newText.length 
      : start + before.length
    textarea.focus()
    textarea.setSelectionRange(newCursorPos, newCursorPos)
  }, 0)
}

const formatBold = () => insertMarkdown('**', '**')
const formatItalic = () => insertMarkdown('*', '*')
const formatH1 = () => insertMarkdown('# ')
const formatH2 = () => insertMarkdown('## ')
const formatBulletList = () => insertMarkdown('- ')
const formatNumberedList = () => insertMarkdown('1. ')
const formatLink = () => insertMarkdown('[', '](url)')
const formatQuote = () => insertMarkdown('> ')

const formatActions = [
  { icon: Bold, handler: formatBold, label: 'Bold' },
  { icon: Italic, handler: formatItalic, label: 'Italic' },
  { icon: Heading1, handler: formatH1, label: 'Heading 1' },
  { icon: Heading2, handler: formatH2, label: 'Heading 2' },
  { icon: List, handler: formatBulletList, label: 'Bullet List' },
  { icon: ListOrdered, handler: formatNumberedList, label: 'Numbered List' },
  { icon: Link, handler: formatLink, label: 'Link' },
  { icon: Quote, handler: formatQuote, label: 'Quote' },
]

</script>

<template>
  <div v-if="entry" class="container max-w-4xl mx-auto py-6 md:py-12 px-4 animate-in fade-in duration-700">
    <header class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 md:mb-12">
      <Button variant="ghost" @click="goBack" class="gap-2 pl-0 hover:pl-2 transition-all group">
        <ArrowLeft class="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Journal
      </Button>
    </header>

    <article class="mb-12 md:mb-16">
      <div class="space-y-4 md:space-y-6 mb-8 md:mb-10">
        <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight flex-1 bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
            {{ entry.title || 'Untitled Entry' }}
          </h1>
          <span 
            class="self-start text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-bold border"
            :class="canEdit 
              ? 'bg-primary/10 text-primary border-primary/20 shadow-sm shadow-primary/5' 
              : 'bg-muted text-muted-foreground border-transparent'"
          >
            {{ entry.author_name || 'Anonymous' }}
          </span>
        </div>
        <time class="flex items-center gap-2 text-muted-foreground font-medium text-sm md:text-base">
          <span class="w-1.5 h-1.5 rounded-full bg-primary" />
          {{ formatDate(entry.created_at) }}
        </time>
      </div>

      <div 
        class="prose prose-lg md:prose-xl dark:prose-invert max-w-none leading-relaxed text-foreground/90 selection:bg-primary/20 break-words"
        v-html="renderedContent"
      />
    </article>

    <!-- AfterThoughts Section -->
    <section class="border-t border-primary/10 pt-8 md:pt-12 pb-12">
      <div class="flex items-center gap-3 mb-6 md:mb-8">
        <div class="p-2 rounded-lg bg-primary/10">
          <MessageSquare class="w-5 h-5 text-primary" />
        </div>
        <h2 class="text-xl md:text-2xl font-bold tracking-tight">AfterThoughts</h2>
      </div>

      <!-- Existing Thoughts -->
      <div v-if="entry.afterthoughts && entry.afterthoughts.length > 0" class="space-y-4 md:space-y-6 mb-8 md:mb-10">
        <Card 
          v-for="thought in entry.afterthoughts" 
          :key="thought.id"
          class="border-none bg-muted/30 backdrop-blur-sm relative overflow-hidden group hover:bg-muted/40 transition-colors"
        >
          <div class="absolute left-0 top-0 bottom-0 w-1 bg-primary/30 group-hover:bg-primary transition-colors" />
          <CardContent class="py-4 px-6 md:py-6 md:px-8">
            <div class="prose md:prose-lg dark:prose-invert max-w-none text-foreground/80 leading-relaxed italic text-sm md:text-base" v-html="marked(thought.content)" />
            <div class="flex items-center gap-2 mt-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
               <span>— {{ formatThoughtDate(thought.created_at) }}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Add New Thought - Only for own entries -->
      <div v-if="canEdit" class="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
        <div class="flex flex-wrap gap-1 p-1.5 border border-primary/5 rounded-xl bg-muted/20 backdrop-blur-sm">
          <Button 
            v-for="action in formatActions" 
            :key="action.label"
            variant="ghost" 
            size="sm" 
            @click="action.handler"
            class="h-9 w-9 p-0 hover:bg-primary/10 hover:text-primary transition-colors"
            :title="action.label"
          >
            <component :is="action.icon" class="w-4 h-4" />
          </Button>
        </div>

        <Textarea 
          id="afterthought-editor"
          v-model="newThought" 
          placeholder="Reflect on this entry..."
          class="min-h-[120px] resize-none font-sans text-base md:text-lg border-none focus-visible:ring-1 focus-visible:ring-primary/20 bg-muted/10 rounded-2xl p-5 md:p-6"
          @keydown.ctrl.enter="submitThought"
          @keydown.meta.enter="submitThought"
        />
        <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p class="hidden sm:block text-xs font-medium text-muted-foreground/50 italic px-2">Ctrl + Enter to submit</p>
          <Button @click="submitThought" class="w-full sm:w-auto gap-2 px-8 h-12 rounded-full shadow-lg shadow-primary/10 font-bold" :disabled="!newThought.trim() || isSubmitting">
            <component :is="isSubmitting ? Loader2 : Send" class="w-4 h-4" :class="isSubmitting ? 'animate-spin' : ''" />
            Add Thought
          </Button>
        </div>
      </div>
      
      <div v-else-if="!entry.afterthoughts || entry.afterthoughts.length === 0" class="text-center py-12 text-muted-foreground/40 italic text-sm">
        No afterthoughts have been shared yet.
      </div>
    </section>
  </div>
  
  <div v-else-if="loading" class="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center">
    <Loader2 class="w-12 h-12 text-primary animate-spin mb-4" />
    <p class="text-muted-foreground animate-pulse">Gathering memories...</p>
  </div>

  <div v-else class="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6 p-4">
    <div class="p-6 rounded-full bg-destructive/5 text-destructive">
       <ArrowLeft class="w-12 h-12" />
    </div>
    <div class="space-y-2">
      <h3 class="text-xl md:text-2xl font-bold">Entry not found</h3>
      <p class="text-muted-foreground text-sm md:text-base">The entry you're looking for might have been removed or moved.</p>
    </div>
    <Button size="lg" @click="goBack" variant="outline" class="w-full sm:w-auto px-8">Return to Journal</Button>
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

:deep(.prose blockquote) {
  border-left: 4px solid hsl(var(--primary));
  padding-left: 1.5rem;
  margin-left: 0;
  font-style: italic;
  color: hsl(var(--muted-foreground));
  background: hsl(var(--primary) / 0.02);
  padding: 1rem 1.5rem;
  border-radius: 0 0.5rem 0.5rem 0;
}

:deep(.prose ul),
:deep(.prose ol) {
  padding-left: 1.5rem;
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

:deep(.prose hr) {
  border-color: hsl(var(--border));
  margin: 2rem 0;
}
</style>
