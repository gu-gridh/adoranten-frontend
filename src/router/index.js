import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Issue from '../views/Issue.vue'
import Search from '../views/Search.vue'
import About from '../views/About.vue'
import Accessibility from '../views/Accessibility.vue'
import Submit from '../views/Submit.vue'

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
  },
  {
    path: '/search',
    name: 'Search',
    component: Search
  },
  {
    path: '/about',
    name: 'About',
    component: About
  },
  {
    path: '/accessibility',
    name: 'accessibility',
    component: Accessibility
  },
  {
    path: '/submit',
    name: 'Submit',
    component: Submit
  }
]

const router = createRouter({
  history: createWebHistory('/adoranten/'),
  routes
})

export default router
