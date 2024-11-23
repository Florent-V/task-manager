import { DataTypes } from 'sequelize';
import sequelize from '../database/connect.js';

const Size = sequelize.define('Size', {
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
    tableName: 'size',
  });

export default Size;
