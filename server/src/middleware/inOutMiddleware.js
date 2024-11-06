export const init = (req, res, next) => {
  // affichage de la route appellée
  console.log(`Route: ${req.originalUrl}`);
  res.data = {};
  next();
}

export const send = (req, res) => {
  if (Object.keys(res.data).length > 0) {
    res.status(res.statusCode || 200).json(res.data);
  } else {
    res.status(204).send()
  }
}
