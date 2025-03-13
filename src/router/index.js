import { createRouter, createWebHistory } from 'vue-router';
import login from '../pages/login/index.vue';
import main from '../pages/main/index.vue';

const routes = [
  // {
  //   path: '/',
  //   name: 'login',
  //   component: login,
  // },
  {
    path: '/',
    name: 'main',
    component: main,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;