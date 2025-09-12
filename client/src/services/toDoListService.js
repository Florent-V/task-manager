// services/toDoListService.js
import { client } from '@/services/requestMaker.js';
import logger from "@/utils/logger.js";

/**
 * Service for interacting with ToDoList API.
 */
export class ToDoListService {
  /**
   * Returns the base path for the ToDoList routes.
   * @returns {string} The base path.
   * @private
   */
  _basePath() {
    return '/api/todolist';
  }

  /**
   * Fetches all ToDoLists for the current user.
   * @param {string} searchQuery - Optional search query to filter ToDoLists.
   * @returns {Promise<any>} The promise from the API call.
   */
  getToDoLists(searchQuery = '') {
    logger.debug('Fetching all ToDoLists with search query:', searchQuery);
    const params = {};
    if (searchQuery) {
      params.search = searchQuery;
    }
    return client.get(this._basePath(), { params });
  }

  /**
   * Fetches a specific ToDoList.
   * @param {string} toDoListId - The ID of the ToDoList to fetch.
   * @returns {Promise<any>} The promise from the API call.
   */
  getToDoList(toDoListId) {
    logger.debug('Fetching ToDoList with ID:', toDoListId);
    return client.get(`${this._basePath()}/${toDoListId}`);
  }

  /**
   * Creates a new ToDoList.
   * @param {object} toDoListData - The data for the new ToDoList.
   * @returns {Promise<any>} The promise from the API call.
   */
  createToDoList(toDoListData) {
    logger.debug(`Creating ToDoList with data: ${JSON.stringify(toDoListData)}`);
    return client.post(this._basePath(), toDoListData);
  }

  /**
   * Edits a ToDoList.
   * @param {string} toDoListId - The ID of the ToDoList to edit.
   * @param {object} updatedToDoListData - The updated data for the ToDoList.
   * @returns {Promise<any>} The promise from the API call.
   */
  editToDoList(toDoListId, updatedToDoListData) {
    logger.debug(`Editing ToDoList with ID: ${toDoListId} and data: ${JSON.stringify(updatedToDoListData)}`);
    return client.patch(`${this._basePath()}/${toDoListId}`, updatedToDoListData);
  }

  /**
   * Deletes a ToDoList.
   * @param {string} toDoListId - The ID of the ToDoList to delete.
   * @returns {Promise<any>} The promise from the API call.
   */
  deleteToDoList(toDoListId) {
    logger.debug(`Deleting ToDoList with ID: ${toDoListId}`);
    return client.delete(`${this._basePath()}/${toDoListId}`);
  }

  /**
   * Shares a ToDoList to get a shareable link and QR code.
   * @param {string} toDoListId - The ID of the ToDoList to share.
   * @returns {Promise<any>} The promise from the API call.
   */
  shareToDoList(toDoListId) {
    logger.debug(`Sharing ToDoList with ID: ${toDoListId}`);
    return client.post(`${this._basePath()}/${toDoListId}/share`, {});
  }

  /**
   * Adds a member to a ToDoList by email.
   * @param {string} toDoListId - The ID of the ToDoList.
   * @param {string} email - The email of the user to add.
   * @returns {Promise<any>} The promise from the API call.
   */
  addMemberByMail(toDoListId, email) {
    logger.debug(`Adding member with email ${email} to ToDoList ID: ${toDoListId}`);
    return client.post(`${this._basePath()}/${toDoListId}/add-member`, { email });
  }

  /**
   * Joins a ToDoList using a token.
   * @param {string} toDoListId - The ID of the ToDoList to join.
   * @param {string} joinToken - The join token.
   * @returns {Promise<any>} The promise from the API call.
   */
  joinToDoList(toDoListId, joinToken) {
    logger.debug(`Joining ToDoList with ID: ${toDoListId}`);
    return client.post(`${this._basePath()}/${toDoListId}/join`, { token: joinToken });
  }
}