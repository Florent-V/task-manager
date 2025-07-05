// stores/handleRequestStore.js
import { defineStore } from 'pinia';

export const useHandleRequestStore = defineStore('loadingStore', {
  state: () => ({
    isLoading: false,
    error: '',
  }),
  actions: {
    setLoading(isLoading) {
      this.isLoading = isLoading;
    },
    setError(error) {
      this.error = error;
    },
    clearError() {
      this.error = null;
    },
  },
});
