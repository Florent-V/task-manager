// services/reportService.js
import { client } from '@/services/requestMaker.js';
import { hookApi } from '@/services/requestHookService.js';

export class ReportService {
  constructor() {
    const { executeRequest } = hookApi();
    this.executeRequest = executeRequest;
  }

  /**
   * Fetches the imputation report for a specific Kanban.
   * @param {string} kanbanId - The ID of the Kanban.
   * @returns {Promise<any>} The promise from the API call.
   */
  async getKanbanImputationReport(kanbanId) {
    return await this.executeRequest(
      () => client.get(`/api/reports/kanbans/${kanbanId}/imputations-report`)
    );
  }

  /**
   * Fetches the imputation report for a specific User, optionally filtered by Kanban.
   * @param {string} userId - The ID of the user.
   * @param {string} [kanbanId=null] - Optional ID of the Kanban to filter by.
   * @returns {Promise<any>} The report data.
   */
  async getUserImputationReport(userId, kanbanId = null) {
    let apiUrl = `/api/reports/users/${userId}/imputations-report`;
    if (kanbanId) {
      apiUrl += `?kanbanId=${kanbanId}`;
    }
    return await this.executeRequest(() => client.get(apiUrl));
  }
}
