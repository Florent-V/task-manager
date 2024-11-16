<script setup>
import { reactive, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import ProductFormComponent from '@/components/Product/ProductFormComponent.vue';
import { client } from '@/utils/requestMaker.js';
import logger from "@/utils/logger.js";

const route = useRoute();
const state = reactive({
  isEditMode: !!route.params.id,
  product: {
    name: '',
    price: null,
    description: '',
    image: null,
    available: false,
    quantity: null,
    releaseDate: ''
  }
});

onMounted(async () => {
  if (state.isEditMode) {
    try {
      const data = await client.get(`/api/product/${route.params.id}`);
      // Mettre à jour l'objet product entier
      state.product = { ...data.product };
      logger.debug('product in productFormView', state.product);
    } catch (err) {
      logger.error("Erreur lors de la récupération du produit", err);
    } 
  } 
});

// Utilisez computed pour créer une version réactive de product
const productComputed = computed(() => state.product);
</script>

<template>
  <ProductFormComponent
    :product="productComputed"
    :isEditMode="state.isEditMode"
  />
</template>
