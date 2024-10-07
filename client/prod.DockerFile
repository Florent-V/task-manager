# Utiliser une image de base Node.js
FROM node:20-alpine

ARG NODE_ENV
ARG START_METHOD

# Créer un répertoire de travail
WORKDIR /usr/src/app

# Copier package.json et package-lock.json
COPY package.json ./
# COPY package-lock.json ./

RUN echo "NODE_ENV: $NODE_ENV"
RUN echo "START_METHOD: $START_METHOD"

# Installer les dépendances
RUN npm i

# Copier le reste de l'application
COPY . .

# Utiliser START_METHOD pour lancer la commande npm run avec la méthode spécifiée
# CMD sh -c "echo 'Starting with method: ${START_METHOD}' && npm run START_METHOD"
