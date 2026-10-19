import { defineStore } from 'pinia'

let userState = {
    email: null,
    admin: false,
    token: null
}

const useAuthStore = defineStore(
    'auth',
    {
        state: () => userState,
        actions: {
            setUser(user , role) {
                this.email = user.email
                this.admin = role === 'admin'
                this.token = user.token
            },
            clearUser() {
                this.email = null
                this.admin = false
                this.token = null
            }
        },
        getters: {
            userEmail: (state) => state.email,
            isAuthenticated: (state) => !!state.email,
            isAdmin: (state) => state.admin,
        },
        persist: {
            enabled: true,
            strategies: [
                {
                    key: 'auth',
                    storage: sessionStorage,
                },
            ],
        },
    }
)



export default useAuthStore