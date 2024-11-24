import ToDoListTypeView from "@/views/Admin/ToDoListTypeView.vue";

export default [
    {
      path: '/admin/todolisttype',
      name: 'todolisttype',
      meta: {
        title: 'ToDoListType',
        description: 'This is the ToDoListType page',
        requiresAuth: true,
        role: 'ROLE_ADMIN',
      },
      component: ToDoListTypeView
    }
]