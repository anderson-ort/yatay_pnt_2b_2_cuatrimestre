import { createRouter, createWebHistory } from 'vue-router'



const routes = [
    { path: '/', name: 'Catalogo', component: () => import('../views/CatalogoView.vue') },
    { path: '/admin', name: 'Admin', component: () => import('../views/AdminView.vue') },
    { path: '/signin', name: 'Signin', component: () => import('../views/SignInView.vue') },
    { path: '/signup', name: 'Signup', component: () => import('../views/SignUpView.vue') },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})


// reglas de navegación


export default router