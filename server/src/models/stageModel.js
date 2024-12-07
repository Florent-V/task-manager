import { DataTypes } from 'sequelize';
import sequelize from '../database/connect.js';

const Stage = sequelize.define('Stage',
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    maxRecord: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
        min: 1,
      },
    },
    // Champ relationnel
    kanbanId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'kanban',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
  },
  {
    tableName: 'stage',
  });

export default Stage;
