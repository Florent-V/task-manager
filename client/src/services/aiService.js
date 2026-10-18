import { client } from '@/services/requestMaker.js';
import logger from "@/utils/logger.js";

/**
 * Service for interacting with AI API.
 */
export class AIService {
  /**
   * Returns the base path for the AI routes.
   * @returns {string} The base path.
   * @private
   */
  _basePath() {
    return '/api/ai';
  }

  /**
   * Generates a to-do list from a prompt.
   * @param {string} prompt - The user prompt.
   * @returns {Promise<any>} The promise from the API call.
   */
  generateToDoList(prompt) {
    logger.debug('Generating ToDoList with prompt:', prompt);
    return client.post(`${this._basePath()}/generate-todolist`, { prompt });
  }

  /**
   * Organizes a list of items into categories.
   * @param {string} toDoListId - The ID of the ToDoList to organize.
   * @returns {Promise<any>} The promise from the API call.
   */
  organizeToDoList(toDoListId) {
    logger.debug('Organizing ToDoList items for ID:', toDoListId);
    return client.post(`${this._basePath()}/organize-todolist/${toDoListId}`);
  }
}
