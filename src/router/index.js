import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
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
      component: () => import('../views/EntryView.vue')
    },
    {
      path: '/entry/:id/edit',
      name: 'edit-entry',
      component: () => import('../views/EditorView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const { isAuthenticated, authReady } = useAuth()
  await authReady()

  if (to.meta.requiresAuth && !isAuthenticated.value) {
    next('/login')
  } else if (to.name === 'login' && isAuthenticated.value) {
    next('/')
  } else {
    next()
  }
})

export default router
