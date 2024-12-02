import KanbanBoardView from "@/views/Kanban/KanbanBoardView.vue";
import KanbanBoardView2 from "@/views/Kanban/KanbanBoardView2.vue";
import KanbanBoardView3 from "@/views/Kanban/KanbanBoardView3.vue";
import KanbanFormComponent from "@/components/Kanban/KanbanFormComponent.vue";


export default [
  {
    path: '/kanban',
    name: 'kanban',
    meta: {
      title: 'kanban',
      description: 'This is the kanban page'
    },
    component: KanbanBoardView
  },
  {
    path: '/kanban2',
    name: 'kanban2',
    meta: {
      title: 'kanban2',
      description: 'This is the kanban page'
    },
    component: KanbanBoardView2
  },
  {
    path: '/kanban3',
    name: 'kanban3',
    meta: {
      title: 'kanban3',
      description: 'This is the kanban page'
    },
    component: KanbanBoardView3
  },
  {
    path: '/kanbanform',
    name: 'kanbanForm',
    meta: {
      title: 'kanbanForm',
      description: 'This is the kanbanForm page'
    },
    component: KanbanFormComponent
  },

]