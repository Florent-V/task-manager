<h1 align="center"><a href="https://github.com/ElanYoung/vite-vue-js-starter-template" target="_blank">
🚀 Express - MYSQL - Vue 3  Task Manager App  🚀
</a></h1>

<p align="center">
  <a href="https://nodejs.org/en/about/releases/">
    <img src="https://img.shields.io/node/v/vite.svg" alt="node compatility" />
  </a>
  <a href="https://cn.vitejs.dev" rel="nofollow">
    <img src="https://img.shields.io/badge/express-4.19.2-red.svg" alt="vite" style="max-width:100%;" />
  </a>
  <a href="https://cn.vitejs.dev" rel="nofollow">
    <img src="https://img.shields.io/badge/vite-5.0.5-3963bc.svg" alt="vite" style="max-width:100%;" />
  </a>
  <a href="https://github.com/vuejs/vue">
    <img src="https://img.shields.io/badge/vue-3.4.29-brightgreen.svg" alt="vue" />
  </a>
  <a href="https://github.com/vuejs/router">
    <img src="https://img.shields.io/badge/vue--router-4.3.3-brightgreen.svg" alt="vue-router" />
  </a>
  <a href="https://github.com/vuejs/pinia">
    <img src="https://img.shields.io/badge/pinia-2.1.7-brightgreen.svg" alt="pinia" />
  </a>
  <a href="https://doc.starimmortal.com">
    <img alt="author" src="https://img.shields.io/badge/author-Florent--V-blue.svg" />
  </a>
  <a href="https://github.com/ElanYoung/vite-vue-js-starter-template/blob/master/LICENSE">
    <img alt="LICENSE" src="https://img.shields.io/github/license/ElanYoung/vite-vue-js-starter-template.svg" />
  </a>
</p>

This project is a task manager app with a front in VueJS and a back in Express.
This app allows you to manage your tasks and your todolists. You can create, edit and delete tasks and todolists.
You can also create a todolist and add tasks to it.
All is dockerized and ready to use.
This project is production ready with a docker-compose-prod.yml file which contains the configuration for a production environment on traefik. 

