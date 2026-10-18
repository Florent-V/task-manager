<script setup>
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';

import { useAuthStore } from '@/stores/authStore';

const route = useRoute();
const authStore = useAuthStore();

// Page du front où revenir après la connexion
const returnTo = typeof route.query.returnTo === 'string' ? route.query.returnTo : '/';
const loginFailed = route.query.error === 'login_failed';

const signIn = () => authStore.login(returnTo);

// La connexion se fait sur le serveur OAuth2 (SSO) : redirection immédiate, sauf après un échec
onMounted(() => {
  if (!loginFailed) {
    signIn();
  }
});
</script>

<template>
  <div class="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl leading-9 font-extrabold text-gray-900 dark:text-gray-100">
        Sign in to your account
      </h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 dark:bg-gray-800">
        <p v-if="loginFailed" class="mb-6 text-sm text-red-600 dark:text-red-400">
          Sign in failed. Please try again.
        </p>
        <p v-else class="mb-6 text-sm text-gray-700 dark:text-gray-300">
          Redirecting to the sign in page…
        </p>

        <button
          type="button"
          class="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          @click="signIn">
          Sign In
        </button>
        <p class="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
          No account yet? You can create one on the sign in page.
        </p>
      </div>
    </div>
  </div>
</template>
