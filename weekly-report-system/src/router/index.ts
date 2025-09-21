import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../components/Layout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: Layout,
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('../views/HomeView.vue'),
          meta: { title: '首页仪表盘' }
        },
        {
          path: 'report-form',
          name: 'report-form',
          component: () => import('../views/ReportFormView.vue'),
          meta: { title: '填报周报' }
        },
        {
          path: 'report-list',
          name: 'report-list',
          component: () => import('../views/ReportListView.vue'),
          meta: { title: '历史周报' }
        }
      ]
    },
    {
      path: '/test-store',
      name: 'test-store',
      component: () => import('../views/TestStore.vue'),
    },
  ],
})

export default router
