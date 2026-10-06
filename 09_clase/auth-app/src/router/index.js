import { createRouter, createWebHistory } from 'vue-router'
import authService from '@/services/authService'
import { isAuthenticated, rol } from '@/stores/authStore'
import { tieneRol, ROLES } from '@/config/roles'

import ProductosView from '@/views/ProductosView.vue'
import LoginView from '@/views/LoginView.vue'
import SignupView from '@/views/SignupView.vue'
import DashboardView from '@/views/DashboardView.vue'
import UsuariosView from '@/views/UsuariosView.vue'
import NoAutorizadoView from '@/views/NoAutorizadoView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Públicas
    { path: '/', name: 'productos', component: ProductosView },
    { path: '/login', name: 'login', component: LoginView, meta: { soloInvitados: true } },
    { path: '/signup', name: 'signup', component: SignupView, meta: { soloInvitados: true } },
    { path: '/no-autorizado', name: 'no-autorizado', component: NoAutorizadoView },

    // Solo admin
    {
      path: '/dashboard', name: 'dashboard', component: DashboardView,
      meta: { requiresAuth: true, rolMinimo: ROLES.ADMIN }
    },
    {
      path: '/usuarios', name: 'usuarios', component: UsuariosView,
      meta: { requiresAuth: true, rolMinimo: ROLES.ADMIN }
    },

    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
})

router.beforeEach(async (to) => {
  // 1) Nunca decidir permisos mientras la autenticación es desconocida
  await authService.inicializar()

  // 2) Login/signup no tienen sentido si ya hay sesión
  if (to.meta.soloInvitados && isAuthenticated.value) {
    return { name: 'productos' }
  }

  // 3) Rutas que exigen sesión
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // 4) Rutas que exigen un rol mínimo
  if (to.meta.rolMinimo && !tieneRol(rol.value, to.meta.rolMinimo)) {
    return { name: 'no-autorizado' }
  }
})

export default router
