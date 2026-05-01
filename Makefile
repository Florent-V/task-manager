.PHONY: help up down deploy db-sync db-force logs restart dev-up dev-down dev-db-sync dev-db-force dev-logs dev-restart

# Définition du fichier docker-compose par défaut pour la production
COMPOSE_FILE=docker-compose-prod.yml

help: ## Affiche l'aide
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

up: ## Démarre les conteneurs en tâche de fond
	docker compose -f $(COMPOSE_FILE) up -d

down: ## Arrête et supprime les conteneurs
	docker compose -f $(COMPOSE_FILE) down

deploy: ## Récupère les dernières modifications, reconstruit et redémarre les conteneurs
	git pull
	docker compose -f $(COMPOSE_FILE) up -d --build

db-sync: ## Synchronise la base de données (alter) sans supprimer les données existantes
	docker compose -f $(COMPOSE_FILE) exec api npm run db:sync

db-force: ## Synchronise la base de données (force) avec perte de données (supprime et recrée les tables)
	docker compose -f $(COMPOSE_FILE) exec api npm run db:sync:force

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

dev-db-sync: ## [DEV] Synchronise la base de données (alter) sans supprimer les données existantes
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
