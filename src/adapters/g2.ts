/**
 * AntV G2 适配器：实现统一生命周期接口 mount / resize / destroy / update。
 * G2 5.x 声明式 Spec，重新应用 options 即自动增量重绘。
 */
import { Chart } from '@antv/g2'
import type { G2Spec } from '@antv/g2'

import type { ChartAdapter } from '@/adapters/types'
import { getChartTheme, type ChartTheme } from '@/adapters/chartTheme'
import type { ParamValues } from '@/types/params'
import { useThemeStore } from '@/stores/theme'

export type { G2Spec }

export interface G2AxisTheme {
  x: Record<string, unknown>
  y: Record<string, unknown>
}

/** G2 常用主题相关片段：轴 + 图例配色 */
export function g2AxisTheme(theme: ChartTheme): G2AxisTheme {
  return {
    x: {
      labelFill: theme.textSecondary,
      titleFill: theme.textSecondary,
      lineStroke: theme.axisLine,
      gridStroke: theme.splitLine,
    },
    y: {
      labelFill: theme.textSecondary,
      titleFill: theme.textSecondary,
      lineStroke: false,
      gridStroke: theme.splitLine,
    },
  }
}

export function g2LegendTheme(theme: ChartTheme): Record<string, unknown> {
  return { color: { itemLabelFill: theme.textSecondary } }
}

/**
 * 创建 G2 适配器。
 * @param buildSpec 根据主题与参数构建 G2 Spec 的工厂函数（来自图表的 config.ts）
 */
export function createG2Adapter(
  buildSpec: (theme: ChartTheme, params?: ParamValues) => G2Spec,
): ChartAdapter {
  let chart: Chart | null = null
  let unsubscribeTheme: (() => void) | null = null
  let params: ParamValues = {}

  const currentSpec = (): G2Spec => buildSpec(getChartTheme(useThemeStore().isDark), params)

  return {
    mount(el) {
      chart = new Chart({ container: el, autoFit: true })
      chart.options(currentSpec())
      void chart.render()

      const themeStore = useThemeStore()
      unsubscribeTheme = themeStore.$subscribe(() => {
        // G2 5 更新 options 会自动重绘
        chart?.options(currentSpec())
      })
    },
    resize() {
      chart?.forceFit()
    },
    /** 参数变化：更新 options，G2 自动增量重绘 */
    update(next) {
      params = { ...next }
      chart?.options(currentSpec())
    },
    destroy() {
      unsubscribeTheme?.()
      unsubscribeTheme = null
      chart?.destroy()
      chart = null
    },
  }
}
