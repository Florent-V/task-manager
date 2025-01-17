import { DataTypes } from 'sequelize';
import sequelize from '../database/connect.js';

const Priority = sequelize.define('Priority',
  {
    label: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    color: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isHexColor: true,
      },
    },
  },
  {
    tableName: 'priority',
  });

export default Priority;
