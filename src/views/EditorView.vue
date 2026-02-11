<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useJournal } from '../composables/useJournal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save, Eye, EyeOff, Bold, Italic, Heading1, Heading2, List, ListOrdered, Link, Quote } from 'lucide-vue-next'
import { marked } from 'marked'

const route = useRoute()
const router = useRouter()
const { addEntry, getEntry, updateEntry } = useJournal()

const isEditing = ref(false)
const entryId = ref(null)
const showPreview = ref(true)

const formatActions = [
  { icon: Bold, handler: () => formatBold(), label: 'Bold' },
  { icon: Italic, handler: () => formatItalic(), label: 'Italic' },
  { icon: Heading1, handler: () => formatH1(), label: 'Heading 1' },
  { icon: Heading2, handler: () => formatH2(), label: 'Heading 2' },
  { icon: List, handler: () => formatBulletList(), label: 'Bullet List' },
  { icon: ListOrdered, handler: () => formatNumberedList(), label: 'Numbered List' },
  { icon: Link, handler: () => formatLink(), label: 'Link' },
  { icon: Quote, handler: () => formatQuote(), label: 'Quote' },
]


const form = ref({
  title: '',
  content: '',
  date: new Date().toISOString().slice(0, 16)
})

// Configure marked for better rendering
marked.setOptions({
  breaks: true,
  gfm: true,
})

const markdownPreview = computed(() => {
  if (!form.value.content) return '<p class="text-muted-foreground">Start writing to see the preview...</p>'
  return marked(form.value.content)
})

onMounted(() => {
  if (route.params.id) {
    isEditing.value = true
    entryId.value = route.params.id
    const entry = getEntry(route.params.id)
    if (entry) {
      form.value = { ...entry }
    } else {
      router.push('/')
    }
  }
})

const save = () => {
  if (!form.value.content.trim()) return

  if (isEditing.value) {
    updateEntry(entryId.value, form.value)
  } else {
    addEntry(form.value)
  }
  router.push('/')
}

const cancel = () => {
  router.back()
}

const togglePreview = () => {
  showPreview.value = !showPreview.value
}

// Formatting functions
const textareaRef = ref(null)

const insertMarkdown = (before, after = '') => {
  const textarea = document.getElementById('content-editor')
  if (!textarea) return
  
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = form.value.content.substring(start, end)
  
  const newText = before + selectedText + after
  const newContent = 
    form.value.content.substring(0, start) + 
    newText + 
    form.value.content.substring(end)
  
  form.value.content = newContent
  
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



</script>

<template>
  <div class="container max-w-6xl mx-auto py-8 px-4 h-[calc(100vh-2rem)] flex flex-col">
    <header class="flex justify-between items-center mb-6">
      <Button variant="ghost" @click="cancel" class="gap-2 pl-0">
        <ArrowLeft class="w-4 h-4" /> Back
      </Button>
      <div class="flex gap-2">
        <Button variant="outline" @click="togglePreview" class="gap-2" size="sm">
          <component :is="showPreview ? EyeOff : Eye" class="w-4 h-4" />
          {{ showPreview ? 'Hide' : 'Show' }} Preview
        </Button>
        <Button @click="save" class="gap-2">
          <Save class="w-4 h-4" /> Save
        </Button>
      </div>
    </header>
    
    <div class="space-y-4 flex-1 flex flex-col overflow-hidden">
      <div class="grid gap-4">
        <Input 
          v-model="form.title" 
          placeholder="Entry Title" 
          class="text-2xl font-bold border-none px-0 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/50 h-auto py-2"
        />
        <div class="flex items-center gap-2 text-muted-foreground">
           <Label for="date" class="sr-only">Date</Label>
           <Input 
              id="date" 
              type="datetime-local" 
              v-model="form.date" 
              class="w-auto border-none shadow-none px-0 focus-visible:ring-0 text-sm h-8" 
            />
        </div>
      </div>

      <div class="flex-1 grid gap-4 overflow-hidden" :class="showPreview ? 'md:grid-cols-2' : 'grid-cols-1'">
        <!-- Editor Pane -->
        <div class="flex flex-col overflow-hidden">
          <div class="text-xs font-medium text-muted-foreground mb-2 px-2">Editor (Markdown)</div>
          
          <!-- Formatting Toolbar -->
          <div class="flex flex-wrap gap-1 mb-2 p-2 border rounded-lg bg-muted/30">
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
            id="content-editor"
            v-model="form.content" 
            placeholder="Start writing in markdown...

**Bold text** or *italic*
- Bullet lists
1. Numbered lists
# Headings

[Links](url) and more!" 
            class="flex-1 resize-none border rounded-lg p-4 focus-visible:ring-2 text-base leading-relaxed font-mono"
          />
        </div>

        <!-- Preview Pane -->
        <div v-if="showPreview" class="flex flex-col overflow-hidden">
          <div class="text-xs font-medium text-muted-foreground mb-2 px-2">Preview</div>
          <div 
            class="flex-1 border rounded-lg p-4 overflow-auto prose prose-sm dark:prose-invert max-w-none"
            v-html="markdownPreview"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom prose styling for markdown preview */
:deep(.prose) {
  color: hsl(var(--foreground));
}

:deep(.prose h1),
:deep(.prose h2),
:deep(.prose h3),
:deep(.prose h4) {
  color: hsl(var(--foreground));
  font-weight: 700;
}

:deep(.prose h1) {
  font-size: 1.875rem;
  margin-top: 0;
}

:deep(.prose h2) {
  font-size: 1.5rem;
}

:deep(.prose a) {
  color: hsl(var(--primary));
  text-decoration: underline;
}

:deep(.prose code) {
  background: hsl(var(--muted));
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
}

:deep(.prose pre) {
  background: hsl(var(--muted));
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
}

:deep(.prose blockquote) {
  border-left: 4px solid hsl(var(--primary));
  padding-left: 1rem;
  font-style: italic;
  color: hsl(var(--muted-foreground));
}

:deep(.prose ul),
:deep(.prose ol) {
  padding-left: 1.5rem;
}

:deep(.prose ul) {
  list-style-type: disc;
}

:deep(.prose ul li) {
  position: relative;
  padding-left: 0.5rem;
}

:deep(.prose ul li::marker) {
  color: hsl(var(--primary));
  font-weight: bold;
}

:deep(.prose ol li::marker) {
  color: hsl(var(--primary));
  font-weight: 600;
}

:deep(.prose hr) {
  border-color: hsl(var(--border));
}
</style>
