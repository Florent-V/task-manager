import { DataTypes } from 'sequelize';
import sequelize from '../database/connect.js';

const Label = sequelize.define('Label', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  },
  {
    tableName: 'label',
  }
);

export default Label;
