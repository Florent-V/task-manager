import mysql from 'mysql2/promise';
import { Sequelize } from 'sequelize';
import config from '../config/config.js';
import logger from '../config/logger.js';

// Configuration de la base de données
const dbConfig = {
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.name,
};

// Fonction pour tester la connexion à la base de données
export async function testNativeDbConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    await connection.query('SELECT 1');
    logger.info('Native database connection successful.');
    await connection.end();
  } catch (error) {
    logger.error('Native database connection error:', { message: error.message, stack: error.stack });
    process.exit(1);
  }
}

export async function testSequelizeDbConnection() {
  try {
    const sequelize = new Sequelize(
      config.db.name,
      config.db.user,
      config.db.password,
      {
        host: config.db.host,
        dialect: config.db.dialect,
        pool: {
          max: config.db.pool.max,
          min: config.db.pool.min,
          acquire: config.db.pool.acquire,
          idle: config.db.pool.idle
        }
      });
    await sequelize.authenticate();
    logger.info('Sequelize database connection successful.');
  } catch (error) {
    logger.error('Sequelize database connection error:', { message: error.message, stack: error.stack });
    process.exit(1);
  }
}