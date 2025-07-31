import ExcelJS from 'exceljs';
import { TimeParser } from '../utils/timeParser.js';

class GenerateExcelService {
  constructor() {
    this.timeParser = new TimeParser();
    this.colors = {
      primary: 'FF2E4053', // Dark Blue
      secondary: 'FF5D6D7E', // Greyish Blue
      accent: 'FF1ABC9C', // Turquoise
      textLight: 'FFFFFFFF',
      positive: 'FFD5F5E3', // Light Green
      negative: 'FFFADBD8', // Light Red
      positiveFont: 'FF006100',
      negativeFont: 'FF9C0006',
    };
  }

  // =================================================================
  // PUBLIC METHODS
  // =================================================================

  async generateKanbanImputationReport(reportData) {
    const workbook = this._createWorkbook();
    this._addTasksSummarySheet(workbook, reportData.tasksSummary || [], reportData.kanbanTitle);
    this._addDetailedImputationsSheet(workbook, reportData.detailedImputations || [], reportData.kanbanTitle);
    return workbook.xlsx.writeBuffer();
  }

  async generateUserTimeTrackingReport(reportData) {
    const workbook = this._createWorkbook();
    this._addUserTimeTrackingSheet(workbook, reportData || []);
    return workbook.xlsx.writeBuffer();
  }

  // =================================================================
  // PRIVATE HELPERS - SHEET CREATION
  // =================================================================

  _addTasksSummarySheet(workbook, tasksSummary, kanbanTitle) {
    const sheet = workbook.addWorksheet('Tasks Summary');
    const columns = [
      { header: 'Task Title', key: 'title', width: 45 },
      { header: 'Stage', key: 'stage', width: 20 },
      { header: 'Archived', key: 'isArchived', width: 12, alignment: { horizontal: 'center' } },
      { header: 'Estimated', key: 'estimation', width: 15, alignment: { horizontal: 'center' } },
      { header: 'Time Spent', key: 'totalTimeSpent', width: 15, alignment: { horizontal: 'center' } },
      { header: 'Variance', key: 'variance', width: 15, alignment: { horizontal: 'center' } },
      { header: 'Variance %', key: 'variancePerc', width: 15, alignment: { horizontal: 'center' } },
    ];

    this._addStyledSheet(sheet, `Tasks Summary - ${kanbanTitle}`, columns, tasksSummary, this._addSummaryDataRows.bind(this));
  }

  _addDetailedImputationsSheet(workbook, detailedImputations, kanbanTitle) {
    const sheet = workbook.addWorksheet('Detailed Imputations');
    const columns = [
      { header: 'Task Title', key: 'taskTitle', width: 45 },
      { header: 'User', key: 'userFullName', width: 25 },
      { header: 'Time Spent', key: 'timeSpent', width: 15 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Comment', key: 'comment', width: 50 },
    ];

    this._addStyledSheet(sheet, `Detailed Imputations - ${kanbanTitle}`, columns, detailedImputations, this._addDetailedDataRows.bind(this));
  }

  _addUserTimeTrackingSheet(workbook, kanbanGroups) {
    const sheet = workbook.addWorksheet('User Time Tracking');

    const columns = [
        { header: 'Task', key: 'task', width: 45 },
        { header: 'Date', key: 'date', width: 15, style: { alignment: { horizontal: 'center' } } },
        { header: 'Time Spent', key: 'timeSpent', width: 15, style: { alignment: { horizontal: 'center' } } },
        { header: 'Comment', key: 'comment', width: 50 },
    ];

    columns.forEach((colDef, i) => {
        const col = sheet.getColumn(i + 1);
        col.width = colDef.width;
        if (colDef.style) {
            col.alignment = colDef.style.alignment;
        }
    });

    this._addTitle(sheet, 'User Time Tracking Report', columns.length);

    kanbanGroups.forEach(group => {
        const kanbanTitleRow = sheet.addRow([group.kanbanTitle]);
        sheet.mergeCells(kanbanTitleRow.number, 1, kanbanTitleRow.number, columns.length);
        const kanbanTitleCell = sheet.getCell(kanbanTitleRow.number, 1);
        kanbanTitleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: this.colors.textLight } };
        kanbanTitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: this.colors.secondary } };
        kanbanTitleCell.alignment = { vertical: 'middle', horizontal: 'center' };
        
        sheet.addRow([]);

        this._addHeaders(sheet, columns);

