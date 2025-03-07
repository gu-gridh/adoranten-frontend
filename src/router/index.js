import { createRouter, createWebHistory } from 'vue-router'
import Home from '../components/Home.vue'
import Issue from '../components/Issue.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/issues/:id',
    name: 'Issue',
    component: Issue,
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
