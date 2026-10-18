.PHONY: help up down deploy db-sync db-force logs restart dev-up dev-down dev-db-sync dev-db-force dev-logs dev-restart dev-install dev-rebuild dev-reset db-backup db-restore dev-db-backup db-migrate db-migrate-status db-rollback dev-db-migrate dev-db-migrate-status dev-db-rollback dev-db-migration-new clean clean-all clean-prod-volumes

# Définition du fichier docker-compose par défaut pour la production
COMPOSE_FILE=docker-compose-prod.yml

help: ## Affiche l'aide
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

up: ## Démarre les conteneurs en tâche de fond
	docker compose -f $(COMPOSE_FILE) up -d

down: ## Arrête et supprime les conteneurs
	docker compose -f $(COMPOSE_FILE) down

deploy: ## Met à jour la prod : git pull, build, sauvegarde, migrations, puis recréation des conteneurs
	git pull
	docker compose -f $(COMPOSE_FILE) build
	@if docker compose -f $(COMPOSE_FILE) ps --status running --services | grep -qx db; then $(MAKE) db-backup; else echo "Base non démarrée : sauvegarde ignorée (premier déploiement)"; fi
	docker compose -f $(COMPOSE_FILE) run --rm api npm run db:migrate
	docker compose -f $(COMPOSE_FILE) up -d --force-recreate
	docker compose -f $(COMPOSE_FILE) exec api npm run db:migrate:status

db-migrate: db-backup ## Sauvegarde la base puis applique les migrations en attente
	docker compose -f $(COMPOSE_FILE) exec api npm run db:migrate

db-migrate-status: ## Liste les migrations appliquées (up) et en attente (down)
	docker compose -f $(COMPOSE_FILE) exec api npm run db:migrate:status

db-rollback: ## Annule la dernière migration appliquée
	docker compose -f $(COMPOSE_FILE) exec api npm run db:migrate:undo

db-sync: ## [Déprécié, préférer db-migrate] Synchronise le schéma avec les modèles (alter)
	docker compose -f $(COMPOSE_FILE) exec api npm run db:sync

db-force: ## Synchronise la base de données (force) avec perte de données (supprime et recrée les tables)
	docker compose -f $(COMPOSE_FILE) exec api npm run db:sync:force

db-backup: ## Exporte la base MySQL dans backups/<date>.sql (sauvegarde rapide avant mise à jour)
	@mkdir -p backups
	docker compose -f $(COMPOSE_FILE) exec -T db sh -c 'exec mysqldump -uroot -p"$$MYSQL_ROOT_PASSWORD" --single-transaction --routines --triggers --no-tablespaces "$$MYSQL_DATABASE"' > backups/backup-$$(date +%Y%m%d-%H%M%S).sql
	@ls -lh backups | tail -1

db-restore: ## Restaure une sauvegarde : make db-restore FILE=backups/backup-XXXX.sql
	@test -n "$(FILE)" || (echo "Usage: make db-restore FILE=backups/backup-XXXX.sql" && exit 1)
	docker compose -f $(COMPOSE_FILE) exec -T db sh -c 'exec mysql -uroot -p"$$MYSQL_ROOT_PASSWORD" "$$MYSQL_DATABASE"' < $(FILE)

# Nom du projet compose (nom du dossier par défaut), utilisé pour préfixer les volumes
PROJECT_NAME_COMPOSE ?= $(shell basename $(CURDIR) | tr 'A-Z' 'a-z')

clean: ## Supprime les images orphelines (<none>) et le cache de build (sans toucher aux volumes ni aux données)
	docker image prune -f
	docker builder prune -f

clean-all: ## Comme clean + supprime TOUTES les images inutilisées par un conteneur (ex : anciennes images node:20)
	docker image prune -a -f
	docker builder prune -a -f

clean-prod-volumes: ## [PROD UNIQUEMENT] Supprime les anciens volumes node_modules devenus inutiles (jamais la base de données)
	-docker volume rm $(PROJECT_NAME_COMPOSE)_api_node_modules $(PROJECT_NAME_COMPOSE)_client_node_modules

logs: ## Affiche les logs des conteneurs en temps réel
	docker compose -f $(COMPOSE_FILE) logs -f

