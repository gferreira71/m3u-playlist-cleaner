import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('../views/CleanerView.vue')
    }, {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    }
  ]
})

export default router
