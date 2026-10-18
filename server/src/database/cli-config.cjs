// Configuration de sequelize-cli (migrations). Les identifiants viennent des mêmes variables d'environnement que l'API.
const config = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  dialect: 'mysql',
};

module.exports = { development: config, production: config };
