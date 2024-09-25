import { createRouter, createWebHistory } from 'vue-router'
import NProgress from '@/plugins/nprogress'
import demoRoutes from "@/router/demoRoutes.js";
import authRoutes from "@/router/authRoutes.js";
import productRoutes from "@/router/productRoutes.js";
import toDoListRoutes from "@/router/toDoListRoutes.js";
import WelcomeView from '../views/WelcomeView.vue'
import HomeView from "@/views/HomeView.vue";
import AboutView from '@/views/AboutView.vue'
import HelloView from '@/views/HelloView.vue'
import NotFound from '@/views/NotFound.vue'
import TestView from '@/views/Demo/TestView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'welcome',
      meta: {
        title: 'Welcome',
        description: 'This is the home page'
      },
      component: WelcomeView
    },
    {
      path: '/home',
      name: 'home',
      meta: {
        title: 'Home',
        description: 'This is the home page'
      },
      component: HomeView
    },
    {
      path: '/hello/:name',
      name: 'hello',
      meta: {
        title: 'Hello',
        description: 'This is the hello page'
      },
      component: HelloView
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
    {
      path: '/test',
      name: 'test',
      meta: {
        title: 'Test',
        description: 'This is the test page'
      },
      component: TestView
    },
    ...demoRoutes,
    ...authRoutes,
    ...productRoutes,
    ...toDoListRoutes,
    {
      path: '/:pathMatch(.*)*', // Correspond à toutes les routes non définies
      name: 'NotFound',
      component: NotFound,
    }
  ]
})

router.beforeEach((to) => {
  const { title, description } = to.meta;
  const defaultTitle = 'Default Title';
  const defaultDescription = 'Default Description';

  document.title = title || defaultTitle

  const descriptionElement = document.querySelector('meta[name="description"]')

  descriptionElement.setAttribute('content', description || defaultDescription)
})

router.beforeEach((to, from) => {
  if (to.path !== from.path)
    NProgress.start()
})
router.afterEach(() => {
  NProgress.done()
})

export default router
