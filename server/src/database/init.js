import models from '../models/index.js';
import sequelize from '../database/connect.js';
import { defineAssociations } from '../models/relation.js';
import { seedDatabase } from './seed.js';
import logger from '../config/logger.js';

// Initialisation et synchronisation de la base de données
const initDB = async (sync, option) => {
  try {
    await sequelize.authenticate();
    logger.info('Connection has been established successfully.');

    // Setup relations
    defineAssociations();

    // Synchronisation des modèles avec la base
    if (sync) {
      await sequelize.sync({ [option]: true });
      logger.info(`Database synced with ${option} option.`);
    }

    // Seed the database with test data
    if (option === 'force') {
      await seedDatabase();
      logger.info('Database seeded with test data.');
    }
  } catch (error) {
    logger.error('Something went wrong with the database:', { message: error.message, stack: error.stack });
  }
};

export default initDB;
