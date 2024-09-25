<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const router = useRouter();
const authStore = useAuthStore();

const signupForm = ref({
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
});

const handleSignup = async () => {
  if (signupForm.value.password !== signupForm.value.confirmPassword) {
    console.error('Passwords do not match');
    // Handle password mismatch error
    return;
  }

  try {
    const data = await authStore.signup(signupForm.value);
    console.log('Signup successful:', data);
    router.push({ name: 'signin' });
  } catch (error) {
    console.error('Signup failed:', error.response?.data || error.message);
    // Handle signup error (e.g., show error message)
  }
};
</script>

<template>
  <div class="bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 dark:bg-gray-900">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl leading-9 font-extrabold text-gray-900 dark:text-gray-100">
        Create a new account
      </h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 dark:bg-gray-800">
        <form @submit.prevent="handleSignup">
          <div class="grid grid-cols-1 gap-6">
            <div>
              <label for="first-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">First name</label>
              <div class="mt-1">
                <input v-model="signupForm.firstName" id="first-name" type="text" required autocomplete="given-name" 
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 sm:text-sm">
              </div>
            </div>

            <div>
              <label for="last-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Last name</label>
              <div class="mt-1">
                <input v-model="signupForm.lastName" id="last-name" type="text" required autocomplete="family-name" 
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 sm:text-sm">
              </div>
            </div>

            <div>
              <label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
              <div class="mt-1">
                <input v-model="signupForm.username" id="username" type="text" required autocomplete="username" 
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 sm:text-sm">
              </div>
            </div>
          </div>

          <div class="mt-6">
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
            <div class="mt-1">
              <input v-model="signupForm.email" id="email" type="email" required autocomplete="email"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 sm:text-sm">
            </div>
          </div>

          <div class="mt-6">
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <div class="mt-1">
              <input v-model="signupForm.password" id="password" type="password" required autocomplete="new-password"
                class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 sm:text-sm">
            </div>
          </div>

          <div class="mt-6">
            <label for="confirm-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
            <div class="mt-1">
              <input v-model="signupForm.confirmPassword" id="confirm-password" type="password" required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 sm:text-sm">
            </div>
          </div>

          <div class="mt-6">
            <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Sign Up
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
