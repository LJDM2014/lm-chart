/**
 * 打包气泡图渲染参数：D3 手写图表无 buildOption，
 * 由 buildRenderConfig 将主题与参数映射为渲染配置（同 d3-force-graph 约定）。
 */
import type { ChartTheme } from '@/adapters/chartTheme'
import { resolvePalette } from '@/adapters/chartTheme'
import type { ControlDef, ParamValues } from '@/types/params'

/** 参数面板控件声明 */
export const controls: ControlDef[] = [
  { key: 'padding', label: '气泡间距', type: 'slider', min: 2, max: 16, step: 1, default: 6, unit: 'px' },
  { key: 'showLabel', label: '气泡标签', type: 'toggle', default: true },
  { key: 'strokeWidth', label: '描边宽度', type: 'slider', min: 0, max: 4, step: 0.5, default: 1, unit: 'px' },
]

export interface PackedRenderConfig {
  padding: number
  showLabel: boolean
  strokeWidth: number
  /** 品类 → 颜色（与 data.ts 的 APP_GROUPS 顺序对齐） */
  groupColors: string[]
  labelFill: string
  titleFill: string
  circleFill: string
}

export function buildRenderConfig(theme: ChartTheme, params?: ParamValues): PackedRenderConfig {
  const palette = resolvePalette(params, theme)
  const padding = typeof params?.padding === 'number' ? params.padding : 6
  const showLabel = params?.showLabel !== false
  const strokeWidth = typeof params?.strokeWidth === 'number' ? params.strokeWidth : 1

  return {
    padding,
    showLabel,
    strokeWidth,
    groupColors: palette,
    labelFill: theme.text,
    titleFill: theme.textSecondary,
    circleFill: theme.surfaceAlt,
  }
}
