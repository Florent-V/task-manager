// services/toDoItemService.js
import { client } from '@/services/requestMaker.js';
import logger from "@/utils/logger.js";

/**
 * Service for interacting with ToDoItem API, nested under a ToDoList.
 */
export class ToDoItemService {

  /**
   * Returns the base path for the ToDoItem routes.
   * @param {string} toDoListId - The ID of the parent ToDoList.
   * @returns {string} The base path.
   * @private
   */
  _basePath(toDoListId) {
    return `/api/todolist/${toDoListId}/todoitem`;
  }

  /**
   * Fetches all items for a specific ToDoList.
   * @param {string} toDoListId - The ID of the parent ToDoList.
   * @returns {Promise<any>} The promise from the API call.
   */
  getToDoItems(toDoListId) {
    logger.debug(`Fetching all ToDoItems for ToDoList ID: ${toDoListId}`);
    return client.get(this._basePath(toDoListId));
  }

  /**
   * Fetches a single ToDoItem.
   * @param {string} toDoListId - The ID of the parent ToDoList.
   * @param {string} itemId - The ID of the item to fetch.
   * @returns {Promise<any>} The promise from the API call.
   */
  getToDoItem(toDoListId, itemId) {
    logger.debug(`Fetching ToDoItem with ID: ${itemId} from ToDoList ID: ${toDoListId}`);
    return client.get(`${this._basePath(toDoListId)}/${itemId}`);
  }

  /**
   * Creates a new ToDoItem.
   * @param {string} toDoListId - The ID of the parent ToDoList.
   * @param {FormData} itemData - The data for the new item, likely as FormData due to potential file upload.
   * @returns {Promise<any>} The promise from the API call.
   */
  createToDoItem(toDoListId, itemData) {
    logger.debug(`Creating ToDoItem in ToDoList ID: ${toDoListId}`);
    return client.post(this._basePath(toDoListId), itemData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Edits a ToDoItem.
   * @param {string} toDoListId - The ID of the parent ToDoList.
   * @param {string} itemId - The ID of the item to edit.
   * @param {FormData} updatedItemData - The updated data for the item.
   * @returns {Promise<any>} The promise from the API call.
   */
  editToDoItem(toDoListId, itemId, updatedItemData) {
    logger.debug(`Editing ToDoItem with ID: ${itemId} in ToDoList ID: ${toDoListId}`);
    return client.patch(`${this._basePath(toDoListId)}/${itemId}`, updatedItemData);
  }

  /**
   * Edits a ToDoItem with file.
   * @param {string} toDoListId - The ID of the parent ToDoList.
   * @param {string} itemId - The ID of the item to edit.
   * @param {FormData} updatedItemData - The updated data for the item.
   * @returns {Promise<any>} The promise from the API call.
   */
  editToDoItemWithFile(toDoListId, itemId, updatedItemData) {
    logger.debug(`Editing ToDoItem with ID: ${itemId} in ToDoList ID: ${toDoListId}`);
    return client.patchWithFile(`${this._basePath(toDoListId)}/${itemId}`, updatedItemData);
  }

  /**
   * Deletes a ToDoItem.
   * @param {string} toDoListId - The ID of the parent ToDoList.
   * @param {string} itemId - The ID of the item to delete.
   * @returns {Promise<any>} The promise from the API call.
   */
  deleteToDoItem(toDoListId, itemId) {
    logger.debug(`Deleting ToDoItem with ID: ${itemId} from ToDoList ID: ${toDoListId}`);
    return client.delete(`${this._basePath(toDoListId)}/${itemId}`);
  }
}
