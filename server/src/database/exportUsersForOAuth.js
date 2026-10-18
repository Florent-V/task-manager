// Export des comptes pour le serveur OAuth2 (commande app:user:import du serveur).
// Les mots de passe sont exportés hachés (bcrypt) : le serveur les reprend tels quels, chaque utilisateur
// garde son mot de passe. Le fichier contient des hash de mots de passe : à supprimer après l'import.
//
// Usage : npm run oauth:export-users [-- fichier.json]   (par défaut : oauth-users.json)
import fs from 'node:fs';
import sequelize from './connect.js';
import User from '../models/userModel.js';
import logger from '../config/logger.js';

const file = process.argv[2] ?? 'oauth-users.json';

const runExport = async () => {
  try {
    const users = await User.findAll({
      attributes: ['email', 'username', 'password'],
      order: [['id', 'ASC']],
    });
    const entries = users.map((user) => ({
      email: user.email,
      username: user.username,
      password: user.password,
    }));
    fs.writeFileSync(file, `${JSON.stringify(entries, null, 2)}\n`, { mode: 0o600 });
    logger.info(`${entries.length} user(s) exported to ${file}`);
  } catch (error) {
    logger.error('Users export failed:', { message: error.message, stack: error.stack });
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

runExport();
