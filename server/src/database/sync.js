/* eslint-disable n/no-process-exit */

import initDB from './init.js';
import logger from '../config/logger.js';

// Récupérer les arguments passés au script
const args = process.argv.slice(2);
const isForce = args.includes('--force');

const runSync = async () => {
  try {
    const option = isForce ? 'force' : 'alter';
    logger.info(`Starting database synchronization with option: ${option}`);
    await initDB(true, option);
    logger.info(`Database synchronized successfully with option: ${option}`);
    process.exit(0);
  } catch (error) {
    logger.error('Failed to synchronize database:', {
      message: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
};

runSync();
