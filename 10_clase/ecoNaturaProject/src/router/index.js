import { createRouter, createWebHistory } from 'vue-router'
import useAuthStore from '../stores/authStore.js'



const routes = [
    { path: '/', name: 'Catalogo', component: () => import('../views/CatalogoView.vue') },
    { path: '/admin', name: 'Admin', component: () => import('../views/AdminView.vue'), meta: { requiresAdmin: true } },
    { path: '/admin/ia', name: 'AdminIA', component: () => import('../views/AdminViewIA.vue'), meta: { requiresAdmin: true } },
    { path: '/signin', name: 'Signin', component: () => import('../views/SignInView.vue') },
    { path: '/signup', name: 'Signup', component: () => import('../views/SignUpView.vue') },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})


// reglas de navegación
router.beforeEach((to) => {
    // el store se instancia dentro del guard: Pinia ya está instalado (main.js)
    const auth = useAuthStore()

    // las rutas sin requisito de rol pasan sin condiciones
    if (!to.meta.requiresAdmin) return

    // 1) sin sesión -> a iniciar sesión, recordando a dónde quería ir
    if (!auth.isAuthenticated) {
        return { name: 'Signin', query: { redirect: to.fullPath } }
    }

    // 2) sesión sin rol admin -> al catálogo
    if (!auth.isAdmin) {
        return { name: 'Catalogo' }
    }
})

export default router