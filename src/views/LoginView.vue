<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { User, Lock, BookOpen, Mail, Loader2 } from 'lucide-vue-next'

const router = useRouter()
const { login } = useAuth()

const email = ref('')
const password = ref('')
const error = ref('')
const isLoggingIn = ref(false)

const handleAuth = async () => {
  if (!email.value || !password.value) {
    error.value = 'Please fill in all fields.'
    return
  }

  error.value = ''
  isLoggingIn.value = true
  
  const result = await login(email.value, password.value)
  
  if (result.success) {
    router.push('/')
  } else {
    error.value = result.error || 'Authentication failed.'
  }
  isLoggingIn.value = false
}

const handleKeyPress = (e) => {
  if (e.key === 'Enter') {
    handleAuth()
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6">
    <Card class="w-full max-w-[420px] border-primary/20 bg-card/50 backdrop-blur-sm shadow-2xl shadow-primary/5">
      <CardHeader class="space-y-4 text-center py-8">
        <div class="flex justify-center">
          <div class="p-4 rounded-3xl bg-primary/10 ring-1 ring-primary/20">
            <BookOpen class="w-10 h-10 md:w-12 md:h-12 text-primary" />
          </div>
        </div>
        <div class="space-y-1">
          <CardTitle class="text-2xl md:text-3xl font-extrabold tracking-tight">Welcome Back</CardTitle>
          <p class="text-muted-foreground text-sm italic">Your digital sanctuary awaits.</p>
        </div>
      </CardHeader>
      
      <CardContent class="space-y-6 pb-10">
        <!-- Email Input -->
        <div class="space-y-2">
          <Label for="email" class="flex items-center gap-2 text-sm font-medium">
            <Mail class="w-4 h-4 text-primary" />
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            v-model="email"
            placeholder="name@example.com"
            @keypress="handleKeyPress"
            class="bg-background/50 h-11 rounded-xl"
            autofocus
          />
        </div>

        <!-- Password Input -->
        <div class="space-y-2">
          <Label for="password" class="flex items-center gap-2 text-sm font-medium">
            <Lock class="w-4 h-4 text-primary" />
            Password
          </Label>
          <Input
            id="password"
            type="password"
            v-model="password"
            placeholder="••••••••"
            @keypress="handleKeyPress"
            class="bg-background/50 h-11 rounded-xl"
          />
        </div>

        <!-- Error Message -->
        <div v-if="error" class="text-sm text-center p-3 rounded-xl border bg-destructive/5 border-destructive/20 text-destructive font-medium animate-in fade-in zoom-in-95 duration-300">
          {{ error }}
        </div>

        <div class="pt-2">
          <!-- Auth Button -->
          <Button @click="handleAuth" class="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all" size="lg" :disabled="isLoggingIn">
            <Loader2 v-if="isLoggingIn" class="w-4 h-4 mr-2 animate-spin" />
            {{ isLoggingIn ? 'Signing In...' : 'Sign In' }}
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
