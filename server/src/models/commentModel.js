import { DataTypes } from 'sequelize';
import sequelize from '../database/connect.js';

const Comment = sequelize.define('Comment',
  {
    title: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [0, 50],
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    // Champs relationnels
    taskId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'task',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'user', // Nom de la table cible
        key: 'id',
      },
    },
  },
  {
    tableName: 'comment',
  });

export default Comment;
