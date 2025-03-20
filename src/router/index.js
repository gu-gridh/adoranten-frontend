import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Issue from '../views/Issue.vue'
import Search from '../views/Search.vue'

const routes = [
  {
    path: '/adoranten/',
    name: 'Home',
    component: Home
  },
  {
    path: '/adoranten/issues/:id',
    name: 'Issue',
    component: Issue,
    props: true
  },
  {
    path: '/adoranten/search',
    name: 'Search',
    component: Search
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
