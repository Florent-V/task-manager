import { generateExcelService } from '../services/generateExcelService.js';
import { Op } from 'sequelize';
import logger from '../config/logger.js';
import * as imputationRepository from '../repository/imputationRepository.js';
import * as taskRepository from '../repository/taskRepository.js';
import UnauthorizedError from "../error/unauthorizedError.js";

export const exportUserTimeTrackingReport = async (req, res, next) => {
  logger.debug('ExportUserTimeTrackingReport');
  try {
    // Get and check User
    const userId = req.user.id;
    if (!userId) {
      return next(
        new UnauthorizedError('Access denied: You do not have permission to export reports')
      );
    }

    // Get the start and end dates from query parameters
    const { startDate, endDate } = req.query;
    const whereClause = { userId };
    if (startDate) whereClause.date = { ...whereClause.date, [Op.gte]: startDate };
    if (endDate) whereClause.date = { ...whereClause.date, [Op.lte]: endDate };

    logger.debug(
      `ExportUserTimeTrackingReport for userId: ${userId}, startDate: ${startDate}, endDate: ${endDate}`
    );

    const imputations = await imputationRepository.getImputationsForUserByWhereClause(whereClause);
    const kanbansData = imputations.reduce((acc, imp) => {
      const kanbanTitle = imp.task.kanban.title;
      if (!acc[kanbanTitle]) {
        acc[kanbanTitle] = {
          kanbanTitle,
          imputations: [],
        };
      }
      acc[kanbanTitle].imputations.push({
        task: imp.task.title,
        date: new Date(imp.date),
        timeSpent: imp.timeSpent,
        comment: imp.comment,
      });
      return acc;
    }, {});

    const reportData = Object.values(kanbansData);

    // Générer le fichier Excel (méthode async avec ExcelJS)
    const excelBuffer = await generateExcelService.generateUserTimeTrackingReport(reportData);

    // Vérifier que le buffer a été généré
    if (!excelBuffer || excelBuffer.length === 0) {
      logger.error('Impossible de générer le fichier Excel');
      throw new Error('Impossible de générer le fichier Excel');
    }

    logger.debug(`Buffer Excel généré: ${excelBuffer.length} bytes`);

    const filename = `user_time_tracking_report_${new Date().toISOString().split('T')[0]}.xlsx`;

    res.writeHead(200, {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': excelBuffer.length,
      'Cache-Control': 'no-cache',
    });

    res.end(excelBuffer);
  } catch (error) {
    next(error);
  }
};

export const exportKanbanImputationReport = async (req, res, next) => {
  logger.debug('ExportKanbanImputationReport');
  try {
    const { id: kanbanId } = req.params;
    logger.debug(`ExportKanbanImputationReport for kanbanId: ${kanbanId}`);

    const tasks = await taskRepository.getTasksWithImputationsByKanban(kanbanId);

    // Sort tasks to have archived ones at the end
    tasks.sort((a, b) => (a.isArchived === b.isArchived ? 0 : a.isArchived ? 1 : -1));

    const kanbanTitle = tasks.length > 0 ? tasks[0].kanban.title : 'Kanban Report';

    const tasksSummary = tasks.map(task => {
      const totalTimeSpentOnTask = task.imputations.reduce((acc, imp) => acc + imp.timeSpent, 0);
      const varianceMinutes = totalTimeSpentOnTask - task.estimation;
      const varianceAbsMinutes = Math.abs(varianceMinutes);
      const variancePerc = task.estimation > 0 ? (totalTimeSpentOnTask / task.estimation) * 100 : 0;

      return {
        id: task.id,
        title: task.title,
        estimation: task.estimation,
        totalTimeSpentOnTask,
        varianceMinutes,
        varianceAbsMinutes,
        variancePerc,
        isArchived: task.isArchived ? 'Yes' : 'No',
        stage: task.stage ? task.stage.name : 'N/A',
      };
    });

    const detailedImputations = await imputationRepository.getImputationsByKanbanIdPaginated(kanbanId, 9999, 0);

    const reportData = {
      kanbanTitle,
      tasksSummary,
      detailedImputations: detailedImputations.rows.map(imp => ({
        ...imp,
        userFullName: `${imp.user.firstName} ${imp.user.lastName}`
      })),
    };

    // Vérifier que les données existent
    if (!reportData) {
      logger.error('Pas de données de rapport');
      return res.status(400).json({ error: 'Aucune donnée de rapport trouvée' });
    }

    // Générer le fichier Excel (méthode async avec ExcelJS)
    const excelBuffer = await generateExcelService.generateKanbanImputationReport(reportData);

    // Vérifier que le buffer a été généré
    if (!excelBuffer || excelBuffer.length === 0) {
      throw new Error('Impossible de générer le fichier Excel');
    }

    logger.debug(`Buffer Excel généré: ${excelBuffer.length} bytes`);

    const filename = `kanban_imputation_report_${kanbanId}_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Important: définir les headers avant d'envoyer les données
    res.writeHead(200, {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': excelBuffer.length,
      'Cache-Control': 'no-cache'
    });

    // Envoyer le buffer
    res.end(excelBuffer);
    console.log('Fichier Excel envoyé avec succès');
  } catch (error) {
    next(error);
  }
};
