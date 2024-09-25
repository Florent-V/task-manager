<script setup>
import { reactive } from 'vue';

const product = reactive({
  name: 'Awesome Product'
});

const plans = reactive([
  {
    name: 'Free',
    price: '$0/month',
    features: [
      {name: 'Basic Support', included: true},
      {name: 'Access to Basic Features', included: true},
      {name: 'Advanced Analytics', included: false},
      {name: 'Custom Branding', included: false}
    ]
  },
  {
    name: 'Pro',
    price: '$20/month',
    features: [
      {name: 'Priority Support', included: true},
      {name: 'Access to All Features', included: true},
      {name: 'Advanced Analytics', included: true},
      {name: 'Custom Branding', included: false}
    ]
  },
  {
    name: 'Enterprise',
    price: '$50/month',
    features: [
      {name: 'Dedicated Support', included: true},
      {name: 'Access to All Features', included: true},
      {name: 'Advanced Analytics', included: true},
      {name: 'Custom Branding', included: true}
    ]
  }
]);

</script>

<template>
  <div class="flex-grow text-gray-900 dark:text-gray-100 py-4">
    <div class="product-page text-center">
      <h1 class="text-4xl font-bold mb-8 text-blue-800 dark:text-yellow-300">{{ product.name }}</h1>
      <div class="flex flex-wrap justify-center gap-8">
        <div
            class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-700 p-6 w-64 transition duration-300 transform hover:scale-105"
            v-for="(plan, index) in plans"
            :key="index"
        >
          <h2 class="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">{{ plan.name }}</h2>
          <p class="text-3xl font-bold text-blue-600 dark:text-yellow-400 mb-6">{{ plan.price }}</p>
          <ul class="list-none p-0">
            <li class="flex items-center mb-3" v-for="(feature, index) in plan.features" :key="index">
            <span :class="{'text-green-500': feature.included, 'text-red-500': !feature.included}">
              {{ feature.included ? '✔️' : '❌' }}
            </span>
              <span class="ml-2 text-gray-700 dark:text-gray-300">{{ feature.name }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>
.product-page {
  text-align: center;
}

.card-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
}
</style>
