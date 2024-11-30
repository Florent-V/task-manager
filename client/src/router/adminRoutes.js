import ToDoListTypeView from "@/views/Admin/ToDoListTypeView.vue";
import PriorityView from "@/views/Admin/PriorityView.vue";
import StatusView from "@/views/Admin/StatusView.vue";
import SizeView from "@/views/Admin/SizeView.vue";

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
      component: ToDoListTypeView,
    },
  {
    path: '/admin/priority',
    name: 'priority',
    meta: {
      title: 'Priority',
      description: 'This is the Priority page',
      requiresAuth: true,
      role: 'ROLE_ADMIN',
    },
    component: PriorityView,
  },
  {
    path: '/admin/status',
    name: 'status',
    meta: {
      title: 'Status',
      description: 'This is the Status page',
      requiresAuth: true,
      role: 'ROLE_ADMIN',
    },
    component: StatusView,
  },
  {
    path: '/admin/size',
    name: 'size',
    meta: {
      title: 'Size',
      description: 'This is the Size page',
      requiresAuth: true,
      role: 'ROLE_ADMIN',
    },
    component: SizeView
  }
]