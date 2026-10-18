'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Migration de base : état du schéma en production au moment de la mise en place des migrations.
 * Idempotente (CREATE TABLE IF NOT EXISTS) : sur une base existante elle ne change rien et
 * s'enregistre simplement dans SequelizeMeta ; sur une base vide elle crée toutes les tables.
 */
module.exports = {
  async up(queryInterface) {
    const sql = fs.readFileSync(path.join(__dirname, 'sql', 'baseline.sql'), 'utf8');
    const statements = sql
      .split(/;\s*\n/)
      .map((statement) => statement.replace(/^--.*$/gm, '').trim())
      .filter(Boolean);

    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    try {
      for (const statement of statements) {
        await queryInterface.sequelize.query(statement);
      }
    } finally {
      await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    }
  },

  async down() {
    throw new Error(
      'La migration de base est irréversible (elle supprimerait toutes les données).'
    );
  },
};
