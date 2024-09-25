import models from './index.js';

console.log('Liste des modèles', models);

export const defineAssociations = () => {
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
  models.product.belongsTo(models.user, {
    foreignKey: 'userId',
    onDelete: 'CASCADE'
  });
  models.user.hasMany(models.product, {
    foreignKey: 'userId'
  });
  models.user.hasOne(models.refreshToken, {
    foreignKey: 'userId',
    onDelete: 'CASCADE'
  });
  models.refreshToken.belongsTo(models.user, {
    foreignKey: 'userId',
    onDelete: 'CASCADE'
  });
  models.user.hasMany(models.toDoList, {
    foreignKey: 'userId',
    onDelete: 'CASCADE'
  });
  models.toDoList.belongsTo(models.user, {
    foreignKey: 'userId',
    onDelete: 'CASCADE'
  });
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
  models.label.hasMany(models.toDoItem, {
    foreignKey: 'labelId',
    onDelete: 'CASCADE'
  });
  models.toDoItem.belongsTo(models.label, {
    foreignKey: 'labelId',
    onDelete: 'CASCADE'
  });


};
