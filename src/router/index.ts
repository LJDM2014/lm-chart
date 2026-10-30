import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/layouts/MainLayout.vue'),
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/views/HomePage.vue'),
        },
        {
          path: 'gallery',
          name: 'gallery',
          component: () => import('@/views/GalleryPage.vue'),
        },
        {
          path: 'chart/:lib/:id',
          name: 'chart-detail',
          component: () => import('@/views/ChartDetailPage.vue'),
        },
        // 404 兜底：未匹配的路径统一落到 NotFoundPage
        {
          path: '/:pathMatch(.*)*',
          name: 'not-found',
          component: () => import('@/views/NotFoundPage.vue'),
        },
      ],
    },
  ],
  // 切换路由时滚动置顶
  scrollBehavior: () => ({ top: 0 }),
})

export default router
