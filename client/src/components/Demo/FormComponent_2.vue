<script setup>
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  product: {
    type: Object,
    default: () => ({
      id: null,
      name: '',
      price: 0,
      description: '',
      image: '',
      available: true,
      quantity: 0
    })
  }
});
const emit = defineEmits(['submit', 'cancel']);

const form = ref({ ...props.product });
const isEditing = computed(() => !!form.value.id);

const submitForm = () => {
  emit('submit', { ...form.value });
};

onMounted(() => {
  form.value = { ...props.product };
});
</script>

<template>
  <div class="bg-white dark:bg-gray-800 p-6 my-6 rounded-lg shadow-md">
    <h2 class="text-2xl font-bold mb-4">{{ isEditing ? 'Edit Product' : 'Add New Product' }}</h2>
    <form @submit.prevent="submitForm">
      <div class="mb-4">
        <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
        <input type="text" id="name" v-model="form.name" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white border py-3 px-4">
      </div>
      <div class="mb-4">
        <label for="price" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price</label>
        <input type="number" id="price" v-model="form.price" step="0.01" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white border py-3 px-4">
      </div>
      <div class="mb-4">
        <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
        <textarea id="description" v-model="form.description" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white border py-3 px-4"></textarea>
      </div>
      <div class="mb-4">
        <label for="image" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image URL</label>
        <input type="url" id="image" v-model="form.image" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white border py-3 px-4">
      </div>
      <div class="mb-4">
        <label class="flex items-center">
          <input type="checkbox" v-model="form.available" class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 h-5 w-5">
          <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Available</span>
        </label>
      </div>
      <div class="mb-4">
        <label for="quantity" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
        <input type="number" id="quantity" v-model="form.quantity" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white border py-3 px-4">
      </div>
      <div class="flex justify-end space-x-2">
        <button type="button" @click="$emit('cancel')" class="px-6 py-3 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
          Cancel
        </button>
        <button type="submit" class="px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600">
          {{ isEditing ? 'Update' : 'Create' }}
        </button>
      </div>
    </form>
  </div>
</template>

