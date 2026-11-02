import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

/**
 * manualChunks：把大体积依赖显式拆分为稳定 chunk。
 * - 图表库（echarts/g2/chartjs/apexcharts/d3）各自独立分包，只在进入对应详情页时按需加载；
 * - vue 全家桶独立分包，利于长缓存；
 * - 注意：shiki 不在此声明——其语言 grammar 依靠内部动态 import 天然按语言分包，
 *   若合并为单一 chunk 会导致每次源码高亮都拉取全量语言（约 10MB）。
 */
function manualChunks(id: string): string | undefined {
  if (!id.includes('node_modules')) return undefined
  // echarts-gl 体积大且仅 3D 图表使用，独立分包（须在通用 echarts 规则之前匹配）
  if (/[\\/]node_modules[\\/](echarts-gl|claygl|gl-matrix)[\\/]/.test(id)) return 'echarts-gl'
  if (/[\\/]node_modules[\\/](echarts|zrender|echarts-liquidfill|echarts-wordcloud)[\\/]/.test(id)) {
    return 'echarts'
  }
  // G6 及其专属布局引擎独立分包（须在通用 @antv 规则之前匹配）
  if (/[\\/]node_modules[\\/](@antv[\\/](g6|layout|hierarchy))[\\/]/.test(id)) return 'g6'
  if (id.includes('@antv')) return 'g2'
  if (/[\\/]node_modules[\\/](chart\.js|@kurkle[\\/]color)[\\/]/.test(id)) return 'chartjs'
  if (id.includes('apexcharts')) return 'apexcharts'
  if (/[\\/]node_modules[\\/]d3-/.test(id) || /[\\/]node_modules[\\/]internmap[\\/]/.test(id)) {
    return 'd3'
  }
  if (/[\\/]node_modules[\\/](vue|vue-router|pinia|@vue)[\\/]/.test(id)) return 'vendor'
  return undefined
}

// https://vite.dev/config/
export default defineConfig({
  // 相对 base：GitHub Pages 子路径与本地 preview 均可直接工作
  base: './',
  server: {
    port: 3000,
  },
  preview: {
    port: 3000,
  },
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  esbuild: {
    // 生产环境移除 console / debugger
    drop: ['console', 'debugger'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks,
      },
    },
  },
})
