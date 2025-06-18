// Hook pour gérer les appels API
import { useHandleRequestStore } from "@/stores/handleRequestStore.js";

import logger from "@/utils/logger.js";

export function hookApi() {
  const loadingStore = useHandleRequestStore();

  const executeRequest = async (requestPromise) => {
    loadingStore.setLoading(true);
    loadingStore.clearError();

    try {
      // Appel de la fonction passée comme paramètre
      return await requestPromise();
    } catch (err) {
      logger.error('hookApi() - Erreur lors de la requête');
      loadingStore.setError('Erreur lors de la requête, veuillez réessayer');
      throw err;
    } finally {
      loadingStore.setLoading(false);
    }
  };

  return {
    isLoading: loadingStore.isLoading,
    error: loadingStore.error,
    executeRequest,
  };
}
