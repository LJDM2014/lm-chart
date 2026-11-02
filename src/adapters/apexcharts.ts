/**
 * ApexCharts 适配器：实现统一生命周期接口 mount / resize / destroy / update。
 * config 可携带 setup 回调（如动态刷新定时器），返回的清理函数在销毁时执行。
 * 主题切换与参数调节走 updateOptions 增量更新。
 */
import ApexCharts from 'apexcharts'
import type { ApexOptions } from 'apexcharts'

import type { ChartAdapter } from '@/adapters/types'
import { getChartTheme, type ChartTheme } from '@/adapters/chartTheme'
import type { ParamValues } from '@/types/params'
import { useThemeStore } from '@/stores/theme'

export type { ApexOptions }

export interface ApexChartConfig {
  options: ApexOptions
  /** 挂载后启动的自定义行为（如动态刷新），返回清理函数在 destroy 时调用 */
  setup?: (chart: ApexCharts) => void | (() => void)
}

/**
 * 注入全局默认项：
 * - height '100%'：跟随容器高度。Apex 默认 'auto' 会按视口剩余空间估高，
 *   在详情页固定高度预览面板中会溢出遮挡下方内容。
 * - parentHeightOffset 0：消除对父容器高度的额外偏移。
 * 图表自身显式设置的 chart.* 优先。
 */
function withDefaults(config: ApexChartConfig): ApexOptions {
  const base: ApexOptions = { chart: { height: '100%', parentHeightOffset: 0 } }
  return {
    ...base,
    ...config.options,
    chart: { ...base.chart, ...config.options.chart },
  }
}

/**
 * 创建 ApexCharts 适配器。
 * @param buildConfig 根据主题与参数构建 ApexChartConfig 的工厂函数（来自图表的 config.ts）
 */
export function createApexAdapter(
  buildConfig: (theme: ChartTheme, params?: ParamValues) => ApexChartConfig,
): ChartAdapter {
  let chart: ApexCharts | null = null
  let cleanup: (() => void) | null = null
  let unsubscribeTheme: (() => void) | null = null
  let params: ParamValues = {}

  return {
    mount(el) {
      const theme = getChartTheme(useThemeStore().isDark)
      const config = buildConfig(theme, params)
      chart = new ApexCharts(el, withDefaults(config))
      void chart.render()

      if (config.setup) {
        const result = config.setup(chart)
        cleanup = typeof result === 'function' ? result : null
      }

      const themeStore = useThemeStore()
      unsubscribeTheme = themeStore.$subscribe(() => {
        chart?.updateOptions(
          withDefaults(buildConfig(getChartTheme(themeStore.isDark), params)),
          false,
          true,
        )
      })
    },
    resize() {
      // ApexCharts 内置 ResizeObserver 跟随容器尺寸，无需手动触发
    },
    /** 参数变化：updateOptions 增量更新，实例不销毁 */
    update(next) {
      params = { ...next }
      chart?.updateOptions(
        withDefaults(buildConfig(getChartTheme(useThemeStore().isDark), params)),
        false,
        true,
      )
    },
    destroy() {
      unsubscribeTheme?.()
      unsubscribeTheme = null
      cleanup?.()
      cleanup = null
      chart?.destroy()
      chart = null
    },
  }
}
