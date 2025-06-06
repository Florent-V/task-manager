<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { client } from '@/utils/requestMaker.js';
import { hookApi } from "@/utils/requestHook.js";
import useFormErrors from "@/utils/handleFormErrors.js";
import logger from "@/utils/logger.js";

const emit = defineEmits(['handleResponse', 'cancel']);
const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({
      username: '',
      firstName: '',
      lastName: '',
      email: '',
    }),
  },
});

const route = useRoute();
const { isLoading, error, executeRequest } = hookApi();
const formData = ref({ ...props.initialData });
const imageError = ref(null);
const MAX_FILE_SIZE = 10 * 1024 * 1024;


watch(() => props.initialData, (newValue) => {
      formData.value = newValue
          ? { ...newValue }
          : { username: '', firstName: '', lastName: '', email: '', image: null };
    },
    { immediate: true }
);

// Utilitaire de gestions des erreurs de formulaire
const { errors, defaultError, setErrors, clearErrors } = useFormErrors({ ...formData.value });

function handleFile(event) {
  imageError.value = null;
  const selectedFile = event.target.files[0];
  if (!selectedFile) return;

  if (selectedFile.size > MAX_FILE_SIZE) {
    error.value = 'Le fichier dépasse la taille maximale autorisée de 10 Mo.';
    // On nettoie le champ file
    event.target.value = '';
    return;
  }

  formData.value.image = selectedFile;
  // const reader = new FileReader();
  // reader.readAsDataURL(selectedFile);
  // reader.onload = () => {
  //   email.value.attachments.push({
  //     filename: selectedFile.name,
  //     content: reader.result,
  //     size: selectedFile.size,
  //   });
  //   // On nettoie le champ file pour ajoute d'autres fichiers
  //   event.target.value = '';
  // };
  // reader.onerror = (error) => {
  //   console.log('Error: ', error);
  // };
}

const submitForm = async () => {
  const data = {
    username: formData.value.username,
    firstName: formData.value.firstName,
    lastName: formData.value.lastName,
    email: formData.value.email,
  };
  if (formData.value.image) {
    data.image = formData.value.image;
  }

  console.log('Form data:', data);

  try {
    const response = await executeRequest(
        () => client.patchWithFile(`/api/user/me`, data)
    );
    emit('handleResponse', response);
    closeForm();
  } catch (err) {
    logger.error('Error in form submission', err?.response?.data?.message || err.message);
    setErrors(err);
  }
};

const closeForm = () => {
  resetForm();
  emit('cancel');
};

const resetForm = () => {
  clearErrors();
  formData.value = {
    username: '',
    firstName: '',
    lastName: '',
    email: '',
  };
};
</script>

<template>
  <div>
    <h1 class="text-4xl font-bold px-4 my-4 text-blue-800 dark:text-yellow-300">
      Modifier le Profil Utilisateur
    </h1>
  </div>

  <div class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg dark:shadow-gray-700">
    <h2 class="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 mb-2 px-4 py-2 rounded-t-lg text-xl font-semibold">
      Modification du profil
    </h2>

    <form @submit.prevent="submitForm">

      <!-- Username & Image block -->
      <div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-x-0">
          <!-- UserName field -->
          <label for="username" class="block text-gray-700 dark:text-gray-300 col-span-2 md:col-span-3">Pseudo</label>
          <div class="relative col-span-2 md:col-span-3">
            <input
                type="text"
                maxlength="50"
                id="username"
                placeholder="Mon pseudo"
                class="peer border border-gray-300 dark:border-gray-600 p-3 rounded-lg md:rounded-r-none focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-yellow-400 transition w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                v-model="formData.username"
            />
          </div>
          <!-- File upload field -->
          <div class="relative col-span-2 md:col-span-1">
            <!-- Hidden file input -->
            <input
                type="file"
                id="image"
                accept="image/*"
                capture="environment"
                class="hidden"
                @change="handleFile"
            />
            <!-- Custom button with image icon -->
            <label
                for="image"
                class="flex items-center justify-center gap-2 cursor-pointer w-full h-full m-0 bg-blue-600 dark:bg-yellow-400 text-white dark:text-gray-900 hover:bg-blue-700 dark:hover:bg-yellow-500 px-6 py-3 rounded-lg md:rounded-l-none text-lg transition duration-300 font-semibold"
            >
              <v-icon name="md-add" scale="1.2" />
              <v-icon name="md-photocamera" scale="1.2" />
            </label>
          </div>

          <!-- Display the selected file name -->
          <div class="col-span-2 md:col-span-4">
            <p
                v-if="formData.image"
                class="text-sm text-gray-600 dark:text-gray-300"
            >
              Image sélectionnée : {{ formData.image.name }}
            </p>
          </div>

          <div class="col-span-2 md:col-span-4">
            <p v-if="errors.username" class="text-sm px-2 mt-2 text-red-600 dark:text-red-400">{{ errors.username }}</p>
          </div>

          <!-- Display image-specific errors -->
          <div class="col-span-2 md:col-span-4">
            <p v-if="errors.image" class="text-sm px-2 text-red-600 dark:text-red-400">{{ errors.image }}</p>
            <p v-if="imageError" class="text-sm px-2 text-red-600 dark:text-red-400">{{ imageError }}</p>
          </div>

        </div>
      </div>

