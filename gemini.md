
# Résumé du Projet : Task Manager

Ce document est une synthèse du projet générée par Gemini pour faciliter nos interactions futures. Il décrit l'architecture, les technologies, les commandes utiles et la structure des routes de l'application.

## 1. Vue d'ensemble

Il s'agit d'une application web complète de type "Task Manager" avec une architecture client-serveur.

-   **Frontend** : Un client riche et réactif construit avec Vue.js.
-   **Backend** : Une API RESTful robuste développée avec Node.js et Express.
-   **Base de données** : MySQL, gérée avec l'ORM Sequelize.
-   **Déploiement** : L'ensemble de l'application est conteneurisé avec Docker, facilitant la mise en place de l'environnement de développement et de production.

## 2. Stack Technologique

### Client (Frontend)

-   **Framework** : Vue.js 3 (avec l'API de Composition et `<script setup>`)
-   **Bundler** : Vite
-   **Gestion d'état** : Pinia
-   **Routing** : Vue Router
-   **Requêtes HTTP** : Axios
-   **Style** : Tailwind CSS, Sass
-   **Tests** : Vitest (unitaire), Nightwatch (E2E)
-   **Qualité de code** : ESLint, Prettier
-   **PWA** : `vite-plugin-pwa` pour les fonctionnalités d'application web progressive.

### Serveur (Backend)

-   **Framework** : Express.js
-   **Base de données** : MySQL avec Sequelize
-   **Authentification** : JWT (JSON Web Tokens) avec tokens d'accès et de rafraîchissement.
-   **Panel d'administration** : AdminJS
-   **Gestion des fichiers** : Multer pour l'upload.
-   **Validation** : Joi
-   **Intégrations** :
    -   **IA** : `@mistralai/mistralai` pour la génération de To-Do lists.
    -   **Export** : `exceljs` pour générer des rapports au format Excel.
    -   **Emails** : Nodemailer (avec Mailpit en développement).

### DevOps

-   **Conteneurisation** : Docker, Docker Compose.
-   **Serveur Web (Prod)** : Traefik est mentionné pour la production.

## 3. Commandes Utiles

### Installation et Lancement (via Docker)

1.  **Configurer `.env`** : Copier `.env.template` et remplir les variables.
2.  **Lancer les conteneurs** :
    ```bash
    docker compose up --build
    ```
3.  **Arrêter les conteneurs** :
    ```bash
    docker compose down
    ```

### Scripts `npm`

-   **Client (`/client`)**
    -   `npm start`: Lance le serveur de développement Vite.
    -   `npm run build`: Compile le projet pour la production.
    -   `npm run test:unit`: Lance les tests unitaires avec Vitest.
    -   `npm run lint`: Vérifie la qualité du code avec ESLint.
    -   `npm run format`: Formate le code avec Prettier.

-   **Serveur (`/server`)**
    -   `npm run dev`: Lance le serveur en mode développement avec Nodemon.
    -   `npm start`: Lance le serveur en mode production.
    -   `npm run make:crud <EntityName>`: Génère une nouvelle entité (modèle, route, contrôleur).

## 4. Structure des Routes

### Frontend (Vues principales)

-   `/` : Page d'accueil (`HomeView`, `WelcomeView`).
-   `/signin`, `/signup` : Authentification.
-   `/profile` : Profil utilisateur.
-   `/product`, `/product/:id` : CRUD pour les "Products".
-   `/kanban`, `/kanban/:id` : Vue d'ensemble et détail des tableaux Kanban.
-   `/kanban/:id/task/:taskId` : Détail d'une tâche.
-   `/kanban/:id/imputations` : Rapports de temps pour un Kanban.
-   `/toDoList`, `/toDoList/:id` : CRUD pour les To-Do Lists.
-   `/admin/...` : Pages d'administration (gestion des priorités, tailles, etc.).

### Backend (API Endpoints)

L'API est préfixée par `/api` (défini dans les variables d'environnement).

-   **Authentification (`/auth`)**
    -   `POST /signup`, `POST /signin`, `POST /logout`, `POST /refresh-token`

-   **Utilisateurs (`/users`)**
    -   `GET /me` : Récupère l'utilisateur connecté.
    -   `PATCH /me` : Met à jour l'utilisateur connecté.
    -   `GET /`, `GET /:id`, `PATCH /:id`, `DELETE /:id` : CRUD utilisateurs (Admin).

-   **Products (`/products`)**
    -   CRUD complet pour la gestion des produits, avec upload d'image.

-   **Kanbans (`/kanbans`)**
    -   `GET /`, `POST /` : Liste et création de Kanbans.
    -   `GET /:id`, `PATCH /:id`, `DELETE /:id` : Gestion d'un Kanban spécifique.
    -   `POST /:id/join`, `POST /:id/leave`, `POST /:id/share-email` : Partage et collaboration.
    -   **Ressources imbriquées :**
        -   `/kanbans/:id/stage` : Gestion des colonnes (stages) du Kanban.
        -   `/kanbans/:id/task` : Gestion des tâches du Kanban.
        -   `/kanbans/:id/imputations/...` : Endpoints pour les rapports de temps.

-   **Tâches (`/kanbans/:id/task`)**
    -   CRUD complet pour les tâches.
    -   `PATCH /:taskId/stage` : Changer une tâche de colonne.
    -   `PATCH /:taskId/archive`, `PATCH /:taskId/restore` : Archiver/Désarchiver une tâche.
    -   **Ressources imbriquées :**
        -   `/kanbans/:id/task/:taskId/comment` : Gestion des commentaires sur une tâche.
        -   `/kanbans/:id/task/:taskId/imputation` : Gestion du temps passé sur une tâche.

-   **To-Do Lists (`/to-do-lists`)**
    -   CRUD et fonctionnalités de partage similaires aux Kanbans.
    -   **Ressources imbriquées :**
        -   `/to-do-lists/:id/todoitem` : Gestion des items de la liste.

-   **Time Tracking (`/time-tracking`)**
    -   `GET /me` : Récupère toutes les imputations de l'utilisateur connecté.
    -   `GET /user-report/export` : Exporte le rapport de temps de l'utilisateur.

-   **IA (`/ai`)**
    -   `POST /generate-todolist` : Crée une To-Do List à partir d'un prompt.

-   **Admin (`/priorities`, `/sizes`, `/todolist-types`)**
    -   Endpoints CRUD génériques pour gérer les entités de configuration.
