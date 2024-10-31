import models from './index.js';

console.log('Liste des modèles', models);

export const defineAssociations = () => {
  // Relation role <-> user
  models.role.belongsToMany(models.user, {
    through: 'user_role',
    foreignKey: 'roleId',
    otherKey: 'userId'
  });
  models.user.belongsToMany(models.role, {
    through: 'user_role',
    foreignKey: 'userId',
    otherKey: 'roleId'
  });
  // Relation user <-> product
  models.product.belongsTo(models.user, {
    foreignKey: 'userId',
    onDelete: 'CASCADE'
  });
  models.user.hasMany(models.product, {
    foreignKey: 'userId'
  });
  // Relation user <-> refreshToken
  models.user.hasOne(models.refreshToken, {
    foreignKey: 'userId',
    onDelete: 'CASCADE'
  });
  models.refreshToken.belongsTo(models.user, {
    foreignKey: 'userId',
    onDelete: 'CASCADE'
  });
  // Relation user <-> toDoList
  models.user.belongsToMany(models.toDoList, {
    as: 'toDoLists',
    through: 'user_to_do_list',
    foreignKey: 'userId',
    onDelete: 'CASCADE'
  });
  models.toDoList.belongsToMany(models.user, {
    as: 'users',
    through: 'user_to_do_list',
    foreignKey: 'toDoListId',
    onDelete: 'CASCADE'
  });
  // Relation toDoListType <-> toDoList
  models.toDoListType.hasMany(models.toDoList, {
    foreignKey: 'typeId',
    onDelete: 'CASCADE'
  });
  models.toDoList.belongsTo(models.toDoListType, {
    as: 'type',
    foreignKey: 'typeId',
    onDelete: 'CASCADE'
  });
  // Relation toDoList <-> toDoItem
  models.toDoList.hasMany(models.toDoItem, {
    as: 'toDoItems',
    foreignKey: 'toDoListId',
    onDelete: 'CASCADE'
  });
  models.toDoItem.belongsTo(models.toDoList, {
    as: 'toDoList',
    foreignKey: 'toDoListId',
    onDelete: 'CASCADE'
  });
  // Relation toDoItem <-> label
  models.label.hasMany(models.toDoItem, {
    foreignKey: 'labelId',
    onDelete: 'CASCADE'
  });
  models.toDoItem.belongsTo(models.label, {
    foreignKey: 'labelId',
    onDelete: 'CASCADE'
  });
};

