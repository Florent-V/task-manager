import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../../config/logger.js';

export const init = (req, res, next) => {
  // affichage de la route appellée
  logger.info(`Incoming request for route: ${req.method} ${req.originalUrl}`, { ip: req.ip });
  res.data = {};
  res.routeFound = false;
  next();
};

export const setRouteFound = (req, res, next) => {
  res.routeFound = true;
  next();
};


export const send = (req, res) => {
  if (res.routeFound) {
    if (Object.keys(res.data).length > 0) {
      res.status(res.statusCode || 200).json(res.data);
    } else {
      res.status(204).send();
    }
  } else {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    res.status(404).sendFile(path.join(__dirname, '../page/404.html'));
  }
};