<script setup>
import { ref, computed } from 'vue';

// State
const tasks = ref([
  { title: 'Make todo list', completed: true },
  { title: 'Go skydiving', completed: false },
]);

const newTask = ref('');

// Computed properties
const incompleteCount = computed(() => {
  return tasks.value.filter(task => !task.completed).length;
});

// Methods
const addTask = () => {
  if (newTask.value.trim()) {
    tasks.value.push({
      title: newTask.value,
      completed: false,
    });
    newTask.value = '';
  }
};

const completeTask = task => {
  task.completed = !task.completed;
};

const removeTask = index => {
  tasks.value.splice(index, 1);
};

const clearCompleted = () => {
  tasks.value = tasks.value.filter(task => !task.completed);
};

const clearAll = () => {
  tasks.value = [];
};

const getClassName = task => {
  return task.completed
      ? 'tasks__item__toggle--completed text-green-700 dark:text-green-400 line-through'
      : 'tasks__item__toggle text-gray-900 dark:text-gray-100';
};
</script>

<template>
  <section class="tasks bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 max-w-xl mx-auto">
    <h1 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
      Tasks 
      <transition name="fade">
        <small v-if="incompleteCount" class="text-sm text-gray-600 dark:text-gray-300">{{ incompleteCount }}</small>
      </transition>
    </h1>
    <div class="flex mt-4">
      <input type="text"
             class="input-group-field flex-1 p-2 border rounded-l-lg border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700"
             v-model="newTask"
             @keyup.enter="addTask"
             placeholder="New task"
      />
      <button @click="addTask" 
              class="button bg-blue-500 text-white px-4 rounded-r-lg hover:bg-blue-600"
      >
        <i class="fa fa-plus"></i> Add
      </button>
    </div>

    <div class="tasks__clear flex justify-end space-x-2 mt-4">
      <button class="button warning small bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
              @click="clearCompleted"
      >
        <i class="fa-regular fa-square-check"></i> Clear Completed
      </button>
      <button class="button alert small bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              @click="clearAll"
      >
        <i class="fa fa-trash"></i> Clear All
      </button>
    </div>

    
    <transition-group name="fade" tag="ul" class="tasks__list mt-4 space-y-2">
      <li v-for="(task, index) in tasks" 
          :key="index"
          class="tasks__item flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-sm"
      >
        <button :class="getClassName(task)"
                @click.self="completeTask(task)"
                class="tasks__item__toggle flex-1 text-left"
        >
          {{ task.title }}
        </button>
        <button class="tasks__item__remove button alert bg-red-500 text-white rounded-lg p-2 hover:bg-red-600"
                @click="removeTask(index)"
        >
          <i class="fa fa-trash"></i>
        </button>
      </li>
    </transition-group>
  </section>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}

.fade-enter, .fade-leave-active {
  opacity: 0;
}
</style>
