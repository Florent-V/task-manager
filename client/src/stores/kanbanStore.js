// stores/kanbanStore.js
import { defineStore } from 'pinia';
import { TaskService } from '@/services/taskService.js';
import { KanbanService } from '@/services/kanbanService.js';
import logger from '@/utils/logger.js';

export const useKanbanStore = defineStore('kanbanStore', {
  state: () => ({
    currentKanbanId: null,
    kanban: {},
    tasks: [],
    users: [],
    stages: [],
    priorities: [],
    sizes: [],
    taskService: new TaskService(),
    kanbanService: new KanbanService(),
  }),

  actions: {
    async initStore(kanbanId) {
      logger.debug('initStore', kanbanId);
      if (this.currentKanbanId === kanbanId) {
        logger.debug("Kanban ID is already set, no need to re-fetch data.");
        return;
      }
      try {
        this.reset();
        this.currentKanbanId = kanbanId;
        await this.fetchPriority();
        console.log("this.priorities", this.priorities);
        await this.fetchSize();
        console.log("this.sizes", this.sizes);
        await this.fetchKanbanData(kanbanId);
        console.log("this.kanban", this.kanban);
      } catch (err) {
        logger.error('Error initializing kanban store:', err);
        throw err;
      }
    },

    reset() {
      this.currentKanbanId = null;
      this.tasks = [];
      this.users = [];
      this.stages = [];
      this.priorities = [];
      this.sizes = [];
    },
    async fetchPriority() {
      try {
        const data = await this.taskService.getPriorities();
        this.priorities = data.priorities;
      } catch (err) {
        logger.error('Error in fetching priority data', err);
        throw err;
      }
    },

    async fetchSize() {
      try {
        const data = await this.taskService.getSizes();
        this.sizes = data.sizes;
      } catch (err) {
        logger.error('Error in fetching size data', err);
        throw err;
      }
    },

    async fetchKanbanData(kanbanId) {
      try {
        const data = await this.kanbanService.getKanban(kanbanId);
        console.log("data", data);
        this.kanban = data.kanban;
        this.tasks = this.enrichTasks(data.kanban.tasks);
        this.users = data.kanban.users;
        this.stages = data.kanban.stages;
      } catch (err) {
        logger.error('Error in fetching kanban data', err);
        throw err;
      }
    },

    getTaskById(taskId) {
      return this.tasks.find(task => task.id === taskId);
    },

    addTask(taskData) {
      try {
        this.tasks.push(this.enrichTask(taskData));
      } catch (err) {
        logger.error('Error adding task:', err);
        throw err;
      }
    },

    // async addTask(taskData) {
    //   try {
    //     const response = await taskService.addTask(this.currentKanbanId, taskData);
    //     const newTask = response.task;
    //     this.tasks.push(newTask);
    //     this.enrichAndAddTask(newTask);
    //   } catch (err) {
    //     logger.error('Error adding task:', err);
    //     throw err;
    //   }
    // },

    editTask(updatedTaskData) {
      try {
        const index = this.tasks.findIndex(task => task.id === updatedTaskData.id);
        if (index !== -1) {
          this.tasks[index] = this.enrichTask(updatedTaskData);
        }
      } catch (err) {
        logger.error('Error editing task:', err);
        throw err;
      }
    },

    // async editTask(taskId, updatedTaskData) {
    //   try {
    //     const response = await taskService.editTask(this.currentKanbanId, taskId, updatedTaskData);
    //     const updatedTask = response.task;
    //     const index = this.tasks.findIndex(task => task.id === taskId);
    //     if (index !== -1) {
    //       this.tasks[index] = updatedTask;
    //       this.enrichAndUpdateTask(updatedTask);
    //     }
    //   } catch (err) {
    //     logger.error('Error editing task:', err);
    //     throw err;
    //   }
    // },
    deleteTask(taskId) {
      try {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
      } catch (err) {
        logger.error('Error deleting task:', err);
        throw err;
      }
    },

    // async deleteTask(taskId) {
    //   try {
    //     await taskService.deleteTask(this.currentKanbanId, taskId);
    //     this.tasks = this.tasks.filter(task => task.id !== taskId);
    //     this.enrichedTasks = this.enrichedTasks.filter(task => task.id !== taskId);
    //   } catch (err) {
    //     logger.error('Error deleting task:', err);
    //     throw err;
    //   }
    // },

    enrichTask(task) {
      return {
        ...task,
        priorityLabel: this.priorities.find((p) => p.id === task.priorityId)?.label || 'Unknown',
        priorityColor: this.priorities.find((p) => p.id === task.priorityId)?.color || 'gray',
        sizeLabel: this.sizes.find((s) => s.id === task.sizeId)?.label || 'Unknown',
        sizeColor: this.sizes.find((s) => s.id === task.sizeId)?.color || 'gray',
        stageLabel: this.stages.find((s) => s.id === task.stageId)?.name || 'Unknown',
        assignedTo: (() => {
          const user = this.users.find((u) => u.id === task.assignedToId);
          return user ? `${user.firstName} ${user.lastName}` : 'Unassigned';
        })(),
      };
    },

    enrichTasks(tasks) {
      return tasks.map(task => this.enrichTask(task));
    },

    // enrichAndAddTask(task) {
    //   const enrichedTask = this.enrichTask(task);
    //   this.enrichedTasks.push(enrichedTask);
    // },

    // enrichAndUpdateTask(updatedTask) {
    //   const index = this.enrichedTasks.findIndex(task => task.id === updatedTask.id);
    //   if (index !== -1) {
    //     this.enrichedTasks[index] = this.enrichTask(updatedTask);
    //   }
    // },
  },
});
