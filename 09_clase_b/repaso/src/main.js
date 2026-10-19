import { createApp } from 'vue'
import pinia from './stores/piniaState.js'
import router from './router/index.js'


import App from './App.vue'
import './style.css'


createApp(App)
    .use(router)
    .use(pinia)
    .mount('#app')
