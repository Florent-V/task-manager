import { defineStore } from 'pinia';

import { apiClient, apiBaseUrl } from '@/services/requestMaker.js';
import logger from "@/utils/logger.js";

// La connexion est déléguée au serveur OAuth2 (SSO) par l'API : le navigateur n'a qu'un cookie de session
// HttpOnly, il ne voit jamais de jeton. Connexion et déconnexion sont des navigations, pas des appels XHR.
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    // Vrai une fois la session vérifiée auprès de l'API (au premier affichage)
    loaded: false,
  }),
  getters: {
    isAdmin: (state) => state.user?.roles?.includes('ROLE_ADMIN'),
    isAuthenticated: (state) => !!state.user,
  },
  actions: {
    async loadUser() {
      try {
        const { data } = await apiClient.get('/api/auth/me', { withCredentials: true });
        this.setUser(data);
      } catch (error) {
        if (error.response?.status !== 401) {
          logger.error('loadUser() - Erreur lors de la récupération de l\'utilisateur:', error);
        }
        this.user = null;
      } finally {
        this.loaded = true;
      }
      return this.user;
    },
    // Redirige vers le serveur OAuth2, puis revient sur returnTo (chemin du front)
    login(returnTo = '/') {
      const params = new URLSearchParams({ returnTo });
      window.location.assign(`${apiBaseUrl}/api/auth/login?${params}`);
    },
    // Ferme la session de l'application puis celle du serveur OAuth2
    logout() {
      this.user = null;
      window.location.assign(`${apiBaseUrl}/api/auth/logout`);
    },
    setUser(userData) {
      this.user = userData ? { ...userData, fullName: `${userData.firstName ?? ''} ${userData.lastName ?? ''}`.trim() } : null;
    },
    clearUser() {
      this.user = null;
    },
  },
});
