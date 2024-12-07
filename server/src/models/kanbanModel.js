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
  },
  {
    tableName: 'kanban',
  }
);

export default Kanban;
