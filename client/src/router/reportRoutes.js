import KanbanTimelogReportView from '@/views/Reports/KanbanTimelogReportView.vue';
import UserTimelogReportView from '@/views/Reports/UserTimelogReportView.vue';

const reportRoutes = [
  {
    path: '/reports/kanban/:kanbanId',
    name: 'KanbanTimelogReport',
    component: KanbanTimelogReportView,
    props: true, // Automatically pass route params as props (e.g., kanbanId)
    meta: {
      requiresAuth: true,
      title: 'Kanban Timelog Report'
    }
  },
  {
    path: '/reports/user/:userId',
    name: 'UserTimelogReport',
    component: UserTimelogReportView,
    props: true, // Automatically pass route params as props (e.g., userId)
    meta: {
      requiresAuth: true,
      title: 'User Timelog Report'
    }
  }
  // Possible future route for selecting a Kanban to report on
  // {
  //   path: '/reports/kanban/select',
  //   name: 'SelectKanbanReport',
  //   component: () => import('@/views/Reports/SelectKanbanReportView.vue'), // Example of lazy loading
  //   meta: {
  //     requiresAuth: true,
  //     title: 'Select Kanban for Report'
  //   }
  // }
];

export default reportRoutes;
