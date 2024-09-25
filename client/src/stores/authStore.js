import { defineStore } from 'pinia';
import { client } from '@/utils/requestMaker.js';

const getLocalStorageUser = () => {
  const storedUser = localStorage.getItem('user');
  console.log('getLocalStorageUser() - storedUser:', storedUser);
  console.log('getLocalStorageUser() - storedUser parsed:', JSON.parse(storedUser));
  return storedUser ? JSON.parse(storedUser) : null;
};

export const useAuthStore = defineStore('auth', {
  state: () => ({
    authenticated: false,
    user: getLocalStorageUser(),
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
  },
  actions: {
    async login(email, password) {
      try {
        console.log('Tentative de connexion...');
        const data = await client.post(
          '/api/auth/signin',
          { email, password }
        );
        console.log('Connexion réussie:', data);
        localStorage.setItem('user', JSON.stringify(data));
        this.user = data;
        this.authenticated = true;
        return data;
      } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        throw error;
      }
    },
    async signup(signupForm) {
      try {
        console.log('Tentative d\'inscription...');
        const data = await client.post(
          '/api/auth/signup',
          signupForm
        );
        console.log('Inscription réussie:', data);
        return data;
      } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        throw error;
      }
    },
    async logout() {
      try {
        console.log('logout() - Tentative de déconnexion...');
        await client.post('/api/auth/logout', {});
        console.log('logout() - Déconnexion réussie');
        localStorage.removeItem('user');
        this.user = null;
        this.authenticated = false;
      } catch (error) {
        console.log('logout() - Erreur lors de la déconnexion:', error);
      }
    },
    async refreshToken() {
      try {
        console.log('refreshToken() - Tentative de rafraîchissement du token...');
        const data = await client.post('/api/auth/refresh-token', {});
        console.log('refreshToken() - Token rafraîchi:', data);
      } catch (error) {
        console.error('refreshToken() - Erreur lors du rafraîchissement du token:');
        throw error;
      }
    },
    async checkAuth() {
      try {
        console.log('checkAuth() - Vérification de l\'authentification...');
        const data = await client.get('/api/auth/check');
        console.log('checkAuth() - Authentification vérifiée:', data);
        if (data) {
          this.authenticated = data.isAuthenticated;
          this.user = data.username;
        }
      } catch (error) {
        console.error('checkAuth() - Erreur lors de la vérification de l\'authentification:');
        throw error;
      }
    },
    setUser(userData) {
      this.user = userData;
    },
    clearUser() {
      this.user = null;
    },
  },
  persist: true,
});


// Fonction pour obtenir le jeton CSRF (à implémenter selon votre configuration serveur)
function getCsrfToken() {
  // Logique pour récupérer le jeton CSRF
}