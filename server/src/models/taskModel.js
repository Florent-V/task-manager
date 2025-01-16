import { DataTypes } from 'sequelize';
import sequelize from '../database/connect.js';

const Task = sequelize.define('Task',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    estimation: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
        min: 0,
      },
    },
    loggedTime: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
        min: 0,
      },
    },
    // Champs relationnels
    kanbanId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'kanban',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    priorityId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'priority',
        key: 'id',
      },
    },
    sizeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'size',
        key: 'id',
      },
    },
    stageId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'stage',
        key: 'id',
      },
    },
    assignedToId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'user', // Nom de la table cible
        key: 'id',
      },
    },
  },
  {
    tableName: 'task',
  });

export default Task;
