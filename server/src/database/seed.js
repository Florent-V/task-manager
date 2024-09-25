import sequelize from './connect.js';
import models from '../models/index.js';
const { role, user, product, toDoList, toDoItem, label } = models;

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
        username: 'userUser',
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'user@mail.com',
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
    await users[1].addRole(roles[1]);
    await users[2].addRole(roles[1]);
    await users[2].addRole(roles[2]);

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
      }
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
        }
    ]);


    const toDoLists = await toDoList.bulkCreate([
        {
            title: 'To Do List 1',
            description: 'Description of To Do List 1',
            userId: users[0].id,
        },
        {
            title: 'To Do List 2',
            description: 'Description of To Do List 2',
            userId: users[1].id,
        },
        {
            title: 'To Do List 3',
            description: 'Description of To Do List 3',
            userId: users[2].id,
        },
        {
          title: 'To Do List 4',
          description: 'Description of To Do List 4',
          userId: users[0].id,
        },
        {
          title: 'To Do List 5',
          description: 'Description of To Do List 5',
          userId: users[1].id,
        },
        {
          title: 'To Do List 6',
          description: 'Description of To Do List 6',
          userId: users[2].id,
        }
    ]);
    console.log('toDoLists', toDoLists.length);

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
      }
    ]);



    console.log('Données de test créées avec succès !');
  } catch (error) {
    console.error('Erreur lors de la création des données de test :', error);
    process.exit(1);
  }
};
