// services/kanbanService.js
import { client } from '@/services/requestMaker.js';

/**
 * Service for interacting with Kanban API.
 */
export class KanbanService {
  /**
   * Fetches a specific Kanban.
   * @param {string} kanbanId - The ID of the Kanban to fetch.
   * @param {string} searchQuery - Optional search query to filter Kanban.
   * @returns {Promise<any>} The promise from the API call.
   */
  getKanban(kanbanId, searchQuery = '')  {
    return client.get(`/api/kanban/${kanbanId}`, { search: searchQuery });
  }

  /**
   * Creates a new Kanban.
   * @param {string} kanbanId - The ID of the Kanban to create.
   * @param {object} kanbanData - The data for the new Kanban.
   * @returns {Promise<any>} The promise from the API call.
   */
  createKanban(kanbanId, kanbanData) {
    return client.post(`/api/kanban/${kanbanId}`, kanbanData);
  }

  /**
   * Edits a Kanban.
   * @param {string} kanbanId - The ID of the Kanban to edit.
   * @param {object} updatedKanbanData - The updated data for the Kanban.
   * @returns {Promise<any>} The promise from the API call.
   */
  editKanban(kanbanId, updatedKanbanData) {
    return client.patch(`/api/kanban/${kanbanId}`, updatedKanbanData);
  }

  /**
   * Deletes a Kanban.
   * @param {string} kanbanId - The ID of the Kanban to delete.
   * @returns {Promise<any>} The promise from the API call.
   */
  deleteKanban(kanbanId) {
    return client.delete(`/api/kanban/${kanbanId}`);
  }

  /**
   * Shares a Kanban with the currently logged-in user.
   * @param {string} kanbanId - The ID of the Kanban to share.
   * @returns {Promise<any>} The promise from the API call.
   */
  shareKanban(kanbanId) {
    return client.post(`/api/kanban/${kanbanId}/share`, {});
  }

  /**
   * Leave a Kanban for the currently logged-in user.
   * @param {string} kanbanId - The ID of the Kanban to share.
   * @returns {Promise<any>} The promise from the API call.
   */
  leaveKanban(kanbanId) {
    return client.post(`/api/kanban/${kanbanId}/leave`, {});
  }

  /**
   * Fetches the imputation report for a specific Kanban.
   * @param {string} kanbanId - The ID of the Kanban.
   * @returns {Promise<any>} The promise from the API call.
   */
  getKanbanImputationReport(kanbanId) {
    return client.get(`/api/kanban/${kanbanId}/imputations`);
  }

  /**
   * Fetches the global totals for the imputation report of a specific Kanban.
   * @param {string} kanbanId - The ID of the Kanban.
   * @returns {Promise<any>} The promise from the API call.
   */
  getKanbanImputationTotals(kanbanId) {
    return client.get(`/api/kanban/${kanbanId}/imputations/totals`);
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
  getKanbanTasksSummary(kanbanId, { page, limit }) {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    const query = params.toString();
    const url = `/api/kanban/${kanbanId}/imputations/tasks-summary${query ? `?${query}` : ''}`;
    return client.get(url);
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
  getKanbanDetailedImputations(kanbanId, { page, limit }) {
    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);
    const query = params.toString();
    const url = `/api/kanban/${kanbanId}/imputations/detailed-list${query ? `?${query}` : ''}`;
    return client.get(url);
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
  getUserTimeTrackingReport(options = {}) {
    let url = `/api/timetracking/me`;
    const params = new URLSearchParams();
    if (options.startDate) {
      params.append('startDate', options.startDate);
    }
    if (options.endDate) {
      params.append('endDate', options.endDate);
    }
    const query = params.toString();
    if (query) url += `?${query}`;
    return client.get(url);
  }
}
