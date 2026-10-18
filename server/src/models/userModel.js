// user.model.js
import { DataTypes } from 'sequelize';
import sequelize from '../database/connect.js';

const User = sequelize.define(
  'User',
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    // Identifiant public et stable de l'utilisateur sur le serveur OAuth2 (UUID, « id » de /api/userinfo)
    ssoId: {
      type: DataTypes.UUID,
      allowNull: true,
      unique: true,
    },
    // Ancien mot de passe (avant le SSO) : conservé pour l'export vers le serveur OAuth2, plus utilisé
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: 'user',
  }
);

export default User;
