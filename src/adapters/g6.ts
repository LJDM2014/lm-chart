/**
 * AntV G6 适配器：实现统一生命周期接口 mount / resize / destroy / update。
 * G6 5.x Spec 驱动：setOptions 增量合并配置，render 重新走「布局 + 绘制」管线；
 * render 是异步的，这里做串行化：渲染中的调用只记录待处理标记，完成后补一次。
 */
import { Graph } from '@antv/g6'
import type { GraphOptions } from '@antv/g6'

import type { ChartAdapter } from '@/adapters/types'
import { getChartTheme, withAlpha, type ChartTheme } from '@/adapters/chartTheme'
import type { ParamValues } from '@/types/params'
import { useThemeStore } from '@/stores/theme'

export type G6Spec = GraphOptions

/** G6 常用主题片段：标签 / 连线 / Combo 容器配色 */
export interface G6GraphTheme {
  /** 元素标签文字色 */
  labelFill: string
  /** 连线颜色 */
  edgeStroke: string
  /** Combo 容器填充 */
  comboFill: string
  /** Combo 容器描边 */
  comboStroke: string
}

export function g6GraphTheme(theme: ChartTheme): G6GraphTheme {
  return {
    labelFill: theme.text,
    edgeStroke: theme.isDark ? '#3a3f4d' : theme.axisLine,
    comboFill: withAlpha(theme.axisLine, 0.12),
    comboStroke: theme.splitLine,
  }
}

/**
 * 创建 G6 适配器。
 * @param buildSpec 根据主题与参数构建 G6 Spec 的工厂函数（来自图表的 config.ts）
 */
export function createG6Adapter(
  buildSpec: (theme: ChartTheme, params?: ParamValues) => G6Spec,
): ChartAdapter {
  let graph: Graph | null = null
  let unsubscribeTheme: (() => void) | null = null
  let params: ParamValues = {}
  let rendering = false
  let pendingRender = false

  const currentSpec = (): G6Spec => buildSpec(getChartTheme(useThemeStore().isDark), params)

  /**
   * 应用最新 Spec 并重绘（含重新布局）。
   * render 异步，串行化避免并发渲染竞态；setOptions 为浅合并，
   * 因此每次都传入完整 Spec（buildSpec 全量构建）。
   */
  const renderSpec = () => {
    if (!graph) return
    if (rendering) {
      pendingRender = true
      return
    }
    rendering = true
    graph.setOptions(currentSpec())
    void graph
      .render()
      .catch(() => {
        // 渲染失败不中断后续更新，finally 中恢复渲染状态
      })
      .finally(() => {
        rendering = false
        if (pendingRender) {
          pendingRender = false
          renderSpec()
        }
      })
  }

  return {
    mount(el) {
      graph = new Graph({ container: el, autoResize: true, ...currentSpec() })
      renderSpec()

      const themeStore = useThemeStore()
      unsubscribeTheme = themeStore.$subscribe(() => {
        renderSpec()
      })
    },
    resize() {
      graph?.resize()
    },
    /** 参数变化：应用最新 Spec 并重绘 */
    update(next) {
      params = { ...next }
      renderSpec()
    },
    destroy() {
      unsubscribeTheme?.()
      unsubscribeTheme = null
      graph?.destroy()
      graph = null
    },
  }
}
