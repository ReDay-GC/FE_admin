import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/dashboard/memories/today',
      name: 'today-memories',
      component: () => import('../views/TodayMemoriesView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/dashboard/memories',
      name: 'all-memories',
      component: () => import('../views/AllMemoriesView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/dashboard/records',
      name: 'all-records',
      component: () => import('../views/AllRecordsView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach((to) => {
  const token = localStorage.getItem('adminAccessToken')
  if (to.meta.requiresAuth && !token) {
    return '/'
  }
})

export default router
