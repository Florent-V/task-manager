<script setup>
import { ref, onMounted } from 'vue';

import { apiBaseUrl, client } from '@/utils/requestMaker.js';
import { hookApi } from '@/utils/requestHook.js';
import { setTitle, setDescription } from "@/utils/documentInfos.js";
import logger from '@/utils/logger.js';
import UserFormComponent from "@/components/User/UserFormComponent.vue";
import LoaderComponent from '@/components/LoaderComponent.vue';

const { isLoading, error, executeRequest } = hookApi();
const filesApiUrl = `${apiBaseUrl}/api/uploads`;

const user = ref([]);
const showForm = ref(false);

const openEditForm = () => {
  // Emit an event to open the edit form
  showForm.value = true;
  console.log('Open edit form');
};

const closeForm = () => {
  showForm.value = false;
};

const handleResponseFormSubmit = async (response) => {
  user.value = response.user;
  closeForm();
};

const fetchUser = async () => {
  try {
    const data = await executeRequest(() => client.get('/api/user/me'));
    user.value = data.user;
  } catch (err) {
    logger.error('Error in fetching size data', err);
  }
};

onMounted(async () => {
  await fetchUser();
  setTitle(`User - ${user.value.username} - Mes informations`);
  setDescription(`Cette page contient les informations de l'utilisateur ${user.value.username}`);
});
</script>

<template>
  <div class="container mx-auto px-4 py-8">

    <!-- Loader -->
    <LoaderComponent v-if="isLoading"/>

    <div v-else>
      <!-- UserForm -->
      <UserFormComponent
          v-if="showForm"
          :initial-data="user"
          @handle-response="handleResponseFormSubmit"
          @cancel="closeForm"
      />

      <div v-else>

        <div class="flex justify-between items-center mb-6 px-6">
          <h1 class="text-4xl font-bold text-center text-blue-800 dark:text-yellow-300">
            Mes informations personnelles
          </h1>
        </div>

        <!-- User Info Section-->
        <div class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg dark:shadow-gray-700">
          <h2 class="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 mb-2 px-4 py-2 rounded-t-lg text-xl font-semibold">
            Informations de l'utilisateur
          </h2>

          <div class="my-4">
            <div class="flex flex-col md:flex-row content-center items-center">
              <!-- Block photo -->
              <div class="md:w-1/3 flex justify-center items-center mb-4 md:mb-0">
                <img
                    :src="`${filesApiUrl}/${user.image ?? 'default-profile-picture.png'}`"
                    alt="Aperçu"
                    class="max-w-full max-h-[80vh] rounded-lg"
                />
              </div>

              <!-- Block infos -->
              <div class="md:w-2/3 md:pl-4">
                <div class="mb-4">
                  <label class="block text-gray-700 dark:text-gray-300">Nom d'utilisateur</label>
                  <p class="mt-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    {{ user.username }}
                  </p>
                </div>

                <div class="mb-4">
                  <label class="block text-gray-700 dark:text-gray-300">Prénom</label>
                  <p class="mt-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    {{ user.firstName }}
                  </p>
                </div>

                <div class="mb-4">
                  <label class="block text-gray-700 dark:text-gray-300">Nom</label>
                  <p class="mt-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    {{ user.lastName }}
                  </p>
                </div>

                <div class="mb-4">
                  <label class="block text-gray-700 dark:text-gray-300">Email</label>
                  <p class="mt-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    {{ user.email }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end gap-4">
            <button
                class="w-full m-auto bg-blue-600 dark:bg-yellow-400 text-white dark:text-gray-900 hover:bg-blue-700 dark:hover:bg-yellow-500 px-6 py-3 rounded-lg text-lg transition duration-300 font-semibold"
                @click="openEditForm"
            >
              Modifier
            </button>
          </div>

          <div v-if="error">
            <p class="text-center text-red-700 dark:text-red-300 text-xl">{{ error }}</p>
          </div>
        </div>


      </div>

    </div>

  </div>

</template>

<style scoped>
.container {
  max-width: 1200px;
}
</style>
