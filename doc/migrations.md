# Migrations de base de données

Le schéma MySQL est géré par `sequelize-cli` (équivalent de Doctrine Migrations). Chaque modification de schéma est un fichier versionné dans `server/migrations/`, avec `up()` (appliquer) et `down()` (annuler). Les migrations appliquées sont enregistrées dans la table `SequelizeMeta`.

`sequelize.sync()` (`make db-sync`) n'est plus utilisé pour faire évoluer le schéma : il est déprécié et ne doit pas servir en production.

## Workflow quand on modifie un modèle
1. Modifier le modèle (`server/src/models/...Model.js`) et le schéma Joi si besoin.
2. Créer la migration :
   ```bash
   make dev-db-migration-new NAME=add-category-to-to-do-item
   ```
3. Écrire `up()` et `down()` dans le fichier créé (`server/migrations/<date>-<nom>.js`), par exemple :
   ```js
   module.exports = {
     async up(queryInterface, Sequelize) {
       await queryInterface.addColumn('to_do_item', 'category', {
         type: Sequelize.STRING(50),
         allowNull: true,
       });
     },
     async down(queryInterface) {
       await queryInterface.removeColumn('to_do_item', 'category');
     },
   };
   ```
4. Tester en local : `make dev-db-migrate`, vérifier, puis `make dev-db-rollback` et `make dev-db-migrate` pour valider `down()`.
5. Commiter modèle + migration ensemble.
6. En production : `make deploy` (sauvegarde, migrations et redémarrage en une commande).

## Commandes
| Commande | Effet |
|---|---|
| `make dev-db-migration-new NAME=...` | Crée une migration vide |
| `make dev-db-migrate` / `make db-migrate` | Applique les migrations en attente (la prod sauvegarde avant) |
| `make dev-db-migrate-status` / `make db-migrate-status` | État des migrations |
| `make dev-db-rollback` / `make db-rollback` | Annule la dernière migration |

## Règles
- **Ne jamais modifier une migration déjà appliquée** (surtout en production) : en créer une nouvelle.
- Pour les changements risqués (renommage, suppression de colonne, changement de type), faire un `make db-backup` et tester d'abord en local sur une copie des données.
- Une migration peut être écrite en `queryInterface` (addColumn, changeColumn, createTable, addIndex...) ou en SQL brut (`queryInterface.sequelize.query(...)`).
- Les fichiers de `server/migrations/` sont en CommonJS (le dossier contient un `package.json` `{"type": "commonjs"}`), contrairement au reste de l'API en ES modules.
- Une nouvelle entité créée avec `npm run make:crud` nécessite aussi une migration `createTable`.

## Migration de base
`20261018000000-baseline-schema.cjs` crée le schéma de référence (`migrations/sql/baseline.sql`, généré depuis les modèles) avec `CREATE TABLE IF NOT EXISTS` :
- base vide (nouvelle installation, `make dev-reset`) : toutes les tables sont créées ;
- base existante (production) : aucune table modifiée, la migration est juste enregistrée.

Son `down()` est volontairement bloqué (il supprimerait toutes les données).

## Nouvelle installation locale
```bash
make dev-rebuild && make dev-db-migrate
```
Les données de test (`seed.js`) restent disponibles via `npm run db:sync:force` **en développement uniquement** (il supprime les tables).
