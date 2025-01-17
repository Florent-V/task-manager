import { DataTypes } from 'sequelize';
import sequelize from '../database/connect.js';

const ToDoListType = sequelize.define('ToDoListType',
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'to_do_list_type',
  }
);

export default ToDoListType;
