import { createRouter, createWebHistory } from 'vue-router'
import LoginPage from '../pages/LoginPage.vue'
import MainPage from '../pages/MainPage.vue'
import TicketDetails from '../pages/TicketDetails.vue'

const routes = [
  { path: '/', component: LoginPage },
  { path: '/projects', component: MainPage }, // Assuming MainPage handles projects/issues
  { path: '/ticket/:id', component: TicketDetails }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('jiraAuth')

  if (to.path === '/' && isAuthenticated) {
    next('/projects')
  } else if (to.path !== '/' && !isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router
