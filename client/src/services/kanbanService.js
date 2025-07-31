// services/kanbanService.js
import { client, apiClient } from '@/services/requestMaker.js';
import logger from "@/utils/logger.js";

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
    logger.debug('Fetching Kanban with ID:', kanbanId, 'and search query:', searchQuery);
    const params = {};
    if (searchQuery) {
      params.search = searchQuery;
    }
    return client.get(`/api/kanban/${kanbanId}`, { ...params });
  }

  /**
   * Creates a new Kanban.
   * @param {string} kanbanId - The ID of the Kanban to create.
   * @param {object} kanbanData - The data for the new Kanban.
   * @returns {Promise<any>} The promise from the API call.
   */
  createKanban(kanbanData) {
    logger.debug(`Creating Kanban with ID:and data: ${JSON.stringify(kanbanData)}`);
    return client.post(`/api/kanban/`, kanbanData);
  }

  /**
   * Edits a Kanban.
   * @param {string} kanbanId - The ID of the Kanban to edit.
   * @param {object} updatedKanbanData - The updated data for the Kanban.
   * @returns {Promise<any>} The promise from the API call.
   */
  editKanban(kanbanId, updatedKanbanData) {
    logger.debug(`Editing Kanban with ID: ${kanbanId} and data: ${JSON.stringify(updatedKanbanData)}`);
    return client.patch(`/api/kanban/${kanbanId}`, updatedKanbanData);
  }

  /**
   * Deletes a Kanban.
   * @param {string} kanbanId - The ID of the Kanban to delete.
   * @returns {Promise<any>} The promise from the API call.
   */
  deleteKanban(kanbanId) {
    logger.debug(`Deleting Kanban with ID: ${kanbanId}`);
    return client.delete(`/api/kanban/${kanbanId}`);
  }

  /**
   * Shares a Kanban with the currently logged-in user.
   * @param {string} kanbanId - The ID of the Kanban to share.
   * @returns {Promise<any>} The promise from the API call.
   */
  shareKanban(kanbanId) {
    logger.debug(`Sharing Kanban with ID: ${kanbanId}`);
    return client.post(`/api/kanban/${kanbanId}/share`, {});
  }

  /**
   * Leave a Kanban for the currently logged-in user.
   * @param {string} kanbanId - The ID of the Kanban to share.
   * @returns {Promise<any>} The promise from the API call.
   */
  leaveKanban(kanbanId) {
    logger.debug(`Leaving Kanban with ID: ${kanbanId}`);
    return client.post(`/api/kanban/${kanbanId}/leave`, {});
  }

  /**
   * Fetches the imputation report for a specific Kanban.
   * @param {string} kanbanId - The ID of the Kanban.
   * @returns {Promise<any>} The promise from the API call.
   */
  getKanbanImputationReport(kanbanId) {
    logger.debug(`Fetching imputation report for Kanban with ID: ${kanbanId}`);
    return client.get(`/api/kanban/${kanbanId}/imputations`);
  }

  /**
   * Fetches the global totals for the imputation report of a specific Kanban.
   * @param {string} kanbanId - The ID of the Kanban.
   * @returns {Promise<any>} The promise from the API call.
   */
  getKanbanImputationTotals(kanbanId) {
    logger.debug(`Fetching imputation totals for Kanban with ID: ${kanbanId}`);
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
    logger.debug(`Fetching tasks summary for Kanban with ID: ${kanbanId}, page: ${page}, limit: ${limit}`);
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
    logger.debug(`Fetching detailed imputations for Kanban with ID: ${kanbanId}, page: ${page}, limit: ${limit}`);
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
    logger.debug(`Fetching user time tracking report with options: ${JSON.stringify(options)}`);
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

  /**
   * A private helper method to download a file from a given URL.
   * @param {string} url - The URL to fetch the file from.
   * @param {string} filename - The desired name for the downloaded file.
   * @private
   */
  async _downloadFile(url, filename) {
    logger.debug(`Initiating download from URL: ${url}`);
    try {
      const response = await apiClient.get(url, {
        responseType: 'blob',
        withCredentials: true,
        timeout: 30000,
      });

      const responseInfo = {
        status: response.status,
        contentType: response.headers['content-type'],
        size: response.data?.size || 0,
      };
      logger.debug(`Response for download: ${JSON.stringify(responseInfo)}`);

      if (responseInfo.size === 0) {
        throw new Error('The server returned an empty file.');
      }

      if (!responseInfo.contentType.includes('spreadsheetml') && !responseInfo.contentType.includes('application/octet-stream')) {
        throw new Error('The server did not return a valid Excel file.');
      }

      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      const objectUrl = window.URL.createObjectURL(blob);

      link.href = objectUrl;
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      logger.debug('Download triggered successfully.');

      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
        window.URL.revokeObjectURL(objectUrl);
      }, 100);

    } catch (error) {
      logger.error(`Failed to download file from ${url}.`, error);
      // Re-throw the error so the calling component can handle it (e.g., show a notification)
      throw error;
    }
  }

  /**
   * Exports the user time tracking report to Excel.
   * @param {Object} options - Optional parameters for filtering.
   * @returns {Promise<void>}
   */
  async exportUserTimeTrackingReport(options = {}) {
    logger.debug(`Exporting user time tracking report with options: ${JSON.stringify(options)}`);
    let url = `/api/timetracking/user-report/export`;

    const params = new URLSearchParams();
    if (options.startDate) params.append('startDate', options.startDate);
    if (options.endDate) params.append('endDate', options.endDate);
    const query = params.toString();
    if (query) url += `?${query}`;

    const filename = `user_time_tracking_report_${new Date().toISOString().split('T')[0]}.xlsx`;
    await this._downloadFile(url, filename);
  }

  /**
   * Exports the kanban imputation report to Excel.
   * @param {string} kanbanId - The ID of the Kanban.
   * @returns {Promise<void>}
   */
  async exportKanbanImputationReport(kanbanId) {
    logger.debug(`Exporting kanban imputation report for kanbanId: ${kanbanId}`);
    const url = `/api/kanban/${kanbanId}/imputation-report/export`;
    const filename = `kanban_imputation_report_${kanbanId}_${new Date().toISOString().split('T')[0]}.xlsx`;
    await this._downloadFile(url, filename);
  }
}
