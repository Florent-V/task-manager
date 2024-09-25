
<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { ref } from 'vue';

const router = useRouter();
const authStore = useAuthStore();
const loginForm = ref({
  email: '',
  password: '',
});
const error = ref(null);

const handleLogin = async () => {
  try {
    const response = await authStore.login(loginForm.value.email, loginForm.value.password);
    console.log('Login successful:', response);
    // Handle successful login (e.g., redirect, save token)
    if (response.username) {
      // Met à jour les informations de l'utilisateur dans le store
      // Redirige vers la page d'accueil ou une autre page après le login
      router.push({ name: 'home' });
    }
  } catch (error) {
    console.error('Login failed:', error);
    if (error.status === 401) {
      console.error('Invalid email or password');
      error.value = 'Mot de passe ou email incorrect';
      // Handle invalid email or password error
    }
    // Handle login error (e.g., show error message)
  }
};
</script>
<template>
  <div class="bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 dark:bg-gray-900">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl leading-9 font-extrabold text-gray-900 dark:text-gray-100">
        Sign in to your account
      </h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 dark:bg-gray-800">
        <form @submit.prevent="handleLogin">
          <div class="mt-6">
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
            <div class="mt-1">
              <input v-model="loginForm.email" id="email" type="email" required autocomplete="email"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 sm:text-sm">
            </div>
          </div>

          <div class="mt-6">
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <div class="mt-1">
              <input v-model="loginForm.password" id="password" type="password" required autocomplete="current-password"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 sm:text-sm">
            </div>
            <p v-if="error" class="mt-2 text-sm text-red-600 dark:text-red-400">{{ error }}</p>
          </div>

          <div class="mt-6 flex items-center justify-between">
            <div class="flex items-center">
              <input id="remember_me" type="checkbox" class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
              <label for="remember_me" class="ml-2 block text-sm leading-5 text-gray-900 dark:text-gray-300">
                Remember me
              </label>
            </div>

            <div class="text-sm leading-5">
              <a href="#" class="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                Forgot your password?
              </a>
            </div>
          </div>

          <div class="mt-6">
            <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add any additional custom styling if necessary */
</style>
