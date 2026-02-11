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
import { ArrowLeft, MessageSquare, Send, Bold, Italic, Heading1, Heading2, List, ListOrdered, Link, Quote } from 'lucide-vue-next'
import { marked } from 'marked'

const route = useRoute()
const router = useRouter()
const { getEntry, addAfterthought } = useJournal()

const entry = computed(() => getEntry(route.params.id))
const newThought = ref('')

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

const submitThought = () => {
  if (!newThought.value.trim()) return
  addAfterthought(entry.value.id, newThought.value.trim())
  newThought.value = ''
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
  <div v-if="entry" class="container max-w-3xl mx-auto py-12 px-4">
    <header class="flex justify-between items-center mb-8">
      <Button variant="ghost" @click="goBack" class="gap-2 pl-0 hover:pl-2 transition-all">
        <ArrowLeft class="w-4 h-4" /> Back
      </Button>
    </header>

    <article class="mb-12">
      <h1 class="mb-2 text-4xl font-extrabold tracking-tight">{{ entry.title || 'Untitled Entry' }}</h1>
      <time class="block text-muted-foreground mb-8 text-lg">{{ formatDate(entry.date) }}</time>
      <div 
        class="prose prose-lg dark:prose-invert max-w-none"
        v-html="renderedContent"
      />
    </article>

    <!-- AfterThoughts Section -->
    <div class="border-t border-border pt-8">
      <div class="flex items-center gap-2 mb-6">
        <MessageSquare class="w-5 h-5 text-primary" />
        <h2 class="text-2xl font-bold">AfterThoughts</h2>
      </div>

      <!-- Existing Thoughts -->
      <div v-if="entry.afterthoughts && entry.afterthoughts.length > 0" class="space-y-4 mb-6">
        <Card 
          v-for="thought in entry.afterthoughts" 
          :key="thought.id"
          class="border-l-4 border-l-primary/50"
        >
          <CardContent class="pt-4">
            <div>
              <div class="prose prose-sm dark:prose-invert max-w-none" v-html="marked(thought.content)" />
              <p class="text-xs text-muted-foreground mt-2">{{ formatThoughtDate(thought.createdAt) }}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div v-else class="text-center py-8 text-muted-foreground">
        <MessageSquare class="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No afterthoughts yet. Add your reflections below.</p>
      </div>

      <!-- Add New Thought -->
      <div class="space-y-3">
        <!-- Formatting Toolbar -->
        <div class="flex flex-wrap gap-1 p-2 border rounded-lg bg-muted/30">
          <Button 
            v-for="action in formatActions" 
            :key="action.label"
            variant="ghost" 
            size="sm" 
            @click="action.handler"
            class="h-8 w-8 p-0"
            :title="action.label"
          >
            <component :is="action.icon" class="w-4 h-4" />
          </Button>
        </div>

        <Textarea 
          id="afterthought-editor"
          v-model="newThought" 
          placeholder="Add an afterthought or reflection (supports markdown)..."
          class="min-h-[100px] resize-none font-mono"
          @keydown.ctrl.enter="submitThought"
          @keydown.meta.enter="submitThought"
        />
        <div class="flex justify-between items-center">
          <p class="text-xs text-muted-foreground">Ctrl/Cmd + Enter to submit</p>
          <Button @click="submitThought" class="gap-2" :disabled="!newThought.trim()">
            <Send class="w-4 h-4" /> Add Thought
          </Button>
        </div>
      </div>
    </div>
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
