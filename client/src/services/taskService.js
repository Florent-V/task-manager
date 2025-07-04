// services/taskService.js
import { client } from '@/services/requestMaker.js';
import { hookApi } from '@/services/requestHookService.js';
import { TimeParser } from '@/utils/timeParser.js';

export class TaskService {
  constructor() {
    const { executeRequest } = hookApi();
    this.executeRequest = executeRequest;
    this.timeParser = new TimeParser();
  }

  async getPriorities() {
    return await this.executeRequest(
      () => client.get('/api/priority')
    );
  }

  async getSizes() {
    return await this.executeRequest(
      () => client.get('/api/size')
    );
  }

  async getTasks(kanbanId) {
    return await this.executeRequest(
      () => client.get(`/api/kanban/${kanbanId}/task`)
    );
  }

  async createTask(kanbanId, taskData) {
    return await this.executeRequest(
      () => client.post(`/api/kanban/${kanbanId}/task`, taskData)
    );
  }

  async editTask(kanbanId, taskId, updatedTaskData) {
    return await this.executeRequest(
      () => client.patch(`/api/kanban/${kanbanId}/task/${taskId}`, updatedTaskData)
    );
  }

  async archiveTask(kanbanId, taskId) {
    return await this.executeRequest(
      () => client.patch(`/api/kanban/${kanbanId}/task/${taskId}/archive`)
    );
  }

  async restoreTask(kanbanId, taskId) {
    console.log('restoreTask', kanbanId, taskId);
    return await this.executeRequest(
      () => client.patch(`/api/kanban/${kanbanId}/task/${taskId}/restore`)
    );
  }

  async deleteTask(kanbanId, taskId) {
    return await this.executeRequest(
      () => client.delete(`/api/kanban/${kanbanId}/task/${taskId}`)
    );
  }

  async updateTaskStage(kanbanId, taskId, stageId, assignedToId) {
    return await this.executeRequest(
      () => client.patch(
        `/api/kanban/${kanbanId}/task/${taskId}/stage`,
        { stageId, assignedToId }
      )
    );
  }

  async getComments(kanbanId, taskId) {
    return await this.executeRequest(
      () => client.get(`/api/kanban/${kanbanId}/task/${taskId}/comment`)
    );
  }

  async createComment(kanbanId, taskId, commentData) {
    return await this.executeRequest(
      () => client.post(`/api/kanban/${kanbanId}/task/${taskId}/comment`, commentData)
    );
  }

  async editComment(kanbanId, taskId, commentId, updatedCommentData) {
    return await this.executeRequest(
      () => client.patch(
        `/api/kanban/${kanbanId}/task/${taskId}/comment/${commentId}`,
        updatedCommentData
      )
    );
  }

  async deleteComment(kanbanId, taskId, commentId) {
    return await this.executeRequest(
      () => client.delete(`/api/kanban/${kanbanId}/task/${taskId}/comment/${commentId}`)
    );
  }

  async getImputations(kanbanId, taskId) {
    return await this.executeRequest(
      () => client.get(`/api/kanban/${kanbanId}/task/${taskId}/imputation`)
    );
  }

  async createImputation(kanbanId, taskId, imputationData) {
    return await this.executeRequest(
      () => client.post(`/api/kanban/${kanbanId}/task/${taskId}/imputation`, imputationData)
    );
  }

  async editImputation(kanbanId, taskId, imputationId, updatedImputationData) {
    return await this.executeRequest(
      () => client.patch(
        `/api/kanban/${kanbanId}/task/${taskId}/imputation/${imputationId}`,
        updatedImputationData
      )
    );
  }

  async deleteImputation(kanbanId, taskId, imputationId) {
    return await this.executeRequest(
      () => client.delete(`/api/kanban/${kanbanId}/task/${taskId}/imputation/${imputationId}`)
    );
  }

  formatMinutesToTimeString(minutes) {
    return this.timeParser.formatMinutesToTimeString(minutes);
  }

  calculateTimeSpent(task) {
    if (!task.imputations || !task.imputations.length) {
      return "0m";
    }
    return this.formatMinutesToTimeString(
      task.imputations.reduce((sum, imp) => sum + imp.timeSpent, 0)
    );
  }
}
