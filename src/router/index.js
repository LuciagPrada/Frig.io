//Vue Router, diagrama de rutas con guards de autenticación
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore.js'

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: () => import('../views/LandingView.vue'),
    meta: { public: true },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/biblioteca',
    name: 'Biblioteca',
    component: () => import('../views/LibraryView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/comunidad',
    name: 'Comunidad',
    component: () => import('../views/ComunidadView.vue'),
    meta: { public: true },
  },
  {
    path: '/mis-instituciones',
    name: 'MisInstituciones',
    component: () => import('../views/InstitucionView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/partitura/:id',
    name: 'ScoreDetail',
    component: () => import('../views/ScoreDetailView.vue'),
    meta: { public: true },
  },
  {
    path: '/ajustes',
    name: 'Ajustes',
    component: () => import('../views/AjustesView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

//Guard de autenticación
router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  //Esperar a que termine de inicializar la sesión
  if (authStore.loading) {
    await new Promise(resolve => {
      const stop = authStore.$subscribe(() => {
        if (!authStore.loading) { stop(); resolve() }
      })
      //fallback: si tarda demasiado, no bloquear la navegación indefinidamente, pero cancela la suscripción
      setTimeout(() => { stop(); resolve() }, 3000)
    })
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { path: '/', query: { login: '1' } }
  }
})

export default router
