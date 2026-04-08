import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router/index.js'
import { useAuthStore } from './stores/authStore.js'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

//Inicializar el estado de autenticación antes de montar
const authStore = useAuthStore()
authStore.init().then(() => {
  app.mount('#app')
})
