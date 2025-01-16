import { DataTypes } from 'sequelize';
import sequelize from '../database/connect.js';

const Kanban = sequelize.define('Kanban',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 50],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 250],
      },
    },
  },
  {
    tableName: 'kanban',
  }
);

export default Kanban;
