<script setup>
import ToDoItemFormComponent from '@/components/ToDoList/ToDoItemFormComponent.vue';

defineProps({
  item: {
    type: Object,
    required: true,
  },
  toDoList: {
    type: Object,
    required: true,
  },
  isEditing: {
    type: Boolean,
    default: false,
  },
  selectedToDoItem: {
    type: Object,
    default: null,
  },
  isEditingQuantity: {
    type: Boolean,
    default: false,
  },
  openMenuId: {
    type: String,
    default: null,
  }
});

defineEmits([
  'toggle-done',
  'open-edit',
  'close-form',
  'handle-response',
  'decrement-quantity',
  'increment-quantity',
  'edit-quantity',
  'save-quantity',
  'cancel-edit-quantity',
  'show-image',
  'toggle-menu',
  'open-complete-edit',
  'delete-item',
  'update:quantity'
]);
</script>

<template>
  <li
    class="flex gap-2 items-center bg-white dark:bg-gray-800 p-2 pl-4 rounded-lg mb-2 shadow-lg dark:shadow-gray-700 relative"
  >
    <button
      class="text-blue-600 dark:text-yellow-400 hover:text-blue-700 dark:hover:text-yellow-500"
      @click="$emit('toggle-done', item)"
    >
      <v-icon :name="item.done ? 'md-checkbox-outlined' : 'md-checkboxoutlineblank'"/>
    </button>

    <div v-if="isEditing && selectedToDoItem && selectedToDoItem.id === item.id" class="flex-grow">
      <ToDoItemFormComponent
        :initial-data="selectedToDoItem"
        :inline-form="true"
        @cancel="$emit('close-form')"
        @handle-response="(res) => $emit('handle-response', res)"
      />
    </div>

    <div v-else class="flex-grow">
      <span
        :class="[{ 'line-through text-gray-400 dark:text-gray-500': item.done }, { 'cursor-pointer': !item.done }]"
        @click="$emit('open-edit', item)"
      >
        {{ item.title }}
      </span>
    </div>

    <!-- Section de quantité avec boutons + et - -->
    <div v-if="toDoList.type && toDoList.type.name === 'Shopping'" class="flex items-center gap-2 mr-4">
      <button
        class="text-blue-600 dark:text-yellow-400 hover:text-blue-700 dark:hover:text-yellow-500"
        @click="$emit('decrement-quantity', item)"
      >
        <v-icon name="fa-minus" scale="1.2"/>
      </button>
      <div class="border border-gray-300 dark:border-gray-600 px-4 py-1 rounded">
        <input
          v-if="isEditingQuantity && selectedToDoItem && selectedToDoItem.id === item.id"
          :value="item.quantity"
          class="w-16 bg-transparent text-center border-none focus:outline-none"
          type="number"
          @input="$emit('update:quantity', { item, quantity: parseInt($event.target.value) })"
          @blur="$emit('save-quantity', item)"
          @keydown.enter="$emit('save-quantity', item)"
          @keydown.esc="$emit('cancel-edit-quantity', item)"
        />
        <span v-else @click="$emit('edit-quantity', item)">
          {{ item.quantity }}
        </span>
      </div>
      <button
        class="text-blue-600 dark:text-yellow-400 hover:text-blue-700 dark:hover:text-yellow-500"
        @click="$emit('increment-quantity', item)"
      >
        <v-icon name="fa-plus" scale="1.2"/>
      </button>
    </div>

    <!-- Actions pour chaque item -->
    <div class="flex justify-end gap-2 basis-14">
      <button
        v-if="item.image"
        class="flex m-auto text-blue-600 dark:text-yellow-400 hover:text-blue-700 dark:hover:text-yellow-500"
        @click="$emit('show-image', item)"
      >
        <v-icon name="md-photocamera-round" scale="1.2"/>
      </button>
      <!-- Icône 3 points pour ouvrir le menu -->
      <button
        v-if="!item.done"
        class="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white menu-container"
        @click.stop="$emit('toggle-menu', item)"
      >
        <v-icon name="bi-three-dots-vertical" scale="1.2"/>
      </button>
      <!-- Delete icon for done items -->
      <button
        v-if="item.done"
        class="text-blue-600 dark:text-yellow-400 hover:text-blue-700 dark:hover:text-yellow-500"
        @click="$emit('delete-item', item)"
      >
        <v-icon name="fa-regular-trash-alt" scale="1.2"/>
      </button>
    </div>

    <!-- Menu déroulant -->
    <div
      v-if="openMenuId === item.id"
      class="absolute right-4 top-10 bg-white dark:bg-gray-900 shadow-lg rounded-lg border border-gray-300 dark:border-gray-700 z-50 menu-container">
      <ul class="py-2 px-4">
        <li
          class="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded"
          @click="$emit('open-complete-edit', item)">
          ✏️ Éditer
        </li>
        <li
          class="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded text-red-600"
          @click="$emit('delete-item', item)">
          🗑️ Supprimer
        </li>
      </ul>
    </div>
  </li>
</template>
