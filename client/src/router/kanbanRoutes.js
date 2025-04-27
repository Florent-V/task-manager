import KanbanOverView from "@/views/Kanban/KanbanOverView.vue";
import KanbanDetailView from "@/views/Kanban/KanbanDetailView.vue";
import KanbanJoin from "@/views/Kanban/KanbanJoin.vue";


export default [
  {
    path: '/kanban',
    name: 'KanbanOverView',
    meta: {
      title: 'Kanban Overview',
      description: 'This is the global kanban page'
    },
    component: KanbanOverView
  },
  {
    path: '/kanban/:id',
    name: 'kanbanDetail',
    meta: {
      title: 'Kanban Détail View',
      description: 'This is the kanban detail page'
    },
    component: KanbanDetailView
  },
  {
    path: '/kanban/:id/join',
    name: 'KanbanJoin',
    meta: {
      title: 'Kanban',
      description: 'This is the Kanban join page',
    },
    component: KanbanJoin
  }
]