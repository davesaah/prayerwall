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
const { login, signup, loginWithGoogle } = useAuth()

const email = ref('')
const password = ref('')
const error = ref('')
const isLoggingIn = ref(false)
const isRegistering = ref(false)

const handleAuth = async () => {
  if (!email.value || !password.value) {
    error.value = 'Please fill in all fields.'
    return
  }

  error.value = ''
  isLoggingIn.value = true
  
  const result = isRegistering.value 
    ? await signup(email.value, password.value)
    : await login(email.value, password.value)
  
  if (result.success) {
    if (isRegistering.value) {
      alert('Registration successful! Please sign in.')
      isRegistering.value = false
    } else {
      router.push('/')
    }
  } else {
    error.value = result.error || 'Authentication failed.'
  }
  isLoggingIn.value = false
}

const toggleMode = () => {
  isRegistering.value = !isRegistering.value
  error.value = ''
}

const handleGoogleLogin = async () => {
  error.value = ''
  isLoggingIn.value = true
  const result = await loginWithGoogle()
  if (!result.success) {
    error.value = result.error || 'Google login failed.'
    isLoggingIn.value = false
  }
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
          <CardTitle class="text-2xl md:text-3xl font-extrabold tracking-tight">
            {{ isRegistering ? 'Create Account' : 'Welcome Back' }}
          </CardTitle>
          <p class="text-muted-foreground text-sm italic">
            {{ isRegistering ? 'Join our digital sanctuary.' : 'Your digital sanctuary awaits.' }}
          </p>
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

        <div class="pt-2 space-y-4">
          <!-- Auth Button -->
          <Button @click="handleAuth" class="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all" size="lg" :disabled="isLoggingIn">
            <Loader2 v-if="isLoggingIn" class="w-4 h-4 mr-2 animate-spin" />
            {{ isLoggingIn ? (isRegistering ? 'Registering...' : 'Signing In...') : (isRegistering ? 'Register' : 'Sign In') }}
          </Button>

          <div class="relative py-2">
            <div class="absolute inset-0 flex items-center">
              <span class="w-full border-t border-muted" />
            </div>
            <div class="relative flex justify-center text-xs uppercase">
              <span class="bg-card px-2 text-muted-foreground italic">Or continue with</span>
            </div>
          </div>

          <!-- Google Login Button -->
          <Button 
            variant="outline" 
            @click="handleGoogleLogin" 
            class="w-full h-12 rounded-xl font-semibold border-primary/20 hover:bg-primary/5 transition-all gap-3"
            :disabled="isLoggingIn"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </Button>

          <div class="text-center">
            <Button variant="link" @click="toggleMode" class="text-sm">
              {{ isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Sign Up" }}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
