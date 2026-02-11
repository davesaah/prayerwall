<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useJournal } from '../composables/useJournal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save, Eye, EyeOff, Bold, Italic, Heading1, Heading2, List, ListOrdered, Link, Quote, Loader2 } from 'lucide-vue-next'
import { marked } from 'marked'

const route = useRoute()
const router = useRouter()
const { addEntry, getEntry, loading: journalLoading } = useJournal()

const isSaving = ref(false)
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
  created_at: new Date().toISOString().slice(0, 16)
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

const save = async () => {
  if (!form.value.content.trim()) return
  
  isSaving.value = true
  
  const payload = {
    title: form.value.title,
    content: form.value.content,
    created_at: new Date(form.value.created_at).toISOString()
  }

  const result = await addEntry(payload)
  
  isSaving.value = false
  if (result.success) {
    router.push('/')
  }
}

const cancel = () => {
  router.back()
}

const togglePreview = () => {
  showPreview.value = !showPreview.value
}

// Formatting functions
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
  <div class="container max-w-6xl mx-auto py-6 md:py-8 px-4 h-full md:h-[calc(100vh-2rem)] flex flex-col">
    <header class="flex justify-between items-center mb-6">
      <Button variant="ghost" @click="cancel" class="gap-2 pl-0 hover:pl-2 transition-all group">
        <ArrowLeft class="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
        <span class="hidden sm:inline">Back to Journal</span>
        <span class="sm:hidden text-sm uppercase tracking-widest font-bold">Back</span>
      </Button>
      <div class="flex gap-2">
        <Button variant="outline" @click="togglePreview" class="gap-2 h-10 md:h-11" size="sm">
          <component :is="showPreview ? EyeOff : Eye" class="w-4 h-4" />
          <span class="hidden md:inline">{{ showPreview ? 'Hide' : 'Show' }} Preview</span>
        </Button>
        <Button @click="save" class="gap-2 shadow-lg shadow-primary/20 h-10 md:h-11 px-4 md:px-6" :disabled="isSaving || journalLoading">
          <component :is="isSaving ? Loader2 : Save" class="w-4 h-4" :class="isSaving ? 'animate-spin' : ''" />
          {{ isSaving ? 'Saving...' : 'Save' }}
        </Button>
      </div>
    </header>
    
    <div class="space-y-4 flex-1 flex flex-col overflow-hidden animate-in fade-in duration-500">
      <div class="grid gap-2 mb-2">
        <Input 
          v-model="form.title" 
          placeholder="Entry Title" 
          class="text-2xl md:text-3xl font-bold border-none px-0 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/30 h-auto py-2 bg-transparent"
        />
        <div class="flex items-center gap-2 text-muted-foreground/60 border-b border-primary/5 pb-2">
           <Label for="date" class="sr-only">Date</Label>
           <Input 
              id="date" 
              type="datetime-local" 
              v-model="form.created_at" 
              class="w-auto border-none shadow-none px-0 focus-visible:ring-0 text-xs md:text-sm h-8 bg-transparent" 
            />
        </div>
      </div>

      <div class="flex-1 grid gap-8 overflow-y-auto md:overflow-hidden pb-8 md:pb-0" :class="showPreview ? 'md:grid-cols-2' : 'grid-cols-1'">
        <!-- Editor Pane -->
        <div class="flex flex-col min-h-[400px] md:min-h-0 overflow-hidden">
          <div class="flex items-center justify-between mb-2 px-2">
            <span class="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground/50">Editor (Markdown)</span>
          </div>
          
          <!-- Formatting Toolbar -->
          <div class="flex flex-wrap gap-1 mb-4 p-1.5 border rounded-xl bg-muted/20 backdrop-blur-sm border-primary/5 sticky top-0 z-10">
            <Button 
              v-for="action in formatActions" 
              :key="action.label"
              variant="ghost" 
              size="sm" 
              @click="action.handler"
              class="h-9 w-9 p-0 hover:bg-primary/10 hover:text-primary transition-colors"
              :title="action.label"
            >
              <component :is="action.icon" class="w-4 h-4 md:w-4.5 md:h-4.5" />
            </Button>
          </div>

          <Textarea 
            id="content-editor"
            v-model="form.content" 
            placeholder="Start writing your thoughts..." 
            class="flex-1 resize-none border-none rounded-2xl p-5 md:p-6 focus-visible:ring-1 focus-visible:ring-primary/20 text-base md:text-lg leading-relaxed bg-muted/10 min-h-[300px] md:min-h-0"
          />
        </div>

        <!-- Preview Pane -->
        <div v-if="showPreview" class="flex flex-col overflow-hidden pb-12 md:pb-0">
          <div class="text-[10px] md:text-xs font-bold uppercase tracking-wider text-muted-foreground/50 mb-2 px-2">Preview</div>
          <div 
            class="flex-1 border border-primary/5 rounded-2xl p-6 md:p-8 overflow-auto prose prose-lg dark:prose-invert max-w-none bg-card/30 backdrop-blur-sm shadow-inner"
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
  font-weight: 800;
  letter-spacing: -0.025em;
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
  line-height: 1.8;
  margin-bottom: 1.25rem;
}

:deep(.prose a) {
  color: hsl(var(--primary));
  text-decoration-color: hsl(var(--primary) / 0.3);
  text-underline-offset: 4px;
}

:deep(.prose blockquote) {
  border-left: 4px solid hsl(var(--primary));
  padding-left: 1.5rem;
  font-style: italic;
  color: hsl(var(--muted-foreground));
  background: hsl(var(--primary) / 0.03);
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

:deep(.prose hr) {
  border-color: hsl(var(--border));
  margin: 2rem 0;
}
</style>

