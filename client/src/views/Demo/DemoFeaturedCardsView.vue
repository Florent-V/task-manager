<script setup>
import FeatureCard from '@/components/FeaturedCardComponent.vue'
</script>

<template>
  <div class="text-gray-900 dark:text-gray-100 flex flex-col items-center p-8">
    <h1 class="text-4xl font-bold mb-8 text-blue-800 dark:text-yellow-300">SaaS Feature Overview</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <FeatureCard>
        <template #icon>
          <span class="text-green-500">✔️</span>
        </template>
        <template #title>
          Free Plan
        </template>
        <template #description>
          Access to basic features, limited support.
        </template>
      </FeatureCard>
      <FeatureCard>
        <template #icon>
          <span class="text-yellow-500">⭐</span>
        </template>
        <template #title>
          Pro Plan
        </template>
        <template #description>
          Access to all features, priority support.
        </template>
      </FeatureCard>
      <FeatureCard>
        <template #icon>
          <span class="text-blue-500">🚀</span>
        </template>
        <template #title>
          Enterprise Plan
        </template>
        <template #description>
          Custom solutions and dedicated support.
        </template>
      </FeatureCard>
    </div>
  </div>
</template>

<style scoped>
</style>
