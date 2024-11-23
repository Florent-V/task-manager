import models from './index.js';

console.log('Liste des modèles', models);

export const defineAssociations = () => {
  //
  // Relation role <-> user
  //
  models.user.belongsToMany(models.role, {
    through: 'user_role',
    foreignKey: 'userId',
    otherKey: 'roleId'
  });
  models.role.belongsToMany(models.user, {
    through: 'user_role',
    foreignKey: 'roleId',
    otherKey: 'userId'
  });
  //
  // Relation user <-> product
  //
  models.product.belongsTo(models.user, {
    foreignKey: 'userId',
    onDelete: 'CASCADE'
  });
  models.user.hasMany(models.product, {
    foreignKey: 'userId'
  });
  //
  // Relation user <-> refreshToken
  //
  models.user.hasOne(models.refreshToken, {
    foreignKey: 'userId',
  });
  models.refreshToken.belongsTo(models.user, {
    foreignKey: 'userId',
    onDelete: 'CASCADE'
  });
  //
  // Relation user <-> toDoList
  //
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
  //
  // Relation toDoListType <-> toDoList
  //
  models.toDoListType.hasMany(models.toDoList, {
    foreignKey: 'typeId',
    onDelete: 'CASCADE'
  });
  models.toDoList.belongsTo(models.toDoListType, {
    as: 'type',
    foreignKey: 'typeId',
    onDelete: 'CASCADE'
  });
  //
  // Relation toDoList <-> toDoItem
  //
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
  //
  // Relation toDoItem <-> label
  //
  models.label.hasMany(models.toDoItem, {
    foreignKey: 'labelId',
    onDelete: 'CASCADE'
  });
  models.toDoItem.belongsTo(models.label, {
    foreignKey: 'labelId',
    onDelete: 'CASCADE'
  });
  //
  // Relation Many-to-Many Kanban et User
  //
  models.user.belongsToMany(models.kanban, {
    as: 'kanbans',
    through: 'user_kanban',
    foreignKey: 'userId',
    otherKey: 'kanbanId',
    onDelete: 'CASCADE'
  });
  models.kanban.belongsToMany(models.user, {
    as: 'users',
    through: 'kanban_user',
    foreignKey: 'kanbanId',
    otherKey: 'userId',
    onDelete: 'CASCADE'
  });
  //
  // Relation Many-to-One Kanban et Status
  //
  models.kanban.hasMany(models.status, {
    as: 'status',
    foreignKey: 'kanbanId',
    onDelete: 'CASCADE'
  });
  models.status.belongsTo(models.kanban, {
    as: 'kanban',
    foreignKey: 'kanbanId',
    onDelete: 'CASCADE'
  });
  //
  // Relation Many-to-One Kanban et Task
  //
  models.kanban.hasMany(models.task, {
    as: 'tasks',
    foreignKey: 'kanbanId',
    onDelete: 'CASCADE'
  });
  models.task.belongsTo(models.kanban, {
    as: 'kanban',
    foreignKey: 'kanbanId',
    onDelete: 'CASCADE'
  });
  //
  // Relation Many-to-One Status et Task
  //
  models.status.hasMany(models.task, {
    as: 'tasks',
    foreignKey: 'statusId',
    onDelete: 'SET NULL'
  });
  models.task.belongsTo(models.status, {
    as: 'status',
    foreignKey: 'statusId',
    onDelete: 'SET NULL'
  });
  //
  // Relation Many-to-One Priority et Task
  //
  models.priority.hasMany(models.task, {
    as: 'tasks',
    foreignKey: 'priorityId',
    onDelete: 'SET NULL'
  });
  models.task.belongsTo(models.priority, {
    as: 'priority',
    foreignKey: 'priorityId',
    onDelete: 'SET NULL'
  });
  //
  // Relation Many-to-One Size et Task
  //
  models.size.hasMany(models.task, {
    as: 'tasks',
    foreignKey: 'sizeId',
    onDelete: 'SET NULL'
  });
  models.task.belongsTo(models.size, {
    as: 'size',
    foreignKey: 'sizeId',
    onDelete: 'SET NULL'
  });
  //
  // Relation Many-to-One User et Task
  //
  models.user.hasMany(models.task, {
    as: 'tasks',
    foreignKey: 'userId',
    onDelete: 'SET NULL'
  });
  models.task.belongsTo(models.user, {
    as: 'user',
    foreignKey: 'userId',
    onDelete: 'SET NULL'
  });
};
