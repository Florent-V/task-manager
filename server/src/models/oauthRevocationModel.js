import { DataTypes } from 'sequelize';
import sequelize from '../database/connect.js';

// Registre des révocations (back-channel logout) : utilisateur SSO -> date de la dernière révocation.
// Toute session de cet utilisateur ouverte avant cette date est fermée à sa requête suivante.
const OAuthRevocation = sequelize.define(
  'OAuthRevocation',
  {
    ssoId: {
      type: DataTypes.UUID,
      primaryKey: true,
    },
    // Horloge de cette application (millisecondes), jamais une date venant du serveur OAuth
    revokedAt: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
  },
  {
    tableName: 'oauth_revocation',
    timestamps: false,
  }
);

export default OAuthRevocation;
