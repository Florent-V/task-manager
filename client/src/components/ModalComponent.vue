<script setup>

</script>

<template>
  <div
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      @click.self="$emit('close')"
  >
    <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-lg w-full relative"
    >
      <button
          @click="$emit('close')"
          class="absolute top-3 right-3 text-gray-600 dark:text-gray-300 hover:text-red-600"
      >
        ✖
      </button>
      <slot />
    </div>
  </div>
</template>


<style scoped>

</style>