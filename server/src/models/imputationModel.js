// imputationModel.js
import { DataTypes } from 'sequelize';
import sequelize from '../database/connect.js';

const Imputation = sequelize.define(
  'Imputation',
  {
    timeSpent: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    // Champ relationnel
    taskId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'task', // Name of the table
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'user', // Name of the table
        key: 'id',
      },
      onDelete: 'SET NULL', // Set to null if user is deleted
    },
  },
  {
    tableName: 'imputation',
    timestamps: true, // Sequelize will add createdAt and updatedAt timestamps
  });

export default Imputation;