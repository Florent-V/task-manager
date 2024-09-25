<script setup>
import { ref, onMounted, computed } from 'vue';
import { initializeTheme} from '@/utils/initDarkMode';
import { useAuthStore } from '@/stores/authStore';

const userStore = useAuthStore();
const user = computed(() => userStore.user);

const isDarkMode = ref(document.documentElement.classList.contains('dark'));
const isDropdownOpen = ref(false);

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const closeDropdown = () => {
  isDropdownOpen.value = false;
};

const toggleTheme = () => {
  document.documentElement.classList.toggle('dark');
  isDarkMode.value = document.documentElement.classList.contains('dark');
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light');
}

const logout = () => {
  userStore.logout();
}

onMounted(() => {
  initializeTheme(isDarkMode);
  console.log('User:', user.value);
});

</script>

<template>
  <header>
    <nav class="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center">
      <div class="flex items-center gap-2">
        <img alt="Vue logo" class="logo" src="@/assets/logo.png" width="50" height="50" />
        <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100">My Vue Starter</h1>
      </div>

      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/product">Product</RouterLink>
      <RouterLink to="/about">About</RouterLink>
      <RouterLink to="/refresh">Refresh</RouterLink>

     <!-- Dropdown Demo -->
     <div class="relative">
        <button 
          @click="toggleDropdown" 
          @blur="closeDropdown" 
          class="flex items-center text-gray-800 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none"
        >
          Demo
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            class="h-4 w-4 ml-1 transition-transform duration-200" 
            :class="{ 'rotate-180': isDropdownOpen }"
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div 
          v-show="isDropdownOpen" 
          class="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 transition-opacity duration-300"
          @mousedown.prevent
        >
          <div class="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            <RouterLink 
              to="/demo-product" 
              class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600" 
              role="menuitem"
              @click="closeDropdown"
            >
              Demo Product
            </RouterLink>
            <RouterLink 
              to="/demo-features" 
              class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600" 
              role="menuitem"
              @click="closeDropdown"
            >
              Demo Features
            </RouterLink>
          </div>
        </div>
      </div>

      <div class="flex items-center">

        <p v-if="user">Bienvenue, {{ user }}!</p>
        <button v-if="user" @click="logout" class="ml-4 text-red-600 hover:text-red-800">
          <!-- Icône SVG de déconnexion -->
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-10V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h6a2 2 0 002-2v-1" />
          </svg>
        </button>

        <div v-else>
          <RouterLink to="/signin" class="text-blue-600 hover:text-blue-800">
            Se connecter
          </RouterLink>
          /
          <RouterLink to="/signup" class="text-blue-600 hover:text-blue-800">
            S'inscrire
          </RouterLink>
        </div>

      </div>

      <button @click="toggleTheme" class="relative inline-flex items-center justify-center w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full p-1 transition duration-300 focus:outline-none">
        <span v-if="isDarkMode" class="w-4 h-4 bg-yellow-500 rounded-full shadow-md transform transition-transform duration-300 translate-x-6">🌜</span>
        <span v-else class="w-4 h-4 bg-yellow-500 rounded-full shadow-md transform transition-transform duration-300 translate-x-0">🌞</span>
      </button>

    </nav>

  </header>
</template>

<style scoped>
.logo {
  display: inline;
}
button {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
button span {
  display: flex;
  align-items: center;
  justify-content: center;
}

</style>
