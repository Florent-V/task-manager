// Hook pour gérer les appels API
import { ref } from 'vue';
import logger from "@/utils/logger.js";

export function hookApi() {
  const isLoading = ref(false);
  const error = ref(null);

  const executeRequest = async (requestPromise) => {
    isLoading.value = true;
    error.value = null;

    try {
      // Appel de la fonction passée comme paramètre
      return await requestPromise();
    } catch (err) {
      logger.error('hookApi() - Erreur lors de la requête');
      error.value = 'Erreur lors de la requête, veuillez réessayer';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    error,
    executeRequest,
  };
}
