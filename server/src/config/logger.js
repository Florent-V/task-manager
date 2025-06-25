import winston from 'winston';

// Determine environment
const nodeEnv = process.env.NODE_ENV || 'development';

// Define base log level
const logLevel = nodeEnv === 'development' ? 'debug' : 'info';

// Define log formats
const developmentFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
);

const productionFormat = winston.format.combine(winston.format.timestamp(), winston.format.json());

// Choose format based on environment
const chosenFormat = nodeEnv === 'development' ? developmentFormat : productionFormat;

// Create a logger instance
const logger = winston.createLogger({
  level: logLevel,
  format: chosenFormat,
  transports: [
    // Log to the console
    new winston.transports.Console(), // Console transport will use the logger's level and format by default
    // Log to a file
    new winston.transports.File({
      filename: 'logs/server.log', // File transport will also use the logger's level and format
    }),
  ],
  exitOnError: false, // Do not exit on handled exceptions
});

// In development, also log to a debug file for more detailed logs
if (nodeEnv === 'development') {
  logger.add(
    new winston.transports.File({
      filename: 'logs/server-debug.log',
      level: 'debug', // Explicitly set debug level for this file
      format: developmentFormat, // Use development format for readability
    })
  );
}

export default logger;
