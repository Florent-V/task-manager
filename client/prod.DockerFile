## Utiliser une image de base Node.js
#FROM node:20-alpine
#
## Créer un répertoire de travail
#WORKDIR /usr/src/app
#
## Copier package.json et package-lock.json
#COPY package.json ./
## COPY package-lock.json ./
#
#RUN echo "NODE_ENV: $NODE_ENV"
#RUN echo "START_METHOD: $START_METHOD"
#
## Installer les dépendances
#RUN npm i
#
## Copier le reste de l'application
#COPY . .
#
## Utiliser START_METHOD pour lancer la commande npm run avec la méthode spécifiée
## CMD sh -c "echo 'Starting with method: ${START_METHOD}' && npm run START_METHOD"
#CMD ["npm", "run", "dev"]

# Étape de build
FROM node:20-alpine AS build-stage

ARG VITE_API_BASE_URL
ARG VITE_CLIENT_DOCKER_PORT

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
RUN echo "VITE_API_BASE_URL: $VITE_API_BASE_URL"
COPY . .

ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_CLIENT_DOCKER_PORT=${VITE_CLIENT_DOCKER_PORT}

RUN npm run build

# Étape de production
FROM nginx:stable-alpine AS production-stage
COPY --from=build-stage /usr/src/app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 5050
CMD ["nginx", "-g", "daemon off;"]
