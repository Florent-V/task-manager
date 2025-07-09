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
   * Fetches the global totals for the imputation report of a specific Kanban.
   * @param {string} kanbanId - The ID of the Kanban.
   * @returns {Promise<any>} The promise from the API call.
   */
  async getKanbanImputationTotals(kanbanId) {
    return await this.executeRequest(
      () => client.get(`/api/kanban/${kanbanId}/imputations/totals`)
    );
  }


  /**
   * Fetches the paginated tasks summary for the imputation report of a specific Kanban.
   * @param {string} kanbanId - The ID of the Kanban.
   * @param {{
   *   page: number,
   *   limit: number
   * }} paginationParams - Pagination parameters, including page number and items per page.
   * @returns {Promise<any>} The promise from the API call.
   */
  async getKanbanTasksSummary(kanbanId, { page, limit }) {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    const queryString = params.toString();
    const url = `/api/kanban/${kanbanId}/imputations/tasks-summary${queryString ? `?${queryString}` : ''}`;
    return await this.executeRequest(() => client.get(url));
  }

  /**
   * Fetches the paginated detailed list of imputations for a specific Kanban.
   * @param {string} kanbanId - The ID of the Kanban.
   * @param {{
   *   page: number,
   *   limit: number
   * }} paginationParams - Pagination parameters, including page number and items per page.
   * @returns {Promise<any>} The promise from the API call.
   */
  async getKanbanDetailedImputations(kanbanId, { page, limit }) {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    const queryString = params.toString();
    const url = `/api/kanban/${kanbanId}/imputations/detailed-list${queryString ? `?${queryString}` : ''}`;
    return await this.executeRequest(() => client.get(url));
  }

  /**
   * Fetches the time tracking report for the current user.
   *
   * @param {{
   *   startDate?: string,
   *   endDate?: string
   * }} options - Optional parameters for filtering.
   * @returns {Promise<any>} The promise from the API call.
   */
  async getUserTimeTrackingReport(options = {}) {
    let url = `/api/timetracking/me`;
    const params = new URLSearchParams();
    if (options.startDate) {
      params.append('startDate', options.startDate);
    }
    if (options.endDate) {
      params.append('endDate', options.endDate);
    }
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
    return await this.executeRequest(() => client.get(url));
  }
}
