import axios from "axios";
import { useAuthStore } from "@/stores/authStore";
import router from '../router';

console.log('VITE_API_BASE_URL', import.meta.env.VITE_API_BASE_URL)
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {

    const originalConfig  = error.config;
    console.error('####Interceptor');
    
    if (error.response && error.response.status === 401 && !originalConfig._retry) {
      console.error('Interceptor - 401:', error.response.data.message);
      originalConfig._retry = true; // Prevent infinite loop
      const authStore = useAuthStore();
      
       // Si c'est une erreur de rafraîchissement, déconnectez l'utilisateur immédiatement
      if (error.response.data.name === 'RefreshTokenError') {
        console.error(' Interceptor - RefreshTokenError');
        await authStore.logout();
        router.push('/signin');
        return Promise.reject(error);
      }

      try {
        console.log('Interceptor - Tentative de rafraîchissement du token...');
        const data = await authStore.refreshToken();
        console.log('Interceptor - Token rafraîchi:', data);
        return apiClient(originalConfig); // Retry the original request
      } catch (_error) {
        console.error('Interceptor - Error in try/catch');
        router.push('/signin');
        return Promise.reject(_error);
      }
    }
    console.error('Interceptor - Out');
    return Promise.reject(error);
  }
);

const request = async (requestPromise) => {
  try {
    const response = await requestPromise;
    console.log('requestMaker() - Success on :', response.config.url);
    console.log('requestMaker() - Data:', response.data);
    return response.data ?? response;
  } catch (error) {
    console.error('Request Maker Erreur lors de la requête:', {
      url: error.config.url,
      status: error.response?.status,
      name: error.response?.data?.name,
      message: error.response?.data?.message,
      // stack: error.response?.data?.stack,
    });
    throw error;
  }
};

export const client = {
  get: (url, withCredentials = true) =>
    request(apiClient.get(url, { withCredentials })),
  
  post: (url, data, withCredentials = true) =>
    request(apiClient.post(url, data, { withCredentials })),
  
  put: (url, data, withCredentials = true) =>
    request(apiClient.put(url, data, { withCredentials })),

  patch: (url, data, withCredentials = true) =>
      request(apiClient.patch(url, data, { withCredentials })),
  
  delete: (url, withCredentials = true) =>
    request(apiClient.delete(url, { withCredentials })),
   // Méthodes spécifiques pour l'envoi de fichiers
  postWithFile: (url, formData, withCredentials = true) =>
    request(apiClient.post(url, formData, {
      withCredentials,
      headers: { 'Content-Type': 'multipart/form-data' },
    })),

  patchWithFile: (url, formData, withCredentials = true) =>
    request(apiClient.patch(url, formData, {
      withCredentials,
      headers: { 'Content-Type': 'multipart/form-data' },
    })),
};
