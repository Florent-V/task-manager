// Hook pour gérer les appels API
import { ref } from 'vue';

import { ToastManager} from "@/services/toastManager.js";
import { useToast } from '@/composables/useToast'
import logger from "@/utils/logger.js";

export function hookApi() {
  const toastFunctions = useToast();
  const isLoading = ref(false);
  const error = ref(null);

  const executeRequest = async (requestPromise, userOptions = {}) => {
    const options = {
      showToasts: false,
      loadingMessage: 'Chargement...',
      successMessage: 'Requête effectuée avec succès !',
      errorMessage: 'Erreur lors de la requête',
      ...userOptions
    };

    const toastManager = new ToastManager(toastFunctions, options);

    isLoading.value = true;
    error.value = null;

    toastManager.showLoading();

    try {
      // Appel de la fonction passée comme paramètre
      return await requestPromise();
    } catch (err) {
      logger.error('hookApi() - Erreur lors de la requête');
      error.value = `Erreur lors de la requête, veuillez réessayer - ${err?.response?.data?.message ?? err.message}`;
      toastManager.showError();
      throw err;
    } finally {
      isLoading.value = false;
      toastManager.showSuccess();
    }
  };

  return {
    isLoading,
    error,
    executeRequest,
  };
}
