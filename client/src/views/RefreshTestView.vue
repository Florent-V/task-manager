<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { client } from '@/utils/requestMaker.js';

const authStore = useAuthStore();

onMounted(async () => {
  const data = await client.post('/api/auth/refresh-token');
});

</script>

<template>
  <div>
    <h1>Refresh Test</h1>
    <p>Refresh this page to see if the data is still there.</p>
  </div>
</template>