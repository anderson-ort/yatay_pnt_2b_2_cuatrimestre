
import { signIn, signUp, logOut } from '../services/auth.js';
import { setSession, clearSession } from '../stores/authStore.js';

export const useAuth = () => {
    const login = async (email, password) => {
        try {
            const user = await signIn(email, password);
            setSession({ user: user.id, email: user.email });
            return user;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const register = async (email, password) => {
        try {
            const user = await signUp(email, password);
            setSession({ user: user.id, email: user.email });
            return user;
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await logOut();
            clearSession();
        } catch (error) {
            console.error('Logout failed:', error);
            throw error;
        }
    }

    return {
        login,
        register,
        logout
    };

}