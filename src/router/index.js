import { createRouter, createWebHistory } from 'vue-router'
import main from '../pages/main/index.vue'
import test from '../pages/main/test.vue'
const routes = [
  {
    path: '/',
    name: 'main',
    component: main
  },
  {
    path: '/test',
    name: 'test',
    component: test
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
