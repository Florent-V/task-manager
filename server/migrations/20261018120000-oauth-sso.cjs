'use strict';

/**
 * Passage à l'authentification SSO (serveur OAuth2), sans perte de données :
 * - user.ssoId : identifiant public (UUID) de l'utilisateur sur le serveur OAuth2, rempli à son premier login
 *   (le compte existant est retrouvé par e-mail) ;
 * - user.password devient facultatif (les comptes créés via le SSO n'en ont pas) ;
 * - tables « session » (sessions express-session) et « oauth_revocation » (back-channel logout) ;
 * - suppression de la table « refresh_token » de l'ancienne authentification JWT.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('user', 'ssoId', {
      type: Sequelize.UUID,
      allowNull: true,
      unique: true,
    });
    await queryInterface.changeColumn('user', 'password', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Modèle par défaut de connect-session-sequelize (timestamps Sequelize inclus)
    await queryInterface.createTable('session', {
      sid: { type: Sequelize.STRING(36), primaryKey: true },
      expires: { type: Sequelize.DATE },
      data: { type: Sequelize.TEXT },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable('oauth_revocation', {
      ssoId: { type: Sequelize.UUID, primaryKey: true },
      // Millisecondes, horloge de l'API
      revokedAt: { type: Sequelize.BIGINT, allowNull: false },
    });

    await queryInterface.dropTable('refresh_token');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.createTable('refresh_token', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      token: { type: Sequelize.STRING, allowNull: false, unique: true },
      expires: { type: Sequelize.DATE, allowNull: false },
      valid: { type: Sequelize.BOOLEAN, defaultValue: true },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'user', key: 'id' },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
    });

    await queryInterface.dropTable('oauth_revocation');
    await queryInterface.dropTable('session');

    // Comptes créés via le SSO : mot de passe inutilisable (aucun hash bcrypt ne correspond)
    await queryInterface.sequelize.query(
      "UPDATE `user` SET `password` = '!' WHERE `password` IS NULL"
    );
    await queryInterface.changeColumn('user', 'password', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.removeColumn('user', 'ssoId');
  },
};
