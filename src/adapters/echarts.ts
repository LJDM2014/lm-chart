/**
 * ECharts 适配器：实现统一生命周期接口 mount / resize / destroy / update。
 * - 按需注册 ECharts 组件（不全量引入）
 * - 主题变化与参数调节均走实例级 setOption（不销毁重建），resize 用 rAF 合帧防抖
 */
import { init, use } from 'echarts/core'
import type { EChartsOption } from 'echarts'
import {
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  EffectScatterChart,
  HeatmapChart,
  SankeyChart,
  GraphChart,
  PictorialBarChart,
  BoxplotChart,
  CandlestickChart,
  FunnelChart,
  RadarChart,
  GaugeChart,
  ParallelChart,
} from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  VisualMapComponent,
  DataZoomComponent,
  GraphicComponent,
  DatasetComponent,
  TransformComponent,
  MarkLineComponent,
  MarkPointComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { LabelLayout, UniversalTransition } from 'echarts/features'

import type { ChartAdapter } from '@/adapters/types'
import { getChartTheme, tooltipStyle, type ChartTheme } from '@/adapters/chartTheme'
import type { ParamValues } from '@/types/params'
import { useThemeStore } from '@/stores/theme'

// 按需注册：仅在 echarts chunk 首次加载时执行一次
use([
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  EffectScatterChart,
  HeatmapChart,
  SankeyChart,
  GraphChart,
  PictorialBarChart,
  BoxplotChart,
  CandlestickChart,
  FunnelChart,
  RadarChart,
  GaugeChart,
  ParallelChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  VisualMapComponent,
  DataZoomComponent,
  GraphicComponent,
  DatasetComponent,
  TransformComponent,
  MarkLineComponent,
  MarkPointComponent,
  CanvasRenderer,
  LabelLayout,
  UniversalTransition,
])

export type { EChartsOption }

type EChartsInstance = ReturnType<typeof init>

/** 主题相关的基础 option 片段，供各图表 config 复用 */
export function baseTooltip(theme: ChartTheme): Record<string, unknown> {
  return { trigger: 'item', ...tooltipStyle(theme) }
}

/**
 * 创建 ECharts 适配器。
 * @param buildOption 根据主题与参数构建完整 option 的工厂函数（来自图表的 config.ts）
 */
export function createEchartsAdapter(
  buildOption: (theme: ChartTheme, params?: ParamValues) => EChartsOption,
): ChartAdapter {
  let chart: EChartsInstance | null = null
  let resizeObserver: ResizeObserver | null = null
  let unsubscribeTheme: (() => void) | null = null
  let resizeRaf = 0
  let params: ParamValues = {}

  const currentOption = (): EChartsOption =>
    buildOption(getChartTheme(useThemeStore().isDark), params)

  return {
    mount(el) {
      chart = init(el)
      chart.setOption(currentOption())

      // 容器尺寸自适应（rAF 合帧，避免高频 resize 抖动）
      resizeObserver = new ResizeObserver(() => {
        if (resizeRaf) return
        resizeRaf = requestAnimationFrame(() => {
          resizeRaf = 0
          chart?.resize()
        })
      })
      resizeObserver.observe(el)

      // 主题变化时统一重绘（notMerge 全量替换，保证所有颜色项同步更新）
      const themeStore = useThemeStore()
      unsubscribeTheme = themeStore.$subscribe(() => {
        chart?.setOption(currentOption(), { notMerge: true })
      })
    },
    resize() {
      chart?.resize()
    },
    /** 参数变化：实例不销毁，setOption 刷新 */
    update(next) {
      params = { ...next }
      chart?.setOption(currentOption(), { notMerge: true })
    },
    destroy() {
      if (resizeRaf) {
        cancelAnimationFrame(resizeRaf)
        resizeRaf = 0
      }
      unsubscribeTheme?.()
      unsubscribeTheme = null
      resizeObserver?.disconnect()
      resizeObserver = null
      chart?.dispose()
      chart = null
    },
  }
}
