// services/taskService.js
import { client } from '@/services/requestMaker.js';
import { TimeParser } from '@/utils/timeParser.js';

/**
 * Service for interacting with Task API.
 */
export class TaskService {
  constructor() {
    this.timeParser = new TimeParser();
  }

  /**
   * Fetches list of priorities.
   * @returns {Promise<any>} Axios response promise.
   */
  getPriorities() {
    return client.get('/api/priority');
  }

  /**
   * Fetches list of sizes.
   * @returns {Promise<any>} Axios response promise.
   */
  getSizes() {
    return client.get('/api/size');
  }

  /**
   * Fetches tasks for a Kanban.
   * @param {string} kanbanId - The ID of the Kanban.
   * @returns {Promise<any>} Axios response promise.
   */
  getTasks(kanbanId) {
    return client.get(`/api/kanban/${kanbanId}/task`);
  }

  /**
   * Creates a new task in a Kanban.
   * @param {string} kanbanId - The ID of the Kanban.
   * @param {object} taskData - Data for the new task.
   * @returns {Promise<any>} Axios response promise.
   */
  createTask(kanbanId, taskData) {
    return client.post(`/api/kanban/${kanbanId}/task`, taskData);
  }

  /**
   * Updates a task.
   * @param {string} kanbanId - The ID of the Kanban.
   * @param {string} taskId - The ID of the task.
   * @param {object} updatedTaskData - Updated task data.
   * @returns {Promise<any>} Axios response promise.
   */
  editTask(kanbanId, taskId, updatedTaskData) {
    return client.patch(`/api/kanban/${kanbanId}/task/${taskId}`, updatedTaskData);
  }

  /**
   * Archives a task.
   * @param {string} kanbanId - The ID of the Kanban.
   * @param {string} taskId - The ID of the task.
   * @returns {Promise<any>} Axios response promise.
   */
  archiveTask(kanbanId, taskId) {
    return client.patch(`/api/kanban/${kanbanId}/task/${taskId}/archive`);
  }

  /**
   * Restores an archived task.
   * @param {string} kanbanId - The ID of the Kanban.
   * @param {string} taskId - The ID of the task.
   * @returns {Promise<any>} Axios response promise.
   */
  restoreTask(kanbanId, taskId) {
    return client.patch(`/api/kanban/${kanbanId}/task/${taskId}/restore`);
  }

  /**
   * Deletes a task.
   * @param {string} kanbanId - The ID of the Kanban.
   * @param {string} taskId - The ID of the task.
   * @returns {Promise<any>} Axios response promise.
   */
  deleteTask(kanbanId, taskId) {
    return client.delete(`/api/kanban/${kanbanId}/task/${taskId}`);
  }

  /**
   * Updates the stage and assignment of a task.
   * @param {string} kanbanId - The ID of the Kanban.
   * @param {string} taskId - The ID of the task.
   * @param {string} stageId - The ID of the new stage.
   * @param {string} assignedToId - The ID of the assigned user.
   * @returns {Promise<any>} Axios response promise.
   */
  updateTaskStage(kanbanId, taskId, stageId, assignedToId) {
    return client.patch(
      `/api/kanban/${kanbanId}/task/${taskId}/stage`,
      { stageId, assignedToId }
    );
  }

  /**
   * Fetches comments for a task.
   * @param {string} kanbanId - The ID of the Kanban.
   * @param {string} taskId - The ID of the task.
   * @returns {Promise<any>} Axios response promise.
   */
  getComments(kanbanId, taskId) {
    return client.get(`/api/kanban/${kanbanId}/task/${taskId}/comment`);
  }

  /**
   * Creates a comment for a task.
   * @param {string} kanbanId - The ID of the Kanban.
   * @param {string} taskId - The ID of the task.
   * @param {object} commentData - Data for the new comment.
   * @returns {Promise<any>} Axios response promise.
   */
  createComment(kanbanId, taskId, commentData) {
    return client.post(`/api/kanban/${kanbanId}/task/${taskId}/comment`, commentData);
  }

  /**
   * Edits a comment for a task.
   * @param {string} kanbanId - The ID of the Kanban.
   * @param {string} taskId - The ID of the task.
   * @param {string} commentId - The ID of the comment.
   * @param {object} updatedCommentData - Updated comment data.
   * @returns {Promise<any>} Axios response promise.
   */
  editComment(kanbanId, taskId, commentId, updatedCommentData) {
    return client.patch(
      `/api/kanban/${kanbanId}/task/${taskId}/comment/${commentId}`,
      updatedCommentData
    );
  }

  /**
   * Deletes a comment for a task.
   * @param {string} kanbanId - The ID of the Kanban.
   * @param {string} taskId - The ID of the task.
   * @param {string} commentId - The ID of the comment.
   * @returns {Promise<any>} Axios response promise.
   */
  deleteComment(kanbanId, taskId, commentId) {
    return client.delete(`/api/kanban/${kanbanId}/task/${taskId}/comment/${commentId}`);
  }

  /**
   * Fetches imputations for a task.
   * @param {string} kanbanId - The ID of the Kanban.
   * @param {string} taskId - The ID of the task.
   * @returns {Promise<any>} Axios response promise.
   */
  getImputations(kanbanId, taskId) {
    return client.get(`/api/kanban/${kanbanId}/task/${taskId}/imputation`);
  }

  /**
   * Creates an imputation for a task.
   * @param {string} kanbanId - The ID of the Kanban.
   * @param {string} taskId - The ID of the task.
   * @param {object} imputationData - Data for the new imputation.
   * @returns {Promise<any>} Axios response promise.
   */
  createImputation(kanbanId, taskId, imputationData) {
    return client.post(`/api/kanban/${kanbanId}/task/${taskId}/imputation`, imputationData);
  }

  /**
   * Edits an imputation for a task.
   * @param {string} kanbanId - The ID of the Kanban.
   * @param {string} taskId - The ID of the task.
   * @param {string} imputationId - The ID of the imputation.
   * @param {object} updatedImputationData - Updated imputation data.
   * @returns {Promise<any>} Axios response promise.
   */
  editImputation(kanbanId, taskId, imputationId, updatedImputationData) {
    return client.patch(
      `/api/kanban/${kanbanId}/task/${taskId}/imputation/${imputationId}`,
      updatedImputationData
    );
  }

  /**
   * Deletes an imputation for a task.
   * @param {string} kanbanId - The ID of the Kanban.
   * @param {string} taskId - The ID of the task.
   * @param {string} imputationId - The ID of the imputation.
   * @returns {Promise<any>} Axios response promise.
   */
  deleteImputation(kanbanId, taskId, imputationId) {
    return client.delete(`/api/kanban/${kanbanId}/task/${taskId}/imputation/${imputationId}`);
  }

  /**
   * Formats minutes as a time string.
   * @param {number} minutes - Number of minutes.
   * @returns {string} Formatted time string.
   */
  formatMinutesToTimeString(minutes) {
    return this.timeParser.formatMinutesToTimeString(minutes);
  }

  /**
   * Calculates total time spent on a task.
   * @param {object} task - Task object with imputations.
   * @returns {string} Formatted total time spent.
   */
  calculateTimeSpent(task) {
    if (!task.imputations || !task.imputations.length) {
      return "0m";
    }
    return this.formatMinutesToTimeString(
      task.imputations.reduce((sum, imp) => sum + imp.timeSpent, 0)
    );
  }
}
