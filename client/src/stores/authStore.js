import { defineStore } from 'pinia';
import { client } from '@/utils/requestMaker.js';
import logger from "@/utils/logger.js";

const getLocalStorageUser = () => {
  const storedUser = localStorage.getItem('user');
  logger.debug('getLocalStorageUser() - storedUser:', storedUser);
  logger.debug('getLocalStorageUser() - storedUser parsed:', JSON.parse(storedUser));
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
        logger.debug('Tentative de connexion...');
        const data = await client.post(
          '/api/auth/signin',
          { email, password }
        );
        logger.debug('Connexion réussie:', data);
        localStorage.setItem('user', JSON.stringify(data));
        this.user = data;
        this.authenticated = true;
        return data;
      } catch (error) {
        logger.error('Erreur lors de la connexion:', error);
        throw error;
      }
    },
    async signup(signupForm) {
      try {
        logger.debug('Tentative d\'inscription...');
        const data = await client.post(
          '/api/auth/signup',
          signupForm
        );
        logger.debug('Inscription réussie:', data);
        return data;
      } catch (error) {
        logger.error('Erreur lors de l\'inscription:', error);
        throw error;
      }
    },
    async logout() {
      try {
        logger.debug('logout() - Tentative de déconnexion...');
        await client.post('/api/auth/logout', {});
        logger.debug('logout() - Déconnexion réussie');
        localStorage.removeItem('user');
        this.user = null;
        this.authenticated = false;
      } catch (error) {
        logger.debug('logout() - Erreur lors de la déconnexion:', error);
      }
    },
    async refreshToken() {
      try {
        logger.debug('refreshToken() - Tentative de rafraîchissement du token...');
        const data = await client.post('/api/auth/refresh-token', {});
        logger.debug('refreshToken() - Token rafraîchi:', data);
        return data;
      } catch (error) {
        logger.error('refreshToken() - Erreur lors du rafraîchissement du token:');
        throw error;
      }
    },
    async checkAuth() {
      try {
        logger.debug('checkAuth() - Vérification de l\'authentification...');
        const data = await client.get('/api/auth/check');
        logger.debug('checkAuth() - Authentification vérifiée:', data);
        if (data) {
          this.authenticated = data.isAuthenticated;
          this.user = data.username;
        }
      } catch (error) {
        logger.error('checkAuth() - Erreur lors de la vérification de l\'authentification:');
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