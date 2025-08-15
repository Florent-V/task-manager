// stores/kanbanStore.js
import { defineStore } from 'pinia';

import { TaskService } from '@/services/taskService.js';
import { KanbanService } from '@/services/kanbanService.js';
import logger from '@/utils/logger.js';
import { TimeParser } from '@/utils/timeParser.js';

/**
 * Pinia store for managing Kanban board state, tasks, users, stages, priorities, and sizes.
 * Fournit des actions pour initialiser, charger, enrichir et manipuler les données Kanban côté client.
 */
export const useKanbanStore = defineStore('kanbanStore', {
  state: () => ({
    /** @type {string|null} L'ID du Kanban courant */
    currentKanbanId: null,
    /** @type {object} Données du Kanban courant */
    kanban: {},
    /** @type {Array<object>} Liste des tâches du Kanban */
    tasks: [],
    /** @type {Array<object>} Utilisateurs associés au Kanban */
    users: [],
    /** @type {Array<object>} Stages du Kanban */
    stages: [],
    /** @type {Array<object>} Priorités disponibles */
    priorities: [],
    /** @type {Array<object>} Tailles disponibles */
    sizes: [],
    taskService: new TaskService(),
    kanbanService: new KanbanService(),
  }),

  actions: {
    /**
     * Initialise le store pour un Kanban donné. Recharge si l'ID change.
     * @param {string} kanbanId - L'identifiant du Kanban à charger.
     * @returns {Promise<Awaited<void>[]>} Promise résolue quand la donnée est prête.
     */
    initStore(kanbanId) {
      logger.debug('initStore', kanbanId);
      if (this.currentKanbanId === kanbanId) {
        logger.debug("Kanban ID is already set, no need to re-fetch data.");
        return Promise.resolve();
      }
      this.reset();
      this.currentKanbanId = kanbanId;
      return Promise.all([
        this.fetchPriority(),
        this.fetchSize(),
        this.fetchKanbanData(kanbanId)
      ]);
    },

    /**
     * Réinitialise l'état du store (vide toutes les données).
     */
    reset() {
      logger.debug('Resetting kanban store state');
      this.currentKanbanId = null;
      this.tasks = [];
      this.users = [];
      this.stages = [];
      this.priorities = [];
      this.sizes = [];
    },

    /**
     * Récupère la liste des priorités depuis l'API et la stocke.
     * @returns {Promise<void>}
     */
    async fetchPriority() {
      logger.debug('Fetching priorities');
      const data = await this.taskService.getPriorities();
      this.priorities = data.priorities;
    },

    /**
     * Récupère la liste des tailles depuis l'API et la stocke.
     * @returns {Promise<void>}
     */
    async fetchSize() {
      logger.debug('Fetching sizes');
      const data = await this.taskService.getSizes();
      this.sizes = data.sizes;
    },

    /**
     * Récupère les données du Kanban (tâches, users, stages, etc) depuis l'API et les enrichit.
     * @param {string} kanbanId - L'identifiant du Kanban à charger.
     * @returns {Promise<void>}
     */
    async fetchKanbanData(kanbanId) {
      logger.debug('Fetching kanban data for ID:', kanbanId);
      const data = await this.kanbanService.getKanban(kanbanId);
      this.kanban = data.kanban;
      this.users = data.kanban.users;
      this.stages = data.kanban.stages;
      this.tasks = this.enrichTasks(data.kanban.tasks);
      logger.debug("Enriched task :", this.tasks);
    },

    /**
     * Retourne une tâche par son ID.
     * @param {string|number} taskId - ID de la tâche recherchée.
     * @returns {object|undefined} La tâche trouvée ou undefined.
     */
    getTaskById(taskId) {
      logger.debug('Fetching task by ID:', taskId);
      return this.tasks.find(task => task.id === taskId);
    },

    /**
     * Ajoute une tâche à la liste locale (après enrichissement).
     * @param {object} taskData - Données de la tâche à ajouter.
     */
    addTask(taskData) {
      logger.debug('Adding new task:', taskData);
      this.tasks.push(this.enrichTask(taskData));
    },

    /**
     * Met à jour une tâche existante dans la liste locale.
     * @param {object} updatedTaskData - Nouvelle version de la tâche.
     */
    editTask(updatedTaskData) {
      logger.debug('Editing task:', updatedTaskData);
      const index = this.tasks.findIndex(task => task.id === updatedTaskData.id);
      if (index !== -1) {
        this.tasks[index] = this.enrichTask(updatedTaskData);
      }
    },

    /**
     * Supprime une tâche de la liste locale par son ID.
     * @param {string|number} taskId - ID de la tâche à supprimer.
     */
    deleteTask(taskId) {
      logger.debug('Deleting task with ID:', taskId);
      this.tasks = this.tasks.filter(task => task.id !== taskId);
    },

    /**
     * Enrichit une tâche avec des labels/couleurs et infos utilisateur.
     * @param {object} task - Tâche brute.
     * @returns {object} Tâche enrichie.
     */
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

    /**
     * Enrichit une liste de tâches.
     * @param {Array<object>} tasks - Liste brute de tâches.
     * @returns {Array<object>} Liste enrichie.
     */
    enrichTasks(tasks) {
      logger.debug('Enriching tasks');
      return tasks.map(task => this.enrichTask(task));
    },

    /**
     * Met à jour les imputations d'une tâche locale.
     * @param {string|number} taskId - ID de la tâche.
     * @param {Array<object>} imputations - Nouvelles imputations.
     */
    updateTasksImputations(taskId, imputations) {
      logger.debug('Updating task imputations for task ID:', taskId);
      const task = this.tasks.find(task => task.id === taskId);
      if (task) {
        task.imputations = imputations;
      }
    },

    /**
     * Enrichit un commentaire avec le nom de l'auteur.
     * @param {object} comment - Commentaire brut.
     * @returns {object} Commentaire enrichi.
     */
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

    /**
     * Enrichit une liste de commentaires.
     * @param {Array<object>} comments - Liste brute de commentaires.
     * @returns {Array<object>} Liste enrichie.
     */
    enrichComments(comments) {
      logger.debug('Enriching comments');
      return comments.map((comment) => this.enrichComment(comment));
    },

    /**
     * Enrichit une imputation avec l'objet utilisateur.
     * @param {object} imputation - Imputation brute.
     * @returns {object} Imputation enrichie.
     */
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
