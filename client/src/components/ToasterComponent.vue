<script setup>
import { ref } from 'vue';

const visible = ref(false);
const message = ref('');

const showToaster = (msg) => {
  message.value = msg;
  visible.value = true;
  setTimeout(() => {
    visible.value = false;
  }, 3000);
};

export { showToaster };
</script>

<template>
  <transition name="fade">
    <div
      v-if="visible"
      class="fixed top-5 right-5 bg-green-500 text-white py-2 px-4 rounded shadow-lg"
    >
      {{ message }}
    </div>
  </transition>
</template>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
