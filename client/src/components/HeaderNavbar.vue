<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { initializeTheme } from '@/utils/initDarkMode';
import { useAuthStore } from '@/stores/authStore';
import logger from "@/utils/logger.js";

const router = useRouter();
const userStore = useAuthStore();
const user = computed(() => userStore.user);

const isMobileMenuOpen = ref(false)
const isResourcesDropdownOpen = ref(false)
const isUserDropdownOpen = ref(false)
const isMobileResourcesDropdownOpen = ref(false)
const isDarkMode = ref(document.documentElement.classList.contains('dark'));

const toggleDarkMode = () => {
  document.documentElement.classList.toggle('dark');
  isDarkMode.value = document.documentElement.classList.contains('dark');
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light');
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  isResourcesDropdownOpen.value = false
  isUserDropdownOpen.value = false
  isMobileResourcesDropdownOpen.value = false
  manageOutsideClickListener();
}

const toggleResourcesDropdown = () => {
  isResourcesDropdownOpen.value = !isResourcesDropdownOpen.value
  isUserDropdownOpen.value = false
  manageOutsideClickListener();
}

const toggleUserDropdown = () => {
  isUserDropdownOpen.value = !isUserDropdownOpen.value
  isResourcesDropdownOpen.value = false
  manageOutsideClickListener();
}

const toggleMobileResourcesDropdown = () => {
  isMobileResourcesDropdownOpen.value = !isMobileResourcesDropdownOpen.value
  manageOutsideClickListener();
}

const closeDropdowns = () => {
  isResourcesDropdownOpen.value = false
  isUserDropdownOpen.value = false
  isMobileResourcesDropdownOpen.value = false
  isMobileMenuOpen.value = false
  manageOutsideClickListener();
}

const anyDropdownOpen = () =>
    isResourcesDropdownOpen.value ||
    isUserDropdownOpen.value ||
    isMobileResourcesDropdownOpen.value ||
    isMobileMenuOpen.value;

// Fonction appelée dans chaque toggle pour gérer les événements
const manageOutsideClickListener = () => {
  if (anyDropdownOpen()) {
    document.addEventListener('click', closeDropdowns);
    logger.debug('Event listener added');
    return;
  }
  document.removeEventListener('click', closeDropdowns);
  logger.debug('Event listener removed');
};

const logout = () => {
  userStore.logout();
  router.push(`/signin`);
}

onMounted(() => {
  initializeTheme(isDarkMode);
});
</script>

<template>
  <header
      class="fixed top-0 left-0 right-0 bg-white bg-opacity-20 dark:bg-gray-800 dark:bg-opacity-20 backdrop-blur-md py-4 transition-colors duration-100 z-50">
    <nav class="container mx-auto px-4 flex items-center justify-between">
      <div class="flex items-center space-x-8">
        <div class="flex items-center space-x-2">
          <img src="@/assets/logo-head.webp" alt="Logo" class="h-10 w-auto">
          <RouterLink to="/"
                      class="text-xl font-bold hover:text-blue-600 dark:hover:text-yellow-300 transition duration-100">
            Task Manager
          </RouterLink>
        </div>
        <ul class="hidden md:flex space-x-6 text-lg">
          <li>
            <RouterLink to="/" class="hover:text-blue-600 dark:hover:text-yellow-300 transition duration-100">
              Home
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/toDoList"
                        class="hover:text-blue-600 dark:hover:text-yellow-300 transition duration-100">
              ToDoList
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/about" class="hover:text-blue-600 dark:hover:text-yellow-300 transition duration-100">
              About
            </RouterLink>
          </li>
        </ul>
      </div>

      <div class="flex items-center space-x-4">

        <div>
          <button @click="toggleDarkMode"
                  class="darkMode relative inline-flex items-center justify-center w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full p-1 transition duration-300 focus:outline-none">
            <span v-if="isDarkMode"
                  class="w-4 h-4 bg-yellow-500 rounded-full shadow-md transform transition-transform duration-300 translate-x-6">🌜</span>
            <span v-else
                  class="w-4 h-4 bg-yellow-500 rounded-full shadow-md transform transition-transform duration-300 translate-x-0">🌞</span>
          </button>
        </div>

        <template v-if="user">
          <div class="relative">
            <img @click.stop="toggleUserDropdown" :src="user.photoUrl ?? 'https://i.pravatar.cc/150?img=3'"
                 alt="User photo"
                 class="h-10 w-10 rounded-full cursor-pointer">
            <div v-show="isUserDropdownOpen"
                 class="absolute right-0 mt-2 w-64 bg-blue-100 dark:bg-gray-700 rounded-md shadow-lg">
              <div class="p-4">
                <p class="font-semibold">{{ user.firstName }} {{ user.lastName }}</p>
                <p class="text-sm text-gray-600 dark:text-gray-300">{{ user.email }}</p>
              </div>
              <hr class="border-gray-200 dark:border-gray-600">
              <ul>
                <li>
                  <a href="#"
                     class="block px-4 py-2 text-sm hover:bg-blue-200 dark:hover:bg-gray-600">
                    Dashboard
                  </a>
                </li>
                <li>
                  <a href="#"
                     class="block px-4 py-2 text-sm hover:bg-blue-200 dark:hover:bg-gray-600">
                    Settings
                  </a>
                </li>
                <li>
                  <button @click="logout"
                          class="ml-4 flex items-center gap-1 py-2 text-sm text-red-600 hover:text-red-800">
                    <span>Sign Out</span>
                    <!-- Icône SVG de déconnexion -->
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24"
                         stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-10V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h6a2 2 0 002-2v-1"/>
                    </svg>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </template>
        <button v-else
                class="bg-blue-500 dark:bg-yellow-400 hover:bg-blue-600 dark:hover:bg-yellow-500 text-white dark:text-gray-900 px-6 py-2 rounded-full font-semibold transition duration-300">
          <RouterLink to="/signin" class="">
            Login
          </RouterLink>
          /
          <RouterLink to="/signup" class="">
            Register
          </RouterLink>
        </button>
        <button class="md:hidden p-2" @click.stop="toggleMobileMenu">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-800 dark:text-white" fill="none"
               viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>
      </div>

    </nav>

    <!-- Mobile menu -->
    <div v-show="isMobileMenuOpen"
         class="md:hidden bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 py-2">
      <ul class="px-4 space-y-2">
        <li>
          <RouterLink to="/"
                      class="block py-2 text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-yellow-300 transition duration-300">
            Home
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/toDoList"
                      class="block py-2 text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-yellow-300 transition duration-300">
            ToDoList
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/about"
                      class="block py-2 text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-yellow-300 transition duration-300">
            About
          </RouterLink>
        </li>
      </ul>
    </div>

  </header>

  <!-- Spacer to prevent content from being hidden under the fixed navbar -->
  <div class="h-20"></div>

</template>

<style scoped>
button.darkMode {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

button.darkMode span {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>