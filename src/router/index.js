import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useAuth } from '../composables/useAuth'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }
    },
    {
      path: '/new',
      name: 'new-entry',
      component: () => import('../views/EditorView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/entry/:id',
      name: 'entry-detail',
      component: () => import('../views/EntryView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const { isAuthenticated, authReady } = useAuth()
  
  // Wait for auth to be ready (session restored)
  await authReady()
  
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    // Redirect to login if route requires auth and user is not authenticated
    next('/login')
  } else if (to.meta.requiresGuest && isAuthenticated.value) {
    // Redirect to home if route is for guests only and user is authenticated
    next('/')
  } else {
    next()
  }
})

export default router
