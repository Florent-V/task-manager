import './assets/index.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/authStore';

const app = createApp(App)

app.use(createPinia())
app.use(router)

//const authStore = useAuthStore();

app.mount('#app')
// Vérifiez l'authentification avant de monter l'application
// console.log('Init App - Vérification initiale de l\'authentification...');
// authStore.checkAuth()
//   .then(() => {
//     console.log('Init App - checkAuth OK');
//     app.mount('#app');
//   })
//   .catch((error) => {
//     console.log('Init App - checkAuth KO - non authentifié');
//     app.mount('#app');
//   });

