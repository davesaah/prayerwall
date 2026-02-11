import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/new',
      name: 'new-entry',
      component: () => import('../views/EditorView.vue')
    },
    {
      path: '/entry/:id',
      name: 'entry-detail',
      component: () => import('../views/EntryView.vue')
    },
    {
      path: '/entry/:id/edit',
      name: 'edit-entry',
      component: () => import('../views/EditorView.vue')
    }
  ]
})

export default router
