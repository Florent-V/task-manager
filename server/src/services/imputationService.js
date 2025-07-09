import { getImputationsByKanbanIdPaginated } from "../repository/imputationRepository.js";

/**
 * Gets the paginated detailed list of imputations for a Kanban, adding user's full name.
 * @param {string} kanbanId - The ID of the Kanban.
 * @param {number} page - The current page number.
 * @param {number} limit - The number of items per page.
 * @returns {Promise<{rows: Array<object>, count: number}>} Formatted imputations and total count.
 */
export async function getPaginatedImputationsDetail(kanbanId, page, limit) {
  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  const { rows: imputations, count } = await getImputationsByKanbanIdPaginated(kanbanId, parseInt(limit, 10), offset);

  const formattedImputations = imputations.map(imputation => {
    let userFullName = 'N/A';
    if (imputation.user) {
      userFullName = (imputation.user.firstName && imputation.user.lastName)
        ? `${imputation.user.firstName} ${imputation.user.lastName}`
        : imputation.user.firstName || imputation.user.lastName || 'N/A';
    }
    return {
      ...imputation,
      userFullName,
    };
  });

  return { rows: formattedImputations, count };
}