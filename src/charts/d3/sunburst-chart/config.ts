/**
 * 旭日图渲染配置：从主题推导颜色，其余为可调参数。
 * Chart.vue 读取该配置完成手写 D3 渲染；参数变化时全量重绘（层级深度会影响节点集合）。
 */
import type { ChartTheme } from '@/adapters/chartTheme'
import type { ControlDef, ParamValues } from '@/types/params'

/** 参数面板控件声明 */
export const controls: ControlDef[] = [
  { key: 'innerRatio', label: '内径比例', type: 'slider', min: 0.15, max: 0.45, step: 0.05, default: 0.3 },
  {
    key: 'maxDepth',
    label: '展示层级',
    type: 'select',
    default: '2',
    options: [
      { label: '一层（事业群）', value: '1' },
      { label: '两层（完整树）', value: '2' },
    ],
  },
  { key: 'cornerRadius', label: '弧段圆角', type: 'slider', min: 0, max: 10, step: 1, default: 4, unit: 'px' },
  { key: 'showLabel', label: '弧段标签', type: 'toggle', default: true },
]

export interface SunburstRenderConfig {
  /** 中心空心半径占外半径的比例 */
  innerRatio: number
  /** 最大展示层级深度（1 = 仅事业群，2 = 完整树） */
  maxDepth: number
  /** 弧段圆角半径 */
  cornerRadius: number
  showLabel: boolean
  /** 一级事业群配色（其后代继承父级色相，按深度降低不透明度） */
  palette: string[]
  /** 标签颜色 */
  labelFill: string
}

export function buildRenderConfig(theme: ChartTheme, params?: ParamValues): SunburstRenderConfig {
  return {
    innerRatio: typeof params?.innerRatio === 'number' ? params.innerRatio : 0.3,
    maxDepth: params?.maxDepth === '1' ? 1 : 2,
    cornerRadius: typeof params?.cornerRadius === 'number' ? params.cornerRadius : 4,
    showLabel: params?.showLabel !== false,
    palette: theme.palette,
    labelFill: theme.isDark ? '#e8eaf0' : '#ffffff',
  }
}
