// services/kanbanService.js
import { client } from '@/services/requestMaker.js';
import { hookApi } from '@/services/requestHookService.js';

export class KanbanService {
  constructor() {
    const { executeRequest } = hookApi();
    this.executeRequest = executeRequest;
  }

  /**
   * Fetches a specific Kanban.
   * @param {string} kanbanId - The ID of the Kanban to fetch.
   * @returns {Promise<any>} The promise from the API call.
   */
  async getKanban(kanbanId) {
    return await this.executeRequest(
      () => client.get(`/api/kanban/${kanbanId}`)
    );
  }

  /**
   * Creates a new Kanban.
   * @param {string} kanbanId - The ID of the Kanban to create.
   * @param {object} kanbanData - The data for the new Kanban.
   * @returns {Promise<any>} The promise from the API call.
   */
  async createKanban(kanbanId, kanbanData) {
    return await this.executeRequest(
      () => client.post(`/api/kanban/${kanbanId}`, kanbanData)
    );
  }

  /**
   * Edits a Kanban.
   * @param {string} kanbanId - The ID of the Kanban to edit.
   * @param {object} updatedKanbanData - The updated data for the Kanban.
   * @returns {Promise<any>} The promise from the API call.
   */
  async editKanban(kanbanId, updatedKanbanData) {
    return await this.executeRequest(
      () => client.patch(`/api/kanban/${kanbanId}}`, updatedKanbanData)
    );
  }

  /**
   * Deletes a Kanban.
   * @param {string} kanbanId - The ID of the Kanban to delete.
   * @returns {Promise<any>} The promise from the API call.
   */
  async deleteKanban(kanbanId) {
    return await this.executeRequest(
      () => client.delete(`/api/kanban/${kanbanId}`)
    );
  }


  /**
   * Shares a Kanban with the currently logged-in user.
   * @param {string} kanbanId - The ID of the Kanban to share.
   * @returns {Promise<any>} The promise from the API call.
   */
  async shareKanban(kanbanId) {
    return await this.executeRequest(
      () => client.post(`/api/kanban/${kanbanId}/share`, {}),
    );
  }

  /**
   * Fetches the imputation report for a specific Kanban.
   * @param {string} kanbanId - The ID of the Kanban.
   * @returns {Promise<any>} The promise from the API call.
   */
  async getKanbanImputationReport(kanbanId) {
    return await this.executeRequest(
      () => client.get(`/api/kanban/${kanbanId}/imputations`)
    );
  }

  /**
   * Fetches the time tracking report for the current user.
   * @returns {Promise<any>} The promise from the API call.
   */
  async getUserTimeTrackingReport() {
    return await this.executeRequest(
      () => client.get(`/api/timetracking/me`),
    )
  }
}
