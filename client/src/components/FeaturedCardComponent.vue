<script setup>
</script>

<template>
  <div class="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white p-6 rounded-lg shadow-md">
    <div class="flex items-center mb-4">
      <div class="mr-4">
        <slot name="icon"></slot>
      </div>
      <h2 class="text-2xl font-semibold">
        <slot name="title"></slot>
      </h2>
    </div>
    <p>
      <slot name="description"></slot>
    </p>
  </div>
</template>

<style scoped>
</style>
