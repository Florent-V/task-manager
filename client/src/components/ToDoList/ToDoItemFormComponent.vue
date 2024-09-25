<script setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({title: '', quantity: 0}),
  },
});
const emit = defineEmits(['submit', 'cancel']);

const formData = ref({...props.initialData});
const isEditing = computed(() => !!formData.value.id);

const submitForm = () => {
  const data = {
    title: formData.value.title,
  };
  emit('submit', data);
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

watch(() => props.initialData, (newValue) => {
      formData.value = {...newValue};
    }
);
</script>

<template>

  <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg dark:shadow-gray-700 mb-3">
    <h2 v-if="!isEditing" class="mb-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-t-lg text-xl font-semibold">
      {{ isEditing ? 'Edition :' : 'Nouvelle tâche :' }}
    </h2>

    <form @submit.prevent="submitForm">
      <div class="">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-x-0">
          <!-- Name field -->
          <div class="relative col-span-2 md:col-span-3">
            <input
                type="text"
                id="title"
                placeholder=" "
                class="peer border border-gray-300 dark:border-gray-600 pt-6 pb-2 p-4 rounded-lg md:rounded-r-none focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-yellow-400 transition w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                v-model="formData.title"
            />
            <label
                for="title"
                class="rounded absolute left-3 top-1 bg-white dark:bg-gray-700 px-1 text-gray-600 dark:text-gray-100 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:left-4 peer-placeholder-shown:text-gray-400 dark:peer-placeholder-shown:text-gray-100 peer-placeholder-shown:bg-transparent peer-focus:bg-white dark:peer-focus:bg-gray-700 peer-focus:top-1 peer-focus:left-3 peer-focus:text-blue-600 dark:peer-focus:text-yellow-400 peer-not-placeholder-shown:top-2 peer-not-placeholder-shown:left-3 peer-not-placeholder-shown:bg-white dark:peer-not-placeholder-shown:bg-gray-700"
            >
              Titre
            </label>
          </div>

<!--          <div class="relative">-->
<!--            <input-->
<!--                type="number"-->
<!--                id="quantity"-->
<!--                placeholder=" "-->
<!--                class="peer border border-gray-300 dark:border-gray-600 pt-6 pb-2 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-yellow-400 transition w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"-->
<!--                v-model="formData.quantity"-->
<!--            />-->
<!--            <label-->
<!--                for="quantity"-->
<!--                class="rounded absolute left-3 top-1 bg-white dark:bg-gray-700 px-1 text-gray-600 dark:text-gray-100 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:left-4 peer-placeholder-shown:text-gray-400 dark:peer-placeholder-shown:text-gray-100 peer-placeholder-shown:bg-transparent peer-focus:bg-white dark:peer-focus:bg-gray-700 peer-focus:top-1 peer-focus:left-3 peer-focus:text-blue-600 dark:peer-focus:text-yellow-400 peer-not-placeholder-shown:top-2 peer-not-placeholder-shown:left-3 peer-not-placeholder-shown:bg-white dark:peer-not-placeholder-shown:bg-gray-700"-->
<!--            >-->
<!--              Quantité-->
<!--            </label>-->
<!--          </div>-->

          <!-- Cancel button -->
          <div class="text-center flex md:col-span-4 md:order-3">
            <button
                @click="closeForm"
                class="w-full m-0 bg-gray-600 text-white px-6 py-3 rounded-lg"
            >
              Cancel
            </button>
          </div>

          <!-- Add button -->
          <div class="text-right flex  md:order-2">
            <button
                type="submit"
                class="w-full m-0 bg-blue-600 dark:bg-yellow-400 text-white dark:text-gray-900 hover:bg-blue-700 dark:hover:bg-yellow-500 px-6 py-3 rounded-lg md:rounded-l-none text-lg transition duration-300 font-semibold"
            >
              {{ isEditing ? 'Modifier' : '+ Ajouter' }}
            </button>
          </div>




        </div>
      </div>
    </form>


    <!--        <div class="py-4">-->
    <!--      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">-->
    <!--        &lt;!&ndash; Name field &ndash;&gt;-->
    <!--        <div class="relative order-1">-->
    <!--          <input type="text" id="title" placeholder=" " class="peer border border-gray-300 dark:border-gray-600 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-yellow-400 transition w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white" v-model="formData.title" />-->
    <!--          <label for="title" class="rounded absolute left-3 -top-2 bg-white dark:bg-transparent peer-focus:bg-white dark:peer-focus:bg-gray-800 px-1 text-gray-600 dark:text-gray-100 peer-placeholder-shown:bg-transparent peer-placeholder-shown:top-4 peer-placeholder-shown:left-4 peer-placeholder-shown:text-gray-400 dark:peer-placeholder-shown:text-gray-100 transition-all peer-focus:-top-4 peer-focus:left-3 peer-focus:text-blue-600 dark:peer-focus:text-yellow-400">Titre</label>-->
    <!--        </div>-->

    <!--        &lt;!&ndash; Add button (takes full width in its column) &ndash;&gt;-->
    <!--        <div class="text-right md:text-left order-3 md:order-2">-->
    <!--          <button @click="save" class="w-full bg-blue-600 dark:bg-yellow-400 text-white dark:text-gray-900 hover:bg-blue-700 dark:hover:bg-yellow-500 px-6 py-3 rounded-lg text-lg transition duration-300 font-semibold">Add</button>-->
    <!--        </div>-->

    <!--        &lt;!&ndash; Description field (second row on desktop, second on mobile as well) &ndash;&gt;-->
    <!--        <div class="relative order-2 md:col-span-2">-->
    <!--          <textarea id="description" rows="4" placeholder=" " class="peer border border-gray-300 dark:border-gray-600 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-yellow-400 transition w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white" v-model="formData.description"></textarea>-->
    <!--          <label for="description" class="rounded absolute left-3 -top-2 bg-white dark:bg-transparent peer-focus:bg-white dark:peer-focus:bg-gray-800 px-1 text-gray-600 dark:text-gray-100 peer-placeholder-shown:bg-transparent peer-placeholder-shown:top-4 peer-placeholder-shown:left-4 peer-placeholder-shown:text-gray-400 dark:peer-placeholder-shown:text-gray-100 transition-all peer-focus:-top-4 peer-focus:left-3 peer-focus:text-blue-600 dark:peer-focus:text-yellow-400">Description</label>-->
    <!--        </div>-->

    <!--        <div class="text-center order-4 md:col-span-2">-->
    <!--          <button @click="emit('cancel')" class="w-full md:w-1/2 bg-gray-600 text-white px-6 py-3 rounded-lg">Cancel</button>-->
    <!--        </div>-->

    <!--      </div>-->
    <!--    </div>-->

  </div>

</template>

<style scoped>
button {
  cursor: pointer;
}
</style>
