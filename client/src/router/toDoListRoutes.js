import LegacyToDoListView from "@/views/ToDoList/LegacyToDoListView.vue";
import ToDoListOverView from "@/views/ToDoList/ToDoListOverView.vue";
import ToDoListDetailView from "@/views/ToDoList/ToDoListDetailView.vue";
import ToDoListJoin from "@/views/ToDoList/ToDoListJoin.vue";
export default [
    {
        path: '/localtodolist',
        name: 'localtodolist',
        meta: {
            title: 'Local ToDoList',
            description: 'This is the Local ToDoList page',
            requiresAuth: true,
        },
        component: LegacyToDoListView
    },
    {
        path: '/toDoList',
        name: 'ToDoListOverView',
        meta: {
            title: 'ToDoList Over View',
            description: 'This is the ToDoList page',
            requiresAuth: true,
        },
        component: ToDoListOverView
    },
    {
        path: '/toDoList/:id',
        name: 'ToDoList',
        meta: {
            title: 'ToDoList',
            description: 'This is the ToDoList page',
            requiresAuth: true,
        },
        component: ToDoListDetailView
    },
    {
        path: '/toDoList/:id/join',
        name: 'ToDoListJoin',
        meta: {
            title: 'ToDoList',
            description: 'This is the ToDoList page',
            requiresAuth: true,
        },
        component: ToDoListJoin
    }
]