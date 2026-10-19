import { signUp, signIn, signOut } from '../services/auth.js'
// import {authStore} from '../store/authStore.js'

import { ref } from 'vue'

export const useAuth = () => {
    const loading = ref(false)
    const error = ref(null)

    const register = async (email, password) => {
        loading.value = true
        error.value = null
        try {
            const user = await signUp(email, password)
            return user
        }
        catch (error) {
            console.error("Error signing up:", error);
            error.value = error
            throw error
        }
    }

    const login = async (email, password) => {
        loading.value = true
        error.value = null
        try {
            const user = await signIn(email, password)
            // pequeno detalle a tener en cuenta, el store no se puede importar directamente, sino que se debe usar la funcion useAuthStore para obtener la instancia del store
            // que principio estaria rompiendo???
            // authStore.setUser(user)
            return user
        }
        catch (error) {
            console.error("Error signing in:", error);
            error.value = error
            throw error
        }
    }

    const logout = async () => {
        loading.value = true
        error.value = null
        try {
            await signOut()
        }
        catch (error) {
            console.error("Error signing out:", error);
            error.value = error
            throw error
        }
    }

    return { register, login, logout , loading, error }
}