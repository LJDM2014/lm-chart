/**
 * Chart.js 适配器：实现统一生命周期接口 mount / resize / destroy / update。
 * 主题切换与参数调节均按官方推荐方式（替换 data + 合并 options 后 update()）增量刷新，
 * 实例不销毁重建。
 */
import Chart from 'chart.js/auto'

import type { ChartAdapter } from '@/adapters/types'
import type { ChartConfiguration } from 'chart.js'
import { getChartTheme, type ChartTheme } from '@/adapters/chartTheme'
import type { ParamValues } from '@/types/params'
import { useThemeStore } from '@/stores/theme'

export type { ChartConfiguration }

/**
 * 创建 Chart.js 适配器。
 * @param buildConfig 根据主题与参数构建 ChartConfiguration 的工厂函数（来自图表的 config.ts）
 */
export function createChartJsAdapter(
  buildConfig: (theme: ChartTheme, params?: ParamValues) => ChartConfiguration,
): ChartAdapter {
  let chart: Chart | null = null
  let canvas: HTMLCanvasElement | null = null
  let unsubscribeTheme: (() => void) | null = null
  let params: ParamValues = {}

  /** 官方推荐的更新方式：替换 data、合并顶层 options 后 update() */
  function applyConfig() {
    if (!chart) return
    const next = buildConfig(getChartTheme(useThemeStore().isDark), params)
    chart.data = next.data
    if (next.options) {
      Object.assign(chart.options as unknown as Record<string, unknown>, next.options)
    }
    chart.update()
  }

  return {
    mount(el) {
      canvas = document.createElement('canvas')
      el.appendChild(canvas)

      chart = new Chart(canvas, buildConfig(getChartTheme(useThemeStore().isDark), params))

      const themeStore = useThemeStore()
      unsubscribeTheme = themeStore.$subscribe(applyConfig)
    },
    resize() {
      // Chart.js 响应式配置下自动跟随容器尺寸，此处兜底强制 resize
      chart?.resize()
    },
    /** 参数变化：合并配置后 update()，实例不销毁 */
    update(next) {
      params = { ...next }
      applyConfig()
    },
    destroy() {
      unsubscribeTheme?.()
      unsubscribeTheme = null
      chart?.destroy()
      chart = null
      canvas?.remove()
      canvas = null
    },
  }
}
