// composables/useTheme.js
import { ref, watch } from 'vue'

/**
 * @description Composable for managing the application theme (dark/light mode).
 * @returns {{isDarkMode: import('vue').Ref<boolean>, toggleDarkMode: () => void, initTheme: () => void}}
 */
export const useTheme = () => {
  /**
   * @type {import('vue').Ref<boolean>}
   * @description Reactive reference to the dark mode state.
   */
  const isDarkMode = ref(document.documentElement.classList.contains('dark'))

  /**
   * @description Toggles the theme between dark and light mode.
   */
  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark')
    isDarkMode.value = document.documentElement.classList.contains('dark')
    localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
  }

  watch(isDarkMode, (newVal) => {
    document.documentElement.classList.toggle('dark', newVal);
    localStorage.setItem('theme', newVal ? 'dark' : 'light');
  });

  /**
   * @description Initializes the theme based on saved preference or system settings.
   */
  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      isDarkMode.value = savedTheme === 'dark';
    } else {
      isDarkMode.value = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    document.documentElement.classList.toggle('dark', isDarkMode.value);
  };

  return {
    isDarkMode,
    toggleDarkMode,
    initTheme,
  }
}
