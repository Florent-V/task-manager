import KanbanOverView from "@/views/Kanban/KanbanOverView.vue";
import KanbanDetailView from "@/views/Kanban/KanbanDetailView.vue";
import KanbanJoin from "@/views/Kanban/KanbanJoin.vue";
import TaskDetailView from "@/views/Kanban/TaskDetailView.vue";
import KanbanImputationReportView from "@/views/Kanban/KanbanImputationReportView.vue";
import TimeTrackingUserView from "@/views/Kanban/TimeTrackingUserView.vue";

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
    path: '/kanban/time-tracking',
    name: 'TimeTrackingOverview',
    meta: {
      requiresAuth: true,
      title: 'User Time Tracking',
      description: 'This is the global user time tracking overview'
    },
    component: TimeTrackingUserView
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
  },
  {
    path: '/kanban/:kanbanId/imputations',
    name: 'KanbanImputationReportView',
    meta: {
      requiresAuth: true,
      title: 'Kanban Imputation Report View',
      description: 'This is the kanban imputation report page'
    },
    component: KanbanImputationReportView,
    props: true, // Automatically pass route params as props (e.g., userId)
  },
  {
    path: '/kanban/:kanbanId/task/:taskId',
    name: 'TaskDetailViewPage',
    component: TaskDetailView,
    meta: {
      title: 'Task Details',
      description: 'Detailed view of a specific task'
    },
    props: true // Allows route params (kanbanId, taskId) to be passed as props
  }
]