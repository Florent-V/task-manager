# Utiliser une image de base Node.js
FROM node:20-alpine

# Créer un répertoire de travail
WORKDIR /usr/src/app

# Copier package.json et package-lock.json
COPY package.json ./
# COPY package-lock.json ./

# Installer les dépendances
RUN npm i

# Copier le reste de l'application
COPY . .

# Utiliser START_METHOD pour lancer la commande npm run avec la méthode spécifiée
# CMD sh -c "echo 'Starting with method: ${START_METHOD}' && npm run START_METHOD"
CMD ["npm", "run", "start"]
