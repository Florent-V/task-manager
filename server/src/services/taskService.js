import { getTasksByKanbanIdPaginated } from '../repository/taskRepository.js';

/**
 * Gets the paginated summary of tasks for a Kanban, including calculated variance metrics.
 * @param {string} kanbanId - The ID of the Kanban.
 * @param {number} page - The current page number.
 * @param {number} limit - The number of items per page.
 * @returns {Promise<{rows: Array<object>, count: number}>} Formatted tasks and total count.
 */
export async function getPaginatedTasksSummary(kanbanId, page, limit) {
  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const { rows: tasks, count } = await getTasksByKanbanIdPaginated(
    kanbanId,
    parseInt(limit, 10),
    offset
  );

  const formattedTasks = tasks.map((taskInstance) => {
    // Convert Sequelize instance to plain object to safely add properties
    const task = taskInstance.get({ plain: true });

    task.totalTimeSpentOnTask = (task.imputations || []).reduce(
      (sum, imp) => sum + (imp.timeSpent || 0),
      0
    );
    const estimation = task.estimation || 0;
    task.varianceMinutes = task.totalTimeSpentOnTask - estimation;
    task.varianceAbsMinutes = Math.abs(task.varianceMinutes);
    task.variancePerc = estimation ? (task.totalTimeSpentOnTask / estimation) * 100 : 0;

    // Ensure imputations also are plain objects if they are Sequelize instances
    if (task.imputations) {
      task.imputations = task.imputations.map((impInstance) => {
        const imp = impInstance.get ? impInstance.get({ plain: true }) : impInstance;
        if (imp.user && imp.user.get) {
          imp.user = imp.user.get({ plain: true });
        }
        return imp;
      });
    }
    return task;
  });

  return { rows: formattedTasks, count };
}
