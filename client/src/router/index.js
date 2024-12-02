import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import NProgress from '@/plugins/nprogress';
import authRoutes from "@/router/authRoutes.js";
import toDoListRoutes from "@/router/toDoListRoutes.js";
import adminRoutes from "@/router/adminRoutes.js";
import kanbanRoutes from "@/router/kanbanRoutes.js";
import AboutView from '@/views/AboutView.vue';
import NotFound from '@/views/NotFound.vue';
import Forbidden from "@/views/Forbidden.vue";
import ToDoListOverView from "@/views/ToDoList/ToDoListOverView.vue";
import AccessDeniedView from "@/views/AccessDeniedView.vue";


const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'TodoSummary',
      meta: {
        title: 'Mes Todos',
        description: 'Sommaire des ToDos'
      },
      component: ToDoListOverView
    },
    {
      path: '/',
      name: 'home',
      meta: {
        title: 'Mes Todos',
        description: 'Sommaire des ToDos'
      },
      component: ToDoListOverView
    },
    {
      path: '/about',
      name: 'about',
      meta: {
        title: 'About',
        description: 'This is the about page'
      },
      component: AboutView
    },
    ...authRoutes,
    ...toDoListRoutes,
    ...kanbanRoutes,
    ...adminRoutes,
    {
      path: '/404',
      name: '404NotFound',
      component: NotFound,
    },
    {
      path: '/403',
      name: '403Forbidden',
      component: Forbidden,
    },
    {
      path: '/denied',
      name: 'accessDenied',
      component: AccessDeniedView,
    },
    {
      path: '/:pathMatch(.*)*', // Correspond à toutes les routes non définies
      name: 'NotFound',
      component: NotFound,
    }
  ]
})

router.beforeEach((to, from, next) => {
  const { title, description } = to.meta;
  const defaultTitle = 'Default Title';
  const defaultDescription = 'Default Description';
  const authStore = useAuthStore();

  document.title = title || defaultTitle

  const descriptionElement = document.querySelector('meta[name="description"]')

  descriptionElement.setAttribute('content', description || defaultDescription)

  console.log('to.meta.requiresAuth', to.meta.requiresAuth)

  if (to.meta.requiresAuth) {
    console.log('authStore.isAuthenticated', authStore.isAuthenticated)
    if (!authStore.isAuthenticated) {
      console.log('ici', to.name)
      // Si l'utilisateur n'est pas connecté
      return next({ name: 'signin' });
    }
    if (to.meta.role && !authStore.user.roles.includes(to.meta.role)) {
      console.log('ici2', to.name)
      // Si l'utilisateur n'a pas le rôle requis
      return next({ name: 'accessDenied' }); // Redirigez vers une page appropriée
    }
  }
  next();
})

router.beforeEach((to, from) => {
  if (to.path !== from.path)
    NProgress.start()
})
router.afterEach(() => {
  NProgress.done()
})

export default router
