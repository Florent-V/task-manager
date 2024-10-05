import { DataTypes } from 'sequelize';
import sequelize from '../database/connect.js';

const ToDoList = sequelize.define('ToDoList', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  typeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    references: {
      model: 'to_do_list_type',
      key: 'id'
    }
  },
  },
  {
    tableName: 'to_do_list',
  }
);

export default ToDoList;
