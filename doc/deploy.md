# Déploiement en production

Toutes les commandes se lancent depuis le dossier du projet sur le serveur (là où se trouvent `Makefile` et `docker-compose-prod.yml`).

## 1. Mise à jour importante (refonte du service IA, Node 24, durcissement Docker)

### Avant de lancer
1. **Sauvegarder la base** :
   ```bash
   make db-backup
   ```
   Le dump est créé dans `backups/backup-<date>.sql` (dossier ignoré par git). Copie-le aussi hors du serveur.
2. **Mettre à jour le `.env` du serveur** :
   - `NODE_ENV=production` et `START_METHOD=start`
   - Ajouter les variables IA (voir section 3). `MISTRAL_API_KEY` n'est plus utilisée.
3. **Droits des dossiers montés** : l'API tourne en utilisateur `node` (uid 1000) et doit pouvoir écrire dans :
   ```bash
   sudo chown -R 1000:1000 server/public/uploads server/logs
   ```
4. **Reverse proxy** : les ports du client (`NGINX_CLIENT_PORT`), de l'API (`NODE_API_PORT`) et de MySQL sont liés à `127.0.0.1`. Plus d'accès par `IP:PORT` : le reverse proxy de l'hôte doit pointer vers `127.0.0.1:<port>`.

### Lancer la mise à jour
```bash
make deploy
```
`make deploy` enchaîne : `git pull`, build des images, sauvegarde de la base (`backups/`), application des migrations en attente (avec la nouvelle image, avant la bascule : si une migration échoue, les anciens conteneurs continuent de tourner), recréation des conteneurs, puis affichage de l'état des migrations.

### Vérifier
```bash
docker compose -f docker-compose-prod.yml ps   # 3 conteneurs "Up", db "healthy"
make logs                                      # pas d'erreur au démarrage
```
Tester ensuite l'application via son domaine, et la génération IA d'une liste (les logs affichent `Provider IA : ...`).

### Migrations de la base
Le schéma est géré par des migrations (voir [migrations.md](migrations.md)). `make deploy` les applique automatiquement ; une seule commande suffit pour une mise en prod. Manuellement :
```bash
make db-migrate          # sauvegarde automatique, puis applique les migrations en attente
make db-migrate-status   # vérifie : toutes les migrations doivent être "up"
```
**Base existante** : la migration de base (`baseline-schema`) utilise `CREATE TABLE IF NOT EXISTS`. Sur une base déjà en place elle ne modifie aucune table, elle s'enregistre seulement dans la table `SequelizeMeta`. Toute évolution du schéma passe ensuite par une nouvelle migration (voir [migrations.md](migrations.md)).

### Retour arrière
```bash
git checkout <commit-precedent>
make deploy
make db-rollback                                # si une migration doit être annulée
make db-restore FILE=backups/backup-XXXX.sql   # seulement si les données sont à restaurer
```

## 1 bis. Passage à l'authentification SSO (serveur OAuth2)

À faire une seule fois, lors du déploiement de la version SSO. Détail complet dans le [README](../README.md#authentication-sso).
1. Déclarer l'application sur le serveur OAuth2 et compléter le `.env` (`OAUTH_*`, `SESSION_SECRET`, `COOKIE_SECURE`). Les variables `JWT_REFRESH_SECRET`, `PRIVATE_KEY`, `PUBLIC_KEY` et `*_LIFETIME` ne sont plus utilisées.
2. `make deploy` : la migration `oauth-sso` ajoute `user.ssoId`, rend `user.password` facultatif, crée les tables `session` et `oauth_revocation` et supprime `refresh_token`. Aucune donnée utilisateur n'est modifiée.
3. Juste après : `make oauth-export-users` (crée `server/oauth-users.json`, qui contient les hash des mots de passe), puis import sur le serveur OAuth2 avec `app:user:import ... --grant=task-manager`. **Supprimer ensuite le fichier partout.**

Les utilisateurs se connectent ensuite avec leur e-mail et leur mot de passe habituels ; leur compte est retrouvé par e-mail.

## 2. Premier déploiement (serveur vierge)

`make deploy` sert aussi au premier déploiement, après ces étapes :
1. Cloner le dépôt et créer le `.env` de production (voir `.env.template`).
2. Créer les dossiers montés avec les bons droits :
   ```bash
   mkdir -p server/public/uploads server/logs && sudo chown -R 1000:1000 server/public/uploads server/logs
   ```
3. `make deploy` (la base démarre vide, les migrations créent les tables).
4. Configurer le reverse proxy vers `127.0.0.1:<port>`.

Pour une mise à jour classique, `make deploy` suffit.

## 3. Commandes utiles

| Commande | Effet |
|---|---|
| `make deploy` | git pull + rebuild + recréation des conteneurs |
| `make up` / `make down` | Démarrer / arrêter |
| `make logs` | Logs en temps réel |
| `make db-backup` | Export MySQL dans `backups/` |
| `make db-restore FILE=...` | Restaurer un export |
| `make clean` | Supprime images orphelines et cache de build (sans risque pour les données) |
| `make clean-all` | Supprime toutes les images non utilisées (anciennes images `node:20`...) |
| `make clean-prod-volumes` | Supprime les anciens volumes `node_modules` (prod uniquement, après `make deploy`) |
| `make db-migrate` | Sauvegarde puis applique les migrations en attente |
| `make db-migrate-status` | État des migrations |
| `make db-rollback` | Annule la dernière migration |
| `make oauth-export-users` | Exporte les comptes pour le serveur OAuth2 (`server/oauth-users.json`, à supprimer après import) |

Après une modification du `.env`, un simple `restart` ne suffit pas : relancer `make deploy` (ou `docker compose -f docker-compose-prod.yml up -d --force-recreate api`).

## 4. Configuration du fournisseur IA

| Variable | Rôle |
|---|---|
| `AI_PROVIDER` | `mistral`, `openai`, `openrouter`, `nvidia`, `gemini` ou `ollama` (Ollama Cloud) |
| `AI_API_KEY` | Clé API du fournisseur |
| `AI_API_URL` | Optionnel : remplace l'URL par défaut (URL de base, sans `/chat/completions`) |
| `AI_MODEL` | Optionnel : remplace le modèle par défaut |

Pour ajouter un fournisseur compatible OpenAI, ajouter une entrée dans `server/src/services/ai/providerFactory.js`.

## 5. Bonnes pratiques
- Le port MySQL reste accessible depuis le serveur uniquement (`127.0.0.1`), par exemple via un tunnel SSH.
- Ne jamais versionner les fichiers `.env*` (ils contiennent des secrets).