        group.imputations.forEach(imp => {
            sheet.addRow([
                imp.task,
                imp.date.toLocaleDateString(),
                this.timeParser.formatMinutesToTimeString(imp.timeSpent),
                imp.comment,
            ]);
        });

        sheet.addRow([]);
    });

    this._styleAllCells(sheet);
  }

  // =================================================================
  // PRIVATE HELPERS - ROW RENDERING
  // =================================================================

  _addSummaryDataRows(sheet, data) {
    data.forEach(task => {
      const varianceSign = task.varianceMinutes > 0 ? '+' : (task.varianceMinutes < 0 ? '-' : '');
      const row = sheet.addRow([
        task.title,
        task.stage,
        task.isArchived,
        this.timeParser.formatMinutesToTimeString(task.estimation),
        this.timeParser.formatMinutesToTimeString(task.totalTimeSpentOnTask),
        `${varianceSign}${this.timeParser.formatMinutesToTimeString(task.varianceAbsMinutes)}`,
        task.estimation > 0 ? `${varianceSign}${task.variancePerc.toFixed(0)}%` : 'N/A',
      ]);

      const varianceCell = row.getCell(6);
      const variancePercCell = row.getCell(7);

      if (task.varianceMinutes > 0) {
        varianceCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: this.colors.negative } };
        varianceCell.font = { color: { argb: this.colors.negativeFont } };
        variancePercCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: this.colors.negative } };
        variancePercCell.font = { color: { argb: this.colors.negativeFont } };
      } else if (task.varianceMinutes < 0) {
        varianceCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: this.colors.positive } };
        varianceCell.font = { color: { argb: this.colors.positiveFont } };
        variancePercCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: this.colors.positive } };
        variancePercCell.font = { color: { argb: this.colors.positiveFont } };
      }
    });
  }

  _addDetailedDataRows(sheet, data) {
    data.forEach(imputation => {
      sheet.addRow([
        imputation.task.title,
        imputation.userFullName,
        this.timeParser.formatMinutesToTimeString(imputation.timeSpent),
        new Date(imputation.date).toLocaleDateString(),
        imputation.comment,
      ]);
    });
  }

  _addUserReportDataRows(sheet, data) {
      data.forEach(imputation => {
          sheet.addRow([
              imputation.kanban,
              imputation.task,
              imputation.date,
              imputation.timeSpent,
              imputation.comment,
          ]);
      });
  }

  // =================================================================
  // PRIVATE HELPERS - GENERIC STYLING
  // =================================================================

  _createWorkbook() {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Task Manager App';
    workbook.created = new Date();
    return workbook;
  }

  _addStyledSheet(sheet, title, columns, data, addDataRowsCallback) {
    this._addTitle(sheet, title, columns.length);
    this._addHeaders(sheet, columns);
    addDataRowsCallback(sheet, data);
    this._setColumnWidths(sheet, columns);
    this._styleAllCells(sheet);
  }

  _addTitle(sheet, title, columnCount) {
    const titleRow = sheet.addRow([title]);
    titleRow.font = { name: 'Calibri', size: 16, bold: true };
    sheet.mergeCells(1, 1, 1, columnCount);
    titleRow.alignment = { vertical: 'middle', horizontal: 'center' };
    titleRow.height = 30;
    sheet.addRow([]); // Spacer row
  }

  _addHeaders(sheet, columns) {
    const headerRow = sheet.addRow(columns.map(c => c.header));
    headerRow.eachCell(cell => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: this.colors.primary } };
      cell.font = { bold: true, color: { argb: this.colors.textLight } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });
  }

  _setColumnWidths(sheet, columns) {
    sheet.columns.forEach((column, i) => {
      // The key is on the column object itself, which is weird.
      // We match by index from our definition array.
      if (columns[i]) {
        column.width = columns[i].width;
      }
    });
  }

  _styleAllCells(sheet) {
    sheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      // Skip title and header
      if (rowNumber <= 2) return;
      row.eachCell({ includeEmpty: true }, cell => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD6DBDF' } },
          left: { style: 'thin', color: { argb: 'FFD6DBDF' } },
          bottom: { style: 'thin', color: { argb: 'FFD6DBDF' } },
          right: { style: 'thin', color: { argb: 'FFD6DBDF' } },
        };
        // Alternate row color for readability, but not for header
        if (rowNumber > 3 && rowNumber % 2 === 0) {
            // Check if cell doesn't already have a fill from conditional formatting
            if (!cell.fill) {
                 cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F9F9' } };
            }
        }
      });
    });
  }
}

export const generateExcelService = new GenerateExcelService();
