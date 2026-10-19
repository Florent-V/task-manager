<script setup>
import { onBeforeUnmount, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useAuthStore } from '@/stores/authStore';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

// Page du front où revenir après la connexion
const returnTo = typeof route.query.returnTo === 'string' ? route.query.returnTo : '/';
const loginFailed = route.query.error === 'login_failed';

// Filet de sécurité : déjà connecté sur le serveur OAuth2, l'aller-retour SSO se fait en redirections
// immédiates et la session est bien ouverte, mais il arrive que le navigateur n'affiche pas la page
// d'arrivée et reste sur /signin. On vérifie donc la session pendant quelques secondes et on entre
// dans l'application dès qu'elle existe (sans effet si la navigation SSO aboutit normalement).
const SESSION_CHECK_INTERVAL = 1000;
const SESSION_CHECK_ATTEMPTS = 30;
let sessionCheckTimer;

const waitForSession = (attempt = 1) => {
  clearTimeout(sessionCheckTimer);
  sessionCheckTimer = setTimeout(async () => {
    if (await authStore.loadUser()) {
      router.replace(returnTo);
    } else if (attempt < SESSION_CHECK_ATTEMPTS) {
      waitForSession(attempt + 1);
    }
  }, SESSION_CHECK_INTERVAL);
};

const signIn = () => {
  authStore.login(returnTo);
  waitForSession();
};

// La connexion se fait sur le serveur OAuth2 (SSO) : redirection immédiate, sauf après un échec
onMounted(() => {
  if (authStore.isAuthenticated) {
    router.replace(returnTo);
    return;
  }
  if (!loginFailed) {
    signIn();
  }
});

onBeforeUnmount(() => clearTimeout(sessionCheckTimer));
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
