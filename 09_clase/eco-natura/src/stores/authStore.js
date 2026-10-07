import { reactive, watch } from 'vue';


// Store for authentication state
// necesito algo que me ayude a persistir la sesión del usuario a través de la aplicación, y que pueda ser compartido entre componentes. Para eso, voy a crear un store reactivo que contenga la información de la sesión del usuario.
// necesitaria algo que me guarde en el localStorage o en el sessionStorage la información de la sesión del usuario, para que cuando recargue la página, pueda recuperar la sesión y no tenga que loguearse de nuevo. Pero por ahora, voy a hacer un store reactivo simple.

const STORAGE_KEY = 'session';

const defaultSession = {
    user: null,
    email: null,
    isAuthenticated: false
};

const loadSessionFromStorage = () => {
    const sessionData = localStorage.getItem(STORAGE_KEY);
    return sessionData ? JSON.parse(sessionData) : defaultSession;
};

const saveSessionToStorage = (session) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
};

export const state = reactive({
    session: loadSessionFromStorage()
});

// Se encarga de verificar los cambios de session y guardarlos en el localstorage
watch(() => state.session, (newSession) => {
    saveSessionToStorage(newSession);
}, { deep: true });


// // pinia  un manejo de esta global 
// export const state = reactive({
//     session: {
//         user: null,
//         email: null,
//         isAuthenticated: false
//     }
// });

// les dejo la version con localStorage comentada, para que vean como se haria. Pero por ahora, vamos a usar la version simple con reactive.
// export const state = reactive({
//     session: JSON.parse(localStorage.getItem('session')) || {
//         user: null,
//         email: null,
//         isAuthenticated: false
//     }
// });

// watch(() => state.session, (newSession) => {
//     localStorage.setItem('session', JSON.stringify(newSession));
// }, { deep: true });  

// Getters
export const isAuthenticated = () => state.session.isAuthenticated;
export const getUser = () => state.session.user;
export const getEmail = () => state.session.email;


// Mutaciones
//login 
export const setSession = (session) => {
    state.session.user = session?.user || null;
    state.session.email = session?.email || null;
    state.session.isAuthenticated = !!session?.user;
}

//logout
export const clearSession = () => {
    state.session.user = null;
    state.session.email = null;
    state.session.isAuthenticated = false;
}