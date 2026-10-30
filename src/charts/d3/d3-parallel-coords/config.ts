/**
 * D3 平行坐标图渲染配置：从主题推导颜色，其余为布局与线条参数。
 * Chart.vue 读取该配置完成手写 D3 渲染。
 */
import type { ChartTheme } from '@/adapters/chartTheme'
import type { ControlDef, ParamValues } from '@/types/params'

/** 参数面板控件 */
export const controls: ControlDef[] = [
  { key: 'lineWidth', label: '线条宽度', type: 'slider', min: 1, max: 5, step: 0.5, default: 2, unit: 'px' },
  { key: 'lineOpacity', label: '线条透明度', type: 'slider', min: 0.2, max: 1, step: 0.05, default: 0.75 },
  { key: 'showName', label: '语言名称标签', type: 'toggle', default: true },
]

export interface ParallelCoordsRenderConfig {
  margin: { top: number; right: number; bottom: number; left: number }
  /** 数值轴刻度数量 */
  axisTickCount: number
  lineWidth: number
  lineOpacity: number
  /** 悬停时高亮线宽 */
  hoverLineWidth: number
  /** 维度标题颜色 */
  dimLabelFill: string
  /** 刻度数字颜色 */
  tickLabelFill: string
  tickFontSize: number
  /** 右侧语言名称标签 */
  nameLabelFill: string
  nameFontSize: number
  showName: boolean
}

export function buildRenderConfig(theme: ChartTheme, params?: ParamValues): ParallelCoordsRenderConfig {
  return {
    margin: { top: 28, right: 60, bottom: 34, left: 40 },
    axisTickCount: 5,
    lineWidth: typeof params?.lineWidth === 'number' ? params.lineWidth : 2,
    lineOpacity: typeof params?.lineOpacity === 'number' ? params.lineOpacity : 0.75,
    hoverLineWidth: 3,
    dimLabelFill: theme.textSecondary,
    tickLabelFill: theme.textTertiary,
    tickFontSize: 10,
    nameLabelFill: theme.textSecondary,
    nameFontSize: 11,
    showName: params?.showName !== false,
  }
}
