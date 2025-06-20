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
   * Fetches the imputation report for a specific User.
   * @param {string} userId - The ID of the User.
   * @returns {Promise<any>} The promise from the API call.
   */
  async getUserImputationReport(userId) {
    return await this.executeRequest(
      () => client.get(`/api/reports/users/${userId}/imputations-report`)
    );
  }
}