restart: ## Redémarre tous les conteneurs
	docker compose -f $(COMPOSE_FILE) restart

# --- Environnement de Développement ---

DEV_COMPOSE_FILE=docker-compose.yml

dev-up: ## [DEV] Démarre les conteneurs de développement en tâche de fond
	docker compose -f $(DEV_COMPOSE_FILE) up -d

dev-down: ## [DEV] Arrête et supprime les conteneurs de développement
	docker compose -f $(DEV_COMPOSE_FILE) down

dev-db-migrate: ## [DEV] Applique les migrations en attente
	docker compose -f $(DEV_COMPOSE_FILE) exec api npm run db:migrate

dev-db-migrate-status: ## [DEV] Liste les migrations appliquées et en attente
	docker compose -f $(DEV_COMPOSE_FILE) exec api npm run db:migrate:status

dev-db-rollback: ## [DEV] Annule la dernière migration appliquée
	docker compose -f $(DEV_COMPOSE_FILE) exec api npm run db:migrate:undo

dev-db-migration-new: ## [DEV] Crée une migration vide : make dev-db-migration-new NAME=add-xxx-to-yyy
	@test -n "$(NAME)" || (echo "Usage: make dev-db-migration-new NAME=add-xxx-to-yyy" && exit 1)
	docker compose -f $(DEV_COMPOSE_FILE) exec -u $$(id -u):$$(id -g) api npm run migration:generate -- $(NAME)

dev-db-sync: ## [DEV] [Déprécié] Synchronise la base de données (alter) sans supprimer les données existantes
	docker compose -f $(DEV_COMPOSE_FILE) exec api npm run db:sync

dev-db-force: ## [DEV] Synchronise la base de données (force) avec perte de données (supprime et recrée les tables)
	docker compose -f $(DEV_COMPOSE_FILE) exec api npm run db:sync:force

dev-lint-back: ## [DEV] Lint le code backend
	docker compose -f $(DEV_COMPOSE_FILE) exec api npm run lint

dev-lint-front: ## [DEV] Lint le code frontend
	docker compose -f $(DEV_COMPOSE_FILE) exec client npm run lint

dev-lint-fix-back: ## [DEV] Corrige les problèmes de linting dans le code backend
	docker compose -f $(DEV_COMPOSE_FILE) exec api npm run lint:fix

dev-lint-fix-front: ## [DEV] Corrige les problèmes de linting dans le code frontend
	docker compose -f $(DEV_COMPOSE_FILE) exec client npm run lint:fix

dev-logs: ## [DEV] Affiche les logs des conteneurs de développement en temps réel
	docker compose -f $(DEV_COMPOSE_FILE) logs -f

dev-restart: ## [DEV] Redémarre tous les conteneurs de développement
	docker compose -f $(DEV_COMPOSE_FILE) restart

dev-install: ## [DEV] Réinstalle les dépendances npm dans les conteneurs api et client, puis les redémarre
	docker compose -f $(DEV_COMPOSE_FILE) exec api npm install
	docker compose -f $(DEV_COMPOSE_FILE) exec client npm install
	docker compose -f $(DEV_COMPOSE_FILE) up -d --force-recreate api client

dev-rebuild: ## [DEV] Reconstruit les images et recrée les conteneurs (applique le .env), sans toucher aux données
	docker compose -f $(DEV_COMPOSE_FILE) up -d --build --force-recreate

dev-reset: ## [DEV] Installation propre : supprime conteneurs, volumes (dont la BDD et node_modules) et images, puis reconstruit
	docker compose -f $(DEV_COMPOSE_FILE) down -v --rmi local
	docker compose -f $(DEV_COMPOSE_FILE) up -d --build

dev-db-backup: ## [DEV] Exporte la base MySQL dans backups/dev-<date>.sql
	@mkdir -p backups
	docker compose -f $(DEV_COMPOSE_FILE) exec -T db sh -c 'exec mysqldump -uroot -p"$$MYSQL_ROOT_PASSWORD" --single-transaction --routines --triggers --no-tablespaces "$$MYSQL_DATABASE"' > backups/dev-backup-$$(date +%Y%m%d-%H%M%S).sql
	@ls -lh backups | tail -1
