<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import FormComponentBis from '@/components/Demo/FormComponent_2.vue'

const router = useRouter()
const isFormVisible = ref(false)
const currentProduct = ref({})
const products = ref([{
  id: 1,
  name: 'Smartphone X',
  price: 699.99,
  description: 'Latest model with advanced features',
  image: 'https://via.placeholder.com/800x600.png?text=Smartphone+X',
  available: true,
  quantity: 50
},
  {
    id: 2,
    name: 'Laptop Pro',
    price: 1299.99,
    description: 'Powerful laptop for professionals',
    image: 'https://via.placeholder.com/800x600.png?text=Laptop+Pro',
    available: true,
    quantity: 30
  },
  {
    id: 3,
    name: 'Wireless Earbuds',
    price: 129.99,
    description: 'High-quality sound with long battery life',
    image: 'https://via.placeholder.com/800x600.png?text=Wireless+Earbuds',
    available: false,
    quantity: 0
  }])

const fetchProducts = async () => {
  // try {
  //   const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/product`)
  //   products.value = response.data
  // } catch (error) {
  //   console.error('Error fetching products:', error)
  //   // Fallback to sample data if API fails
  //   products.value = sampleProducts
  // }
  console.log('fetchProducts')
}

const deleteProduct = async (id) => {
  // if (confirm('Are you sure you want to delete this product?')) {
  //   try {
  //     await axios.delete(`${import.meta.env.VITE_BASE_URL}/api/product/${id}`)
  //     products.value = products.value.filter(product => product.id !== id)
  //   } catch (error) {
  //     console.error('Error deleting product:', error)
  //   }
  // }
  console.log('deleteProduct')
}

const truncateText = (text, length) => {
  return text.length > length ? text.substring(0, length) + '...' : text
}

const showForm = (mode, product = {}) => {
  currentProduct.value = mode === 'edit' ? { ...product } : {}
  isFormVisible.value = true
}

const handleFormSubmit = async (formData) => {
  // try {
  //   if (formData.id) {
  //     // Edit existing product
  //     await axios.put(`${import.meta.env.VITE_BASE_URL}/api/product/${formData.id}`, formData)
  //     const index = products.value.findIndex(p => p.id === formData.id)
  //     if (index !== -1) {
  //       products.value[index] = formData
  //     }
  //   } else {
  //     // Create new product
  //     const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/product`, formData)
  //     products.value.push(response.data)
  //   }
  //   isFormVisible.value = false
  // } catch (error) {
  //   console.error('Error submitting product:', error)
  // Fallback to local update for demo purposes
  if (formData.id) {
    const index = products.value.findIndex(p => p.id === formData.id)
    if (index !== -1) {
      products.value[index] = formData
    }
  } else {
    formData.id = Math.max(...products.value.map(p => p.id)) + 1
    products.value.push(formData)
  }
  isFormVisible.value = false

  console.log('handleFormSubmit')
}

onMounted(fetchProducts)
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 text-blue-800 dark:text-yellow-300">Product Management</h1>

<!--    <router-link-->
<!--      :to="{ name: 'home' }"-->
<!--      class="bg-blue-600 dark:bg-yellow-400 text-white dark:text-gray-900 px-4 py-2 rounded-md mb-4 inline-block hover:bg-blue-700 dark:hover:bg-yellow-500 transition duration-300"-->
<!--    >-->
<!--      Add New Product-->
<!--    </router-link>-->
    <button
      @click="showForm('create')"
      v-if="!isFormVisible"
      class="bg-blue-600 dark:bg-yellow-400 text-white dark:text-gray-900 px-4 py-2 rounded-md mb-4 inline-block hover:bg-blue-700 dark:hover:bg-yellow-500 transition duration-300"
    >
      ADD New Product
    </button>

    <FormComponentBis
      v-if="isFormVisible"
      :product="currentProduct"
      @submit="handleFormSubmit"
      @cancel="isFormVisible = false"
    />

    <div class="grid grid-cols-1 gap-4 md:hidden">
      <!-- Mobile view (cards) -->
      <div v-for="product in products" :key="product.id" class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <img :src="product.image" :alt="product.name" class="w-full h-48 object-cover rounded-md mb-4">
        <h2 class="text-xl font-semibold mb-2">{{ product.name }}</h2>
        <p class="text-gray-600 dark:text-gray-300 mb-2">${{ product.price }}</p>
        <p class="text-gray-600 dark:text-gray-300 mb-2">{{ product.description }}</p>
        <p class="mb-2">
          <span class="font-semibold">Available:</span>
          <span :class="product.available ? 'text-green-600' : 'text-red-600'">
            {{ product.available ? 'Yes' : 'No' }}
          </span>
        </p>
        <p class="mb-4"><span class="font-semibold">Quantity:</span> {{ product.quantity }}</p>
        <div class="flex justify-between">
          <router-link :to="{ name: 'home', params: { id: product.id } }"
                       class="text-blue-600 dark:text-yellow-400 hover:text-blue-800 dark:hover:text-yellow-600">
            View
          </router-link>
          <router-link :to="{ name: 'home', params: { id: product.id } }" class="text-yellow-600 hover:text-yellow-800">
            Edit
          </router-link>
          <button @click="deleteProduct(product.id)" class="text-red-600 hover:text-red-800">
            Delete
          </button>
        </div>
      </div>
    </div>

    <div class="hidden md:block overflow-x-auto">
      <!-- Desktop view (table) -->
      <table class="w-full bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <thead class="bg-gray-200 dark:bg-gray-700">
        <tr>
          <th class="px-4 py-2 text-left">Image</th>
          <th class="px-4 py-2 text-left">Name</th>
          <th class="px-4 py-2 text-left">Price</th>
          <th class="px-4 py-2 text-left">Description</th>
          <th class="px-4 py-2 text-left">Available</th>
          <th class="px-4 py-2 text-left">Quantity</th>
          <th class="px-4 py-2 text-left">Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="product in products" :key="product.id" class="border-b dark:border-gray-700">
          <td class="px-4 py-2">
            <img :src="product.image" :alt="product.name" class="w-16 h-16 object-cover rounded-md">
          </td>
          <td class="px-4 py-2">{{ product.name }}</td>
          <td class="px-4 py-2">${{ product.price.toFixed(2) }}</td>
          <td class="px-4 py-2">{{ product.description }}</td>
          <td class="px-4 py-2">
              <span :class="product.available ? 'text-green-600' : 'text-red-600'">
                {{ product.available ? 'Yes' : 'No' }}
              </span>
          </td>
          <td class="px-4 py-2">{{ product.quantity }}</td>
          <td class="px-4 py-2">
            <div class="flex space-x-2">
              <router-link :to="{ name: 'home', params: { id: product.id } }"
                           class="text-blue-600 dark:text-yellow-400 hover:text-blue-800 dark:hover:text-yellow-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fill-rule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clip-rule="evenodd" />
                </svg>
              </router-link>
              <router-link :to="{ name: 'home', params: { id: product.id } }"
                           class="text-yellow-600 hover:text-yellow-800">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </router-link>
              <button @click="deleteProduct(product.id)" class="text-red-600 hover:text-red-800">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
/* No additional styles needed as we're using Tailwind classes for responsiveness */
</style>