import { DataTypes } from 'sequelize';
import sequelize from '../database/connect.js';
import bcrypt from 'bcryptjs';
import { hashPassword } from '../services/passwordService.js';

const RefreshToken = sequelize.define('RefreshToken', {
  token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
  },
  expires: {
      type: DataTypes.DATE,
      allowNull: false,
  },
  valid: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
  },
},
{
  tableName: 'refresh_token',
  hooks: {
      beforeCreate: async (refreshToken, options) => {
          refreshToken.token = await hashPassword(refreshToken.token);
      },
      beforeUpdate: async (refreshToken, options) => {
        // Vérifiez si le token a été modifié avant de le hacher à nouveau
        if (refreshToken.changed('token')) {
          refreshToken.token = await hashPassword(refreshToken.token);
        }
      }
  }
});

RefreshToken.prototype.isValid = async function (token) {
  console.log('Debug Validation Token:', {
    token,
    thisToken: this.token,
    valid: this.valid,
    expires: this.expires,
    now: Date.now(),
  });
  return await bcrypt.compare(token, this.token) && this.valid && this.expires > Date.now();
};

export default RefreshToken;
