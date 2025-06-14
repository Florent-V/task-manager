// services/taskService.js
import { client } from '@/services/requestMaker.js';
import { hookApi } from '@/services/requestHookService.js';

export class TaskService {
  constructor() {
    const { executeRequest } = hookApi();
    this.executeRequest = executeRequest;
  }

  async getPriorities() {
    try {
      return  await this.executeRequest(
        () => client.get('/api/priority')
      );
    } catch (err) {
      throw err;
    }
  }

  async getSizes() {
    try {
      return await this.executeRequest(
        () => client.get('/api/size')
      );
    } catch (err) {
      throw err;
    }
  }

  async getTasks(kanbanId) {
    try {
      return await this.executeRequest(
        () => client.get(`/api/kanban/${kanbanId}/task`)
      );
    } catch (err) {
      throw err;
    }
  }

  async createTask(kanbanId, taskData) {
    try {
      return await this.executeRequest(
        () => client.post(`/api/kanban/${kanbanId}/task`, taskData)
      );
    } catch (err) {
      throw err;
    }
  }

  async editTask(kanbanId, taskId, updatedTaskData) {
    try {
      return await this.executeRequest(
        () => client.patch(`/api/kanban/${kanbanId}/task/${taskId}`, updatedTaskData)
      );
    } catch (err) {
      throw err;
    }
  }

  async deleteTask(kanbanId, taskId) {
    try {
      return await this.executeRequest(
        () => client.delete(`/api/kanban/${kanbanId}/task/${taskId}`)
      );
    } catch (err) {
      throw err;
    }
  }

  async shareKanban(kanbanId) {
    try {
      return await this.executeRequest(
        () => client.post(`/api/kanban/${kanbanId}/share`, {}),
      );
    } catch (err) {
      throw err;
    }
  }

  async updateTaskStage(kanbanId, taskId, stageId, assignedToId) {
    try {
      console.log("url", `/api/kanban/${kanbanId}/task/${taskId}/stage`)
      return await this.executeRequest(
        () => client.patch(
          `/api/kanban/${kanbanId}/task/${taskId}/stage`,
          { stageId, assignedToId }
        )
      );
    } catch (err) {
      throw err;
    }
  }
}


// export const taskService = {
//
//
//
//
//
//
//
//
//
//
//
//
//
//   async updateTaskStage({ kanbanId, taskId, stageId, assignedToId }) {
//     try {
//       return await executeRequest(
//         () => client.patch(
//           `/api/kanban/${kanbanId}/task/${taskId}/stage`,
//           { stageId, assignedToId }
//         )
//       );
//     } catch (err) {
//       throw err;
//     }
//   }
// };
