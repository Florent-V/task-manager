<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick  } from 'vue';

const emit = defineEmits(['submit', 'cancel']);
const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({ title: '', quantity: 0 }),
  },
});

const formData = ref({ ...props.initialData });
const isSubmitted = ref(false);

const submitForm = () => {
  if (!formData.value.title || !formData.value.title.trim() || isSubmitted.value || formData.value.title === props.initialData.title) {
    console.log('submitForm - no title or already submitted');
    closeForm();
    return;
  }
  const data = {
    title: formData.value.title,
  };
  emit('submit', data);
  isSubmitted.value = true;
  closeForm();
};

const closeForm = () => {
  resetForm();
  emit('cancel');
};

const resetForm = () => {
  formData.value = {
    title: '',
    description: '',
  };
};

onMounted( async () => {
  document.getElementById('editToDoListTitleInput').focus();
});

watch(() => props.initialData, (newValue) => {
      formData.value = { ...newValue };
    }
);
</script>

<template>
  <form @submit.prevent="submitForm">
    <input
      class="peer border border-gray-300 dark:border-gray-600 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-yellow-400 transition w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      type="text"
      id="editToDoListTitleInput"
      v-model="formData.title"
      @blur="submitForm"
    />
  </form>
</template>

<style scoped>
button {
  cursor: pointer;
}
</style>
