import { createApp } from 'vue'
import pinia from './stores/piniaState.js'
import router from './router/index.js'


import App from './App.vue'
import './style.css'


createApp(App)
    .use(pinia) // Pinia antes que el router: el guard del router usa el store
    .use(router)
    .mount('#app')
