// services/kanbanService.js
import { client } from '@/services/requestMaker.js';
import { hookApi } from '@/services/requestHookService.js';

export class KanbanService {
  constructor() {
    const { executeRequest } = hookApi();
    this.executeRequest = executeRequest;
  }

  async getKanban(kanbanId) {
    try {
      return await this.executeRequest(
        () => client.get(`/api/kanban/${kanbanId}`)
      );
    } catch (err) {
      throw err;
    }
  }

  async addKanban(kanbanId, kanbanData) {
    try {
      return await this.executeRequest(
        () => client.post(`/api/kanban/${kanbanId}`, kanbanData)
      );
    } catch (err) {
      throw err;
    }
  }

  async editKanban(kanbanId, updatedKanbanData) {
    try {
      return await this.executeRequest(
        () => client.patch(`/api/kanban/${kanbanId}}`, updatedKanbanData)
      );
    } catch (err) {
      throw err;
    }
  }

  async deleteKanban(kanbanId) {
    try {
      return await this.executeRequest(
        () => client.delete(`/api/kanban/${kanbanId}`)
      );
    } catch (err) {
      throw err;
    }
  }
}