![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![Vue.js](https://img.shields.io/badge/vuejs-%2335495e.svg?style=for-the-badge&logo=vuedotjs&logoColor=%234FC08D)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![SASS](https://img.shields.io/badge/SASS-hotpink.svg?style=for-the-badge&logo=SASS&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B3263?style=for-the-badge&logo=eslint&logoColor=white)
![Sequelize](https://img.shields.io/badge/Sequelize-52B0E7?style=for-the-badge&logo=Sequelize&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Nodemon](https://img.shields.io/badge/NODEMON-%23323330.svg?style=for-the-badge&logo=nodemon&logoColor=%BBDEAD)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![MySQL](https://img.shields.io/badge/mysql-4479A1.svg?style=for-the-badge&logo=mysql&logoColor=white)
![WebStorm](https://img.shields.io/badge/webstorm-143?style=for-the-badge&logo=webstorm&logoColor=white&color=black)

<!-- TOC -->
* [Front - VueJS - Overview](#front---vuejs---overview)
  * [Vue3](#vue3)
  * [Features](#features)
  * [Testing](#testing)
  * [Styling](#styling)
  * [Code Quality](#code-quality)
* [Back - Express - Overview](#back---express---overview)
  * [Features](#features-1)
  * [API Endpoints](#api-endpoints)
* [Installation](#installation)
  * [How To Setup](#how-to-setup)
  * [Configuration .env](#configuration-env)
  * [Checklist](#checklist)
* [Deploy](#deploy)
* [TODO](#todo)
  * [Docker](#docker)
    * [Start the containers](#start-the-containers)
    * [Stop the containers](#stop-the-containers)
    * [Restart the containers](#restart-the-containers)
    * [Access to the MySQL container](#access-to-the-mysql-container)
    * [Access to the Node container](#access-to-the-node-container)
    * [Execute a SQL script in the MySQL container](#execute-a-sql-script-in-the-mysql-container)
      * [Method 1 : Script already in the container](#method-1--script-already-in-the-container)
      * [Method 2 : Copy the script in the container and execute it](#method-2--copy-the-script-in-the-container-and-execute-it)
      * [Method 3 : Access to the shell](#method-3--access-to-the-shell)
      * [Method 4 : Docker-compose](#method-4--docker-compose)
      * [Export the database](#export-the-database)
  * [Contributing](#contributing)
  * [License](#license)
<!-- TOC -->

# Front - VueJS - Overview

## Vue3
+ ⚡️ [Vite 5](https://github.com/vitejs/vite) - born with fastness
+ [PWA Plugin](https://www.npmjs.com/package/vite-plugin-pwa): A Vite plugin that helps you build progressive web applications (PWA) by generating a service worker and a manifest file for your application.
+ 🖖 [Vue 3](https://github.com/vuejs/core) - Composition API and `<script setup>`
+ 🚦 [Vue Router](https://github.com/vuejs/router) - The official router for Vue.js.
+ 📦 [Pinia](https://github.com/vuejs/pinia) - Intuitive, type safe and flexible Store for Vue
+ 🔗 [Axios](https://github.com/axios/axios) - Promise based HTTP client for the browser and node.js

## Features

+ Landing Page
+ Signin/Signup
+ Handle user with pinia
+ DB crud with axios
+ Responsive Design
+ Dark Mode

## Testing

+ [Nightwatch](https://nightwatchjs.org/): A testing library for running end-to-end tests in your application.
+ [Vitest](https://vitest.dev/): A unit testing library, can also be used to test components with `vue test utils`.

## Styling

+ [Tailwind CSS](https://tailwindui.com/): A utility-first CSS framework that helps you build custom user interfaces.
+ [Sass](https://sass-lang.com/): A CSS preprocessor that allows you to use variables and functions in your CSS.

## Code Quality

+ [ESLint](https://eslint.org/): A linting tool for JavaScript and TypeScript code.
+ [Prettier](https://prettier.io/): A code formatter that ensures consistency in your code style.

# Back - Express - Overview

## Features

+ CRUD operations with MySQL and Sequelize
+ JWT Authentication with roles based authentication
+ Containerized with Docker
+ Refresh Token
+ Session Token

## API Endpoints

All routes are prefixed by `/api`.

---
**Authentification**
- POST /signup
- POST /signin
- POST /logout
---
**User**
All following routes are protected by JWT token. You need to be authenticated to access them.
- GET /user  `Get all users (only for admin or moderator)`
- GET /user/me
- GET /user/{:id} `Get a user by id (only for admin)`
- PATCH /user/{:id} `Edit a user by id (only for admin)`
- POST /user/{:userId}/role/{:roleId} `Add a role to a user (only for admin)`
- DELETE /user/{:id} `Delete a user by id (only for admin)`
- DELETE /user/{:userId}/role/{:roleId} `Delete a role to a user (only for admin)`
---
**ToDoList and ToDoItem**
All following routes are protected by JWT token. You need to be authenticated to access them.
Product are linked to a user. Only the user who created the product can get, edit or delete it.
- GET /todolist `Get all user's todolists`
- GET /todolist/all `Get all todolists (only for admin)`
- POST /todolist `Create a todolist`
- GET /todolist/{:id} `Get a todolist by id(only for the user who created it)`
- PATCH /todolist/{:id} `Edit a todolist by id(only for the user who created it)`
- DELETE /todolist/{:id} `Delete a todolist by id(only for the user who created it)`
- POST /todolist/{:id}/todoitem `Create a todoitem in a todolist`
- GET /todolist/{:id}/todoitem `Get all todoitems in a todolist`
- GET /todolist/{:id}/todoitem/{:itemId} `Get a todoitem by id in a todolist`
- PATCH /todolist/{:id}/todoitem/{:itemId} `Edit a todoitem by id in a todolist`
- DELETE /todolist/{:id}/todoitem/{:itemId} `Delete a todoitem by id in a todolist`

I've made a script to generate a crud for a new entity. You can use it with :
- `npm run make:crud -- EntityName`
Be careful, this feature is still in development and some modifications may be needed.


# Local Installation

## How To Setup

- [Create a repo from this template on GitHub](https://github.com/Florent-V/starter-vue-express/generate).
- If you prefer, just `git clone https://github.com/Florent-V/starter-vue-express.git`
- `cd task-manager`
- configure .env file. See [Setup configuration](#configuration-env) below
- `docker compose up --build`
- Enjoy !

> The project will start locally at localhost:${NODE_API_PORT}

> I haven't try to launch the project without docker, but you can try with `npm start` or `npm run dev` if you have a MySQL database running on your machine. Don't forget to configure the .env file in the root of the project.

## Configuration .env

1. Copy the `.env.template` file to `.env` and configure the variables as needed.
2. Configuration of PRIVATE and PUBLIC key for JWT token :
   - Generate private key :  
   `openssl genpkey -algorithm RSA -out private_key.pem -pkeyopt rsa_keygen_bits:4096`
   - Generate public key :  
   `openssl rsa -pubout -in private_key.pem -out public_key.pem`
   - Copy the content of the private and public key in the .env file :  
   `cat private_key.pem`  
   `cat public_key.pem` 
3. To generate a secret key for the JWT token, you can use the following command :
```bash
openssl rand -base64 64
# or
node -e "console.log(require('crypto').randomBytes(64).toString('hex'));"
```

## Checklist

When you use this template, try follow the checklist to update your info properly

- [ ] Change the author name in `LICENSE`
- [ ] Change informations in `index.html`
- [ ] Change the hostname in `vite.config.js`
- [ ] Change the favicon in `public`
- [ ] Remove the `.github` folder which contains the funding info
- [ ] Clean up the README and remove routes

# Deploy in production

This project is production ready with traefik.  
Use docker-compose-prod to deploy the project.
You need to configure the .env file with the domain you want to use and a .env.production file with the same variables as the .env file
for frontend because in production mode, vueJS will use the .env.production file.
You can use the following command to start the project :
```bash
docker-compose -f docker-compose-prod.yml up --build
# or
docker compose -f docker-compose-prod.yml up --build -d
```
The '-d' option is to start the project in detached mode.
And it's done ! You can now access the project on the domain you've configured in the .env file.

To clean up the project, you can use the following command :
```bash
sudo docker compose -f docker-compose-prod.yml down --rmi all --volumes --remove-orphans
```

# TODO

- Intégrer des messages d'erreurs plus explicites dans les formulaires
- Ajouter des tests unitaires
- Valider les formulaires côté front
- critère validation mot de passe
- service toast message

# Docker Help Commands

This project use docker, if you're not familiar with it, here are some useful commands :

### Start the containers
```bash	
docker compose up --build
```

### Stop the containers
```bash
docker compose down
```

### Restart the containers
```bash
docker compose down
docker compose up --build
```

### Access to the MySQL container
```bash
docker exec -it ${PROJECT_NAME}-db-${ENV_NAME} sh
```

### Access to the Node container
```bash
docker exec -it ${PROJECT_NAME}-app-${ENV_NAME} sh
```

### Access to the Client container
```bash
docker exec -it ${PROJECT_NAME}-client-${ENV_NAME} sh
```


### Execute a SQL script in the MySQL container

#### Method 1 : Script already in the container
```bash
docker exec -i <container_name_or_id> mysql -u<username> -p<password> <database_name> < /path/to/script.sql
```

```bash
docker exec -i my_mysql_container mysql -uroot -pmysecretpassword mydatabase < /path/to/script.sql
```

#### Method 2 : Copy the script in the container and execute it

```bash
docker cp /path/to/script.sql <container_name_or_id>:/script.sql
docker exec -i <container_name_or_id> mysql -u<username> -p<password> <database_name> < /script.sql
```

#### Method 3 : Access to the shell
```bash
docker exec -it <container_name_or_id> sh
# and
mysql -u<username> -p<password>
# and
source /path/to/script.sql
```
Or
```bash
docker exec -it <container_name_or_id> mysql -u<username> -p<password>
# and
source /path/to/script.sql
```

#### Method 4 : Docker-compose

Before the `docker compose up --build` command, add the following lines in the `docker-compose.yml` file if you want to execute the scripts at the start of the MySQL container :

```yml
services:
  app:
    volumes:
      - ./sql:/docker-entrypoint-initdb.d
```

Then, create a `sql` folder at the root of the project and put your `.sql` files in it.


#### Export the database
```bash
docker exec -i <container_name_or_id> mysqldump -u<username> -p<password> <database_name> > /path/to/script.sql
```
Or
```bash
docker exec -it <container_name_or_id> sh
# and
mysqldump -u<username> -p<password> <database_name> > /path/to/script.sql
```

## Contributing

Contributions are welcome! Please follow the steps below to contribute:

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## License

This project is under MIT license. See the LICENSE file for more details.

Lorsque le conteneur MySQL démarrera, il exécutera automatiquement tous les scripts .sql présents dans le dossier /docker-entrypoint-initdb.d (qui correspond à votre dossier sql local) lors de la première initialisation de la base de données.

Quelques points importants à noter :

Cette méthode n'exécutera les scripts que lors de la première initialisation de la base de données. Si vous modifiez le script SQL et que vous voulez le réexécuter, vous devrez supprimer le volume de données MySQL et le recréer :