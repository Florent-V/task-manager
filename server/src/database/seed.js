/* eslint-disable */
import sequelize from './connect.js';
import models from '../models/index.js';
import logger from '../config/logger.js';

const {
  role,
  user,
  product,
  toDoList,
  toDoListType,
  toDoItem,
  label,
  priority,
  size,
  kanban,
  task,
  stage,
  comment,
  imputation,
} = models;

export const seedDatabase = async () => {
  try {
    await sequelize.sync({ force: true });

    const roles = await role.bulkCreate([
      { name: 'user' },
      { name: 'moderator' },
      { name: 'admin' },
    ]);

    const users = await user.bulkCreate([
      {
        username: 'userUser_1',
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'user1@mail.com',
        password: '$2a$10$KH1D8E6BfPJFsoxBJYA5TuVItCzipAxI52JiRl0gKLKCgMOsjM.6q',
      },
      {
        username: 'userUser_2',
        firstName: 'Peter',
        lastName: 'Jackson',
        email: 'user2@mail.com',
        password: '$2a$10$KH1D8E6BfPJFsoxBJYA5TuVItCzipAxI52JiRl0gKLKCgMOsjM.6q',
      },
      {
        username: 'userModerator',
        firstName: 'Bob',
        lastName: 'Johnson',
        email: 'moderator@mail.com',
        password: '$2a$10$KH1D8E6BfPJFsoxBJYA5TuVItCzipAxI52JiRl0gKLKCgMOsjM.6q',
      },
      {
        username: 'userAdmin',
        firstName: 'Charlie',
        lastName: 'Brown',
        email: 'admin@mail.com',
        password: '$2a$10$KH1D8E6BfPJFsoxBJYA5TuVItCzipAxI52JiRl0gKLKCgMOsjM.6q',
      },
    ]);

    await users[0].addRole(roles[0]);
    await users[1].addRole(roles[0]);
    await users[2].addRole(roles[1]);
    await users[3].addRole(roles[1]);
    await users[3].addRole(roles[2]);

    const products = await product.bulkCreate([
      {
        name: 'Product 1',
        price: 10.99,
        description: 'Description of product 1',
        image: 'default-product-image.webp',
        available: true,
        quantity: 100,
        releaseDate: new Date(),
        userId: users[0].id,
      },
      {
        name: 'Product 2',
        price: 20.99,
        description: 'Description of product 2',
        image: 'default-product-image.webp',
        available: true,
        quantity: 50,
        releaseDate: new Date(),
        userId: users[1].id,
      },
      {
        name: 'Product 3',
        price: 30.99,
        description: 'Description of product 3',
        image: 'default-product-image.webp',
        available: false,
        quantity: 0,
        releaseDate: new Date(),
        userId: users[2].id,
      },
      {
        name: 'Product 4',
        price: 40.99,
        description: 'Description of product 4',
        image: 'default-product-image.webp',
        available: true,
        quantity: 75,
        releaseDate: new Date(),
        userId: users[0].id,
      },
      {
        name: 'Product 5',
        price: 50.99,
        description: 'Description of product 5',
        image: 'default-product-image.webp',
        available: true,
        quantity: 25,
        releaseDate: new Date(),
        userId: users[1].id,
      },
      {
        name: 'Product 6',
        price: 60.99,
        description: 'Description of product 6',
        image: 'default-product-image.webp',
        available: true,
        quantity: 125,
        releaseDate: new Date(),
        userId: users[2].id,
      },
    ]);

    const labels = await label.bulkCreate([
      {
        name: 'low',
      },
      {
        name: 'medium',
      },
      {
        name: 'high',
      },
    ]);

    const toDoListTypes = await toDoListType.bulkCreate([
      {
        name: 'Personal',
      },
      {
        name: 'Work',
      },
      {
        name: 'Shopping',
      },
    ]);

    const toDoLists = await toDoList.bulkCreate([
      {
        title: 'To Do List 1',
        description: 'Description of To Do List 1',
        typeId: toDoListTypes[0].id,
      },
      {
        title: 'To Do List 2',
        description: 'Description of To Do List 2',
      },
      {
        title: 'To Do List 3',
        description: 'Description of To Do List 3',
      },
      {
        title: 'To Do List 4',
        description: 'Description of To Do List 4',
        userId: users[0].id,
      },
      {
        title: 'To Do List 5',
        description: 'Description of To Do List 5',
      },
      {
        title: 'To Do List 6',
        description: 'Description of To Do List 6',
      },
    ]);

    await toDoLists[0].addUsers([users[0], users[1]]);
    await toDoLists[1].addUser(users[1]);
    await toDoLists[2].addUsers([users[2], users[0]]);
    await toDoLists[3].addUser(users[0]);
    await toDoLists[4].addUser(users[1]);
    await toDoLists[5].addUsers([users[2], users[1]]);

    const toDoItems = await toDoItem.bulkCreate([
      {
        title: 'To Do Item 1',
        description: 'Description of To Do Item 1',
        toDoListId: toDoLists[0].id,
      },
      {
        title: 'To Do Item 2',
        description: 'Description of To Do Item 2',
        toDoListId: toDoLists[1].id,
      },
      {
        title: 'To Do Item 3',
        description: 'Description of To Do Item 3',
        toDoListId: toDoLists[2].id,
      },
      {
        title: 'To Do Item 4',
        description: 'Description of To Do Item 4',
        toDoListId: toDoLists[3].id,
      },
      {
        title: 'To Do Item 5',
        description: 'Description of To Do Item 5',
        toDoListId: toDoLists[4].id,
      },
      {
        title: 'To Do Item 6',
        description: 'Description of To Do Item 6',
        toDoListId: toDoLists[5].id,
      },
      {
        title: 'To Do Item 7',
        description: 'Description of To Do Item 7',
        toDoListId: toDoLists[0].id,
      },
      {
        title: 'To Do Item 8',
        description: 'Description of To Do Item 8',
        toDoListId: toDoLists[1].id,
      },
      {
        title: 'To Do Item 9',
        description: 'Description of To Do Item 9',
        toDoListId: toDoLists[2].id,
      },
      {
        title: 'To Do Item 10',
        description: 'Description of To Do Item 10',
        toDoListId: toDoLists[3].id,
      },
      {
        title: 'To Do Item 11',
        description: 'Description of To Do Item 11',
        toDoListId: toDoLists[4].id,
      },
      {
        title: 'To Do Item 12',
        description: 'Description of To Do Item 12',
        toDoListId: toDoLists[5].id,
      },
    ]);

    const priorities = await priority.bulkCreate([
      { label: 'Low', name: 'Low', color: '#808080' },
      { label: 'Medium', name: 'Medium', color: '#008000' },
      { label: 'High', name: 'High', color: '#FF0000' },
    ]);

    const sizes = await size.bulkCreate([
      { label: 'XS', name: 'Extra Small', color: '#808080' },
      { label: 'S', name: 'Small', color: '#008000' },
      { label: 'M', name: 'Medium', color: '#FFA500' },
      { label: 'L', name: 'Large', color: '#FF0000' },
      { label: 'XL', name: 'Extra Large', color: '#800080' },
    ]);

    const kanbans = await kanban.bulkCreate([
      {
        title: 'Sprint 1',
        description: 'Réalisation du backlog de base',
      },
      {
        title: 'Sprint 2',
        description: 'Amélioration de la gestion des utilisateurs',
      },
      {
        title: 'Sprint 3',
        description: 'Refonte de l\'interface utilisateur',
      },
    ]);

    const stages = await stage.bulkCreate([
      { name: 'Backlog', description: 'Tâches à faire', maxRecord: 10, kanbanId: kanbans[0].id },
      {
        name: 'Ready',
        description: 'Tâches prêtes à être réalisées',
        maxRecord: 5,
        kanbanId: kanbans[0].id,
      },
      {
        name: 'In Progress',
        description: 'Tâches en cours de réalisation',
        maxRecord: 3,
        kanbanId: kanbans[0].id,
      },
      {
        name: 'In Review',
        description: 'Tâches en cours de revue',
        maxRecord: 5,
        kanbanId: kanbans[0].id,
      },
      { name: 'Done', description: 'Tâches terminées', maxRecord: 5, kanbanId: kanbans[0].id },
    ]);

    const tasks = await task.bulkCreate([
      {
        title: "Créer l'interface Kanban",
        description: "Concevoir l'interface pour le tableau Kanban",
        priorityId: 1,
        sizeId: 2,
        stageId: 3,
        estimation: 400,
        assignedToId: users[0].id,
        kanbanId: kanbans[0].id,
      },
      {
        title: 'Ajouter le drag and drop',
        description: 'Permettre le déplacement des tâches entre les colonnes',
        priorityId: 2,
        sizeId: 2,
        stageId: 5,
        estimation: 600,
        assignedToId: users[0].id,
        kanbanId: kanbans[0].id,
      },
      {
        title: 'Implémenter le backend',
        description: 'Créer les routes et les contrôleurs pour le backend',
        priorityId: 3,
        sizeId: 3,
        stageId: 4,
        estimation: 800,
        assignedToId: users[0].id,
        kanbanId: kanbans[0].id,
      },
      {
        title: "Tester l'application",
        description: 'Effectuer des tests unitaires et fonctionnels',
        priorityId: 1,
        sizeId: 2,
        stageId: 3,
        estimation: 600,
        assignedToId: users[1].id,
        kanbanId: kanbans[0].id,
      },
      {
        title: "Déployer l'application",
        description: "Mettre en ligne l'application sur un serveur",
        priorityId: 3,
        sizeId: 4,
        stageId: 2,
        estimation: 400,
        assignedToId: users[0].id,
        kanbanId: kanbans[0].id,
      },
      {
        title: 'Ajouter des fonctionnalités',
        description: "Ajouter des fonctionnalités supplémentaires à l'application",
        priorityId: 1,
        sizeId: 5,
        stageId: 1,
        estimation: 1000,
        assignedToId: users[1].id,
        kanbanId: kanbans[0].id,
      },
      {
        title: 'Créer la page de login',
        description: "Créer la page de login pour l'application",
        priorityId: 2,
        sizeId: 2,
        stageId: 3,
        estimation: 400,
        assignedToId: users[0].id,
        kanbanId: kanbans[1].id,
      },
      {
        title: 'Créer la page d\'accueil',
        description: "Créer la page d'accueil pour l'application",
        priorityId: 2,
        sizeId: 2,
        stageId: 3,
        estimation: 400,
        assignedToId: users[0].id,
        kanbanId: kanbans[1].id,
      },
      {
        title: 'Créer la page de gestion des utilisateurs',
        description: "Créer la page de gestion des utilisateurs",
        priorityId: 2,
        sizeId: 2,
        stageId: 3,
        estimation: 600,
        assignedToId: users[0].id,
        kanbanId: kanbans[1].id,
      },
      {
        title: 'Créer la page de gestion des rôles',
        description: "Créer la page de gestion des rôles",
        priorityId: 2,
        sizeId: 2,
        stageId: 3,
        estimation: 600,
        assignedToId: users[1].id,
        kanbanId: kanbans[1].id,
      },
      {
        title: 'Créer la page de gestion des kanbans',
        description: "Créer la page de gestion des kanbans",
        priorityId: 2,
        sizeId: 2,
        stageId: 3,
        estimation: 600,
        assignedToId: users[1].id,
        kanbanId: kanbans[1].id,
      },
      {
        title: 'Créer la page de gestion des tâches',
        description: "Créer la page de gestion des tâches",
        priorityId: 2,
        sizeId: 2,
        stageId: 3,
        estimation: 600,
        assignedToId: users[0].id,
        kanbanId: kanbans[1].id,
      },
    ]);
    await kanbans[0].addUsers([users[0], users[1]]);
    await kanbans[1].addUsers([users[0], users[1]]);
    await kanbans[2].addUsers([users[0]]);

    const comments = await comment.bulkCreate([
      {
        title: 'Comment 1',
        content: 'Content of comment 1',
        taskId: tasks[0].id,
        authorId: users[0].id,
      },
      {
        title: 'Comment 2',
        content: 'Content of comment 2',
        taskId: tasks[1].id,
        authorId: users[1].id,
      },
      {
        title: 'Comment 3',
        content: 'Content of comment 3',
        taskId: tasks[0].id,
        authorId: users[0].id,
      },
      {
        title: 'Comment 4',
        content: 'Content of comment 4',
        taskId: tasks[1].id,
        authorId: users[1].id,
      },
      {
        title: 'Comment 5',
        content: 'Content of comment 5',
        taskId: tasks[1].id,
        authorId: users[0].id,
      },
      {
        title: 'Comment 6',
        content: 'Content of comment 6',
        taskId: tasks[0].id,
        authorId: users[1].id,
      },
    ]);

    const imputations = await imputation.bulkCreate([
      { date: '2023-06-01', taskId: tasks[0].id, userId: users[0].id, comment: 'Comment 1', timeSpent: 150 },
      { date: '2023-06-02', taskId: tasks[1].id, userId: users[1].id, comment: 'Comment 2', timeSpent: 120 },
      { date: '2023-06-03', taskId: tasks[1].id, userId: users[0].id, comment: 'Comment 3', timeSpent: 180 },
      { date: '2023-06-04', taskId: tasks[0].id, userId: users[1].id, comment: 'Comment 4', timeSpent: 240 },
      { date: '2023-06-05', taskId: tasks[0].id, userId: users[0].id, comment: 'Comment 5', timeSpent: 300 },
      { date: '2023-06-06', taskId: tasks[1].id, userId: users[1].id, comment: 'Comment 6', timeSpent: 360 },
      { date: '2023-06-07', taskId: tasks[6].id, userId: users[0].id, comment: 'Comment 7', timeSpent: 200 },
      { date: '2023-06-08', taskId: tasks[7].id, userId: users[1].id, comment: 'Comment 8', timeSpent: 220 },
      { date: '2023-06-09', taskId: tasks[6].id, userId: users[1].id, comment: 'Comment 9', timeSpent: 250 },
      { date: '2023-06-10', taskId: tasks[7].id, userId: users[0].id, comment: 'Comment 10', timeSpent: 280 },
      { date: '2023-06-11', taskId: tasks[6].id, userId: users[0].id, comment: 'Comment 11', timeSpent: 300 },
      { date: '2023-06-12', taskId: tasks[7].id, userId: users[1].id, comment: 'Comment 12', timeSpent: 320 },
    ]);

    logger.info('Test data created successfully!');
  } catch (error) {
    logger.error('Error creating test data:', { message: error.message, stack: error.stack });
    process.exit(1);
  }
};
