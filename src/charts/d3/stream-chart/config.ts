/**
 * 河流图渲染配置：从主题推导颜色，其余为可调参数。
 * Chart.vue 读取该配置完成手写 D3 渲染；曲线/偏移/透明度变化只更新已有 path 的几何属性。
 */
import type { ChartTheme } from '@/adapters/chartTheme'
import type { ControlDef, ParamValues } from '@/types/params'

/** 参数面板控件声明 */
export const controls: ControlDef[] = [
  {
    key: 'curveType',
    label: '曲线样式',
    type: 'select',
    default: 'basis',
    options: [
      { label: '平滑曲线', value: 'basis' },
      { label: '单调折线', value: 'monotone' },
      { label: '阶梯', value: 'step' },
    ],
  },
  {
    key: 'offsetMode',
    label: '布局方式',
    type: 'select',
    default: 'silhouette',
    options: [
      { label: '河流（中轴对称）', value: 'silhouette' },
      { label: '层叠（基线归零）', value: 'none' },
    ],
  },
  { key: 'areaOpacity', label: '填充透明度', type: 'slider', min: 0.5, max: 1, step: 0.05, default: 0.85 },
  { key: 'showLabel', label: '能源标签', type: 'toggle', default: true },
]

export type StreamCurveType = 'basis' | 'monotone' | 'step'
export type StreamOffsetMode = 'silhouette' | 'none'

export interface StreamRenderConfig {
  curveType: StreamCurveType
  offsetMode: StreamOffsetMode
  areaOpacity: number
  showLabel: boolean
  /** 各能源系列填充色 */
  seriesFill: string[]
  /** 标签 / 坐标轴文字颜色 */
  labelFill: string
  /** 轴线 / 网格颜色 */
  axisStroke: string
  /** 描边色（与背景色一致，制造流带间隔感） */
  strokeColor: string
}

export function buildRenderConfig(theme: ChartTheme, params?: ParamValues): StreamRenderConfig {
  const curve = params?.curveType
  const offset = params?.offsetMode
  return {
    curveType: curve === 'monotone' || curve === 'step' ? curve : 'basis',
    offsetMode: offset === 'none' ? 'none' : 'silhouette',
    areaOpacity: typeof params?.areaOpacity === 'number' ? params.areaOpacity : 0.85,
    showLabel: params?.showLabel !== false,
    seriesFill: theme.palette,
    labelFill: theme.textSecondary,
    axisStroke: theme.splitLine,
    strokeColor: theme.surface,
  }
}
