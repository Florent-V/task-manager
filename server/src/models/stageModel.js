import { DataTypes } from 'sequelize';
import sequelize from '../database/connect.js';

const Stage = sequelize.define('Stage',
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 50],
      },
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 150],
      },
    },
    maxRecord: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: true,
        min: 1,
        max: 99,
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
