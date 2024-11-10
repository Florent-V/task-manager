import { defineStore } from 'pinia'
import logger from "@/utils/logger.js";

// Utiliser le localStorage pour persister les produits
const getLocalStorageProducts = () => {
  const storedProducts = localStorage.getItem('products');
  return storedProducts ? JSON.parse(storedProducts) : [];
};

const setLocalStorageProducts = (products) => {
  localStorage.setItem('products', JSON.stringify(products));
};

export const useProductsStore = defineStore('productsStore', {
  state: () => ({
    products: getLocalStorageProducts(),
  }),
  getters: {
    availableProducts: (state) => state.products.filter(product => product.available),
  },
  actions: {
    fetchProducts() {
      // Simuler une requête API
      this.products = [
        {
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
        },
      ];
      setLocalStorageProducts(this.products);
    },
    addProduct(product) {
      logger.debug('this.products before:', this.products);
      logger.debug('addProduct:', product);
      const newId = Math.max(...this.products.map(p => p.id), 0) + 1;
      logger.debug('newId:', newId);
      const newProduct = { ...product, id: newId };
      logger.debug('newProduct:', newProduct);
      this.products.push(newProduct);
      logger.debug('this.products after:', this.products);
      setLocalStorageProducts(this.products);
    },
    updateProduct(updatedProduct) {
      const index = this.products.findIndex(p => p.id === updatedProduct.id);
      if (index !== -1) {
        this.products[index] = updatedProduct;
        setLocalStorageProducts(this.products);
      }
    },
    deleteProduct(id) {
      this.products = this.products.filter(product => product.id !== id);
      setLocalStorageProducts(this.products);
    },
  },
});
