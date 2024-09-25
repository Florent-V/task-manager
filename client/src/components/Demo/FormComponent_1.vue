<script setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({
  editProduct: {
    type: Object,
    default: () => ({ name: '', price: 0, description: '', image: '', available: true, quantity: 0 }),
  },
});

const emit = defineEmits(['cancel', 'submitForm']);

const form = ref({ ...props.editProduct});
const editMode = computed(() => !!form.value.id);

const submitForm = () => {
  emit('submitForm', { ...form.value });
  closeForm();
};

const closeForm = () => {
  resetForm();
  emit('cancel');
};

const resetForm = () => {
  form.value = {
    name: '',
    price: 0,
    description: '',
    image: '',
    available: true,
    quantity: 0,
  };
};

watch(() => props.editProduct, (newValue) => {
    form.value = { ...newValue };
}, { immediate: true });

</script>

<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
    <div class="relative top-20 mx-auto p-5 border w-full sm:w-[28rem] md:w-[32rem] lg:w-[36rem] shadow-lg rounded-md bg-white dark:bg-gray-800 dark:border-gray-700">
      <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
        {{ editMode ? 'Edit Product' : 'Add New Product' }}
      </h3>
      <form @submit.prevent="submitForm">
        <div class="mb-4">
          <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
          <input type="text" id="name" v-model="form.name" required
                 class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white border py-3 px-4">
        </div>
        <div class="mb-4">
          <label for="price" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price</label>
          <input type="number" id="price" v-model="form.price" step="0.01" required
                 class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white border py-3 px-4">
        </div>
        <div class="mb-4">
          <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <textarea id="description" v-model="form.description" rows="3"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white border py-3 px-4"></textarea>
        </div>
        <div class="mb-4">
          <label for="image" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image URL</label>
          <input type="url" id="image" v-model="form.image"
                 class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white border py-3 px-4">
        </div>
        <div class="mb-4">
          <label class="flex items-center">
            <input type="checkbox" id="available" v-model="form.available"
                   class="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-offset-0 focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 h-5 w-5">
            <span class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Available</span>
          </label>
        </div>
        <div class="mb-4">
          <label for="quantity" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
          <input type="number" id="quantity" v-model="form.quantity" required
                 class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white border py-3 px-4">
        </div>
        <div class="flex justify-end">
          <button type="button" @click="closeForm" class="mr-2 px-6 py-3 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-700">
            Cancel
          </button>
          <button type="submit" class="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
            {{ editMode ? 'Update' : 'Add' }} Product
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
