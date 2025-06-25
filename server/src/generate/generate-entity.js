/* eslint-disable */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// Templates
import modelTemplate from './modelTemplate.js';
import controllerTemplate from './controllerTemplate.js';
import routeTemplate from './routeTemplate.js';
import updatedAppJsContent from './updateApp.js';
// import updateDatabaseIndex from './updateDatabaseIndex.js';
import logger from '../config/logger.js';

const encoding = 'utf-8';

// Get __dirname with ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.join(path.dirname(__filename), '..');

// Get entity name from command line arguments
const entityName = process.argv[2];
if (!entityName) {
  logger.error('Vous devez spécifier un nom d\'entité.');
  process.exit(1);
}

// Folder and file names
const modelName = entityName.charAt(0).toUpperCase() + entityName.slice(1);
const modelFileName = `${entityName}Model.js`;
const controllerFileName = `${entityName}Controller.js`;
const routesFileName = `${entityName}Route.js`;
const middlewareFileName = `${entityName}Middleware.js`;

// Paths
const modelPath = path.join(__dirname, 'models', modelFileName);
const controllerPath = path.join(__dirname, 'controllers', controllerFileName);
const routesPath = path.join(__dirname, 'routes', routesFileName);
const middlewarePath = path.join(__dirname, 'middleware', middlewareFileName);
const indexPath = path.join(__dirname, 'models', 'index.js');
const appJsPath = path.join(__dirname, 'app.js');

logger.info('modelName :', { modelName });
logger.info('entityName :', { entityName });
logger.info('modelFileName', { modelFileName });
logger.info('controllerFileName :', { controllerFileName });
logger.info('routesFileName :', { routesFileName });
logger.info('middlewareFileName :', { middlewareFileName });
logger.info('modelPath', { modelPath });
logger.info('controllerPath :', { controllerPath });
logger.info('routesPath :', { routesPath });
logger.info('middlewarePath :', { middlewarePath });
logger.info('appJsPath :', { appJsPath });
logger.info('indexPath :', { indexPath });
logger.info('modelTemplate :', { template: modelTemplate(modelName, entityName) });
// logger.info('controllerTemplate :', controllerTemplate(modelName, entityName, modelFileName));
// logger.info('routeTemplate :', routeTemplate(modelName, controllerFileName));
// logger.info('updatedAppJsContent :', updatedAppJsContent(entityName, modelName, routesFileName, appJsPath));
// logger.info('updateDatabaseIndex :', updateDatabaseIndex(entityName, modelName, modelFileName, indexPath));

// Middleware Express
const middlewareTemplate = `// ${middlewareFileName}`;

// Créer les répertoires si nécessaire
fs.mkdirSync(path.dirname(modelPath), { recursive: true });
fs.mkdirSync(path.dirname(controllerPath), { recursive: true });
fs.mkdirSync(path.dirname(routesPath), { recursive: true });
fs.mkdirSync(path.dirname(middlewarePath), { recursive: true });
// Écriture des fichiers

// fs.writeFileSync(modelPath, modelTemplate(modelName, entityName), encoding);
fs.writeFileSync(
  controllerPath,
  controllerTemplate(modelName, entityName, modelFileName),
  encoding
);
fs.writeFileSync(routesPath, routeTemplate(modelName, controllerFileName), encoding);
fs.writeFileSync(middlewarePath, middlewareTemplate, encoding);
fs.writeFileSync(
  appJsPath,
  updatedAppJsContent(entityName, modelName, routesFileName, appJsPath),
  encoding
);
// fs.writeFileSync(indexPath, updateDatabaseIndex(entityName, modelName, modelFileName, indexPath), encoding);

logger.info('Les fichiers ont été générés avec succès et app.js a été mis à jour.');