<!--      <div class="mb-4">-->
<!--        <label for="username" class="block text-gray-700 dark:text-gray-300">Pseudo</label>-->
<!--        <input-->
<!--            type="text"-->
<!--            id="username"-->
<!--            v-model="formData.username"-->
<!--            class="mt-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"-->
<!--            placeholder="Nom d'utilisateur"-->
<!--            required-->
<!--        />-->
<!--        <p v-if="errors.username" class="mt-2 text-sm text-red-600 dark:text-red-400">{{ errors.username }}</p>-->
<!--      </div>-->

      <div class="mb-4 -mt-2">
        <label for="firstName" class="block text-gray-700 dark:text-gray-300">Prénom</label>
        <input
            type="text"
            id="firstName"
            v-model="formData.firstName"
            class="mt-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Prénom"
            required
        />
        <p v-if="errors.firstName" class="mt-2 text-sm text-red-600 dark:text-red-400">{{ errors.firstName }}</p>
      </div>

      <div class="mb-4">
        <label for="lastName" class="block text-gray-700 dark:text-gray-300">Nom</label>
        <input
            type="text"
            id="lastName"
            v-model="formData.lastName"
            class="mt-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Nom"
            required
        />
        <p v-if="errors.lastName" class="mt-2 text-sm text-red-600 dark:text-red-400">{{ errors.lastName }}</p>
      </div>

      <div class="mb-4">
        <label for="email" class="block text-gray-700 dark:text-gray-300">Email</label>
        <input
            type="email"
            id="email"
            v-model="formData.email"
            class="mt-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Email"
            required
        />
        <p v-if="errors.email" class="mt-2 text-sm text-red-600 dark:text-red-400">{{ errors.email }}</p>
      </div>

      <div class="mb-4">
        <p v-if="defaultError" class="text-sm px-2 text-red-600 dark:text-red-400">{{ defaultError }}</p>
        <p v-if="error" class="text-sm px-2 text-red-600 dark:text-red-400">{{ error }}</p>
      </div>

<!--      <div class="mb-4">-->
<!--        <label for="picture" class="block text-gray-700 dark:text-gray-300">Photo de profil</label>-->
<!--        <input-->
<!--            type="url"-->
<!--            id="picture"-->
<!--            v-model="formData.picture"-->
<!--            class="mt-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"-->
<!--            placeholder="URL de la photo de profil"-->
<!--            required-->
<!--        />-->
<!--        <p v-if="errors.picture" class="mt-2 text-sm text-red-600 dark:text-red-400">{{ errors.picture }}</p>-->
<!--      </div>-->

      <div class="flex justify-end gap-4">
        <button
            @click="closeForm"
            class="w-full bg-gray-600 text-white px-6 py-3 rounded-lg"
        >
          Annuler
        </button>
        <button
            type="submit"
            class="w-full m-auto bg-blue-600 dark:bg-yellow-400 text-white dark:text-gray-900 hover:bg-blue-700 dark:hover:bg-yellow-500 px-6 py-3 rounded-lg text-lg transition duration-300 font-semibold"
        >
          Modifier
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
</style>
