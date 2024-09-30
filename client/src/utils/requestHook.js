// Hook pour gérer les appels API
import { ref } from 'vue';

export function hookApi() {
  const isLoading = ref(false);
  const error = ref(null);

  const executeRequest = async (requestFn) => {
    isLoading.value = true;
    error.value = null;

    try {
      // Appel de la fonction passée comme paramètre
      return await requestFn();
    } catch (err) {
      error.value = err;
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
