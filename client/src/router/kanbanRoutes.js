import KanbanOverView from "@/views/Kanban/KanbanOverView.vue";
import KanbanDetailView from "@/views/Kanban/KanbanDetailView.vue";


export default [
  {
    path: '/kanban',
    name: 'kanban_overview',
    meta: {
      title: 'Kanban Overview',
      description: 'This is the global kanban page'
    },
    component: KanbanOverView
  },
  {
    path: '/kanban/:id',
    name: 'kanban_detail',
    meta: {
      title: 'Kanban Détail View',
      description: 'This is the kanban detail page'
    },
    component: KanbanDetailView
  }
]