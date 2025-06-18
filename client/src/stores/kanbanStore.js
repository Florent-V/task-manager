// stores/kanbanStore.js
import { defineStore } from 'pinia';
import { TaskService } from '@/services/taskService.js';
import { KanbanService } from '@/services/kanbanService.js';
import logger from '@/utils/logger.js';
import { TimeParser } from '@/utils/timeParser.js';

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
        await this.fetchSize();
        await this.fetchKanbanData(kanbanId);
      } catch (err) {
        logger.error('Error initializing kanban store:', err);
        throw err;
      }
    },

    reset() {
      logger.debug('Resetting kanban store state');
      this.currentKanbanId = null;
      this.tasks = [];
      this.users = [];
      this.stages = [];
      this.priorities = [];
      this.sizes = [];
    },

    async fetchPriority() {
      logger.debug('Fetching priorities');
      try {
        const data = await this.taskService.getPriorities();
        this.priorities = data.priorities;
      } catch (err) {
        logger.error('Error in fetching priority data', err);
        throw err;
      }
    },

    async fetchSize() {
      logger.debug('Fetching sizes');
      try {
        const data = await this.taskService.getSizes();
        this.sizes = data.sizes;
      } catch (err) {
        logger.error('Error in fetching size data', err);
        throw err;
      }
    },

    async fetchKanbanData(kanbanId) {
      logger.debug('Fetching kanban data for ID:', kanbanId);
      try {
        const data = await this.kanbanService.getKanban(kanbanId);
        this.kanban = data.kanban;
        this.users = data.kanban.users;
        this.stages = data.kanban.stages;
        this.tasks = this.enrichTasks(data.kanban.tasks);
        logger.debug("Enriched task :", this.tasks);
      } catch (err) {
        logger.error('Error in fetching kanban data', err);
        throw err;
      }
    },

    getTaskById(taskId) {
      logger.debug('Fetching task by ID:', taskId);
      return this.tasks.find(task => task.id === taskId);
    },

    addTask(taskData) {
      logger.debug('Adding new task:', taskData);
      try {
        this.tasks.push(this.enrichTask(taskData));
      } catch (err) {
        logger.error('Error adding task:', err);
        throw err;
      }
    },

    editTask(updatedTaskData) {
      logger.debug('Editing task:', updatedTaskData);
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

    deleteTask(taskId) {
      logger.debug('Deleting task with ID:', taskId);
      try {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
      } catch (err) {
        logger.error('Error deleting task:', err);
        throw err;
      }
    },

    // Function to enrich a single task with additional properties
    enrichTask(task) {
      const timeParser = new TimeParser();
      return {
        ...task,
        priorityLabel: this.priorities.find((p) => p.id === task.priorityId)?.label || 'Unknown',
        priorityColor: this.priorities.find((p) => p.id === task.priorityId)?.color || 'gray',
        sizeLabel: this.sizes.find((s) => s.id === task.sizeId)?.label || 'Unknown',
        sizeColor: this.sizes.find((s) => s.id === task.sizeId)?.color || 'gray',
        stageLabel: this.stages.find((s) => s.id === task.stageId)?.name || 'Unknown',
        estimationString: timeParser.formatMinutesToTimeString(task.estimation),
        assignedTo: (() => {
          const user = this.users.find((u) => u.id === task.assignedToId);
          return user ? `${user.firstName} ${user.lastName}` : 'Unassigned';
        })(),
      };
    },

    enrichTasks(tasks) {
      logger.debug('Enriching tasks');
      return tasks.map(task => this.enrichTask(task));
    },

    // Function to enrich a single comment with author name
    enrichComment(comment) {
      logger.debug('Enriching comment:', comment);
      return {
        ...comment,
        authorName: (() => {
          const user = this.users.find((u) => u.id === comment.authorId);
          return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
        })(),
      };
    },

    enrichComments(comments) {
      logger.debug('Enriching comments');
      return comments.map((comment) => this.enrichComment(comment));
    },

    enrichImputation(imputation) {
      logger.debug('Enriching imputation:', imputation);
      const user = this.users.find((u) => u.id === imputation.userId);
      return {
        ...imputation,
        user,
      };
    }
  },
});
