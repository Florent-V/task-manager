// services/kanbanService.js
import { client } from '@/services/requestMaker.js';
import { hookApi } from '@/services/requestHookService.js';

export class KanbanService {
  constructor() {
    const { executeRequest } = hookApi();
    this.executeRequest = executeRequest;
  }

  async getKanban(kanbanId) {
    return await this.executeRequest(
      () => client.get(`/api/kanban/${kanbanId}`)
    );
  }

  async createKanban(kanbanId, kanbanData) {
    return await this.executeRequest(
      () => client.post(`/api/kanban/${kanbanId}`, kanbanData)
    );
  }

  async editKanban(kanbanId, updatedKanbanData) {
    return await this.executeRequest(
      () => client.patch(`/api/kanban/${kanbanId}}`, updatedKanbanData)
    );
  }

  async deleteKanban(kanbanId) {
    return await this.executeRequest(
      () => client.delete(`/api/kanban/${kanbanId}`)
    );
  }

  async shareKanban(kanbanId) {
    return await this.executeRequest(
      () => client.post(`/api/kanban/${kanbanId}/share`, {}),
    );
  }
}
