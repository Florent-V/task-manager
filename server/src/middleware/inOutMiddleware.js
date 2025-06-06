import path from 'path';
import { fileURLToPath } from 'url';
export const init = (req, res, next) => {
  // affichage de la route appellée
  console.log(`Route: ${req.originalUrl}`);
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

export const start = (req, res, next) => {
  console.log(
    `Request started on ${req.method}$ - ${req.originalUrl}`,
  );
  req.perf = Date.now();
  next();
}

export const end = (req, res, next) => {
  const delta = Date.now() - req.perf;
  console.log(
    `Request ended on ${req.method}${req.headers["x-forwarded-path"]} in ${delta}ms`,
  );
  next();
}
