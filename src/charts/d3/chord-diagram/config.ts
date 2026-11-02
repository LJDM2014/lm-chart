/**
 * 弦图渲染配置：从主题推导颜色，其余为可调参数。
 * Chart.vue 读取该配置完成手写 D3 渲染；参数变化时增量更新属性，不重建 DOM。
 */
import type { ChartTheme } from '@/adapters/chartTheme'
import type { ControlDef, ParamValues } from '@/types/params'

/** 参数面板控件声明（「配色方案」为全局通用控件） */
export const controls: ControlDef[] = [
  { key: 'padAngle', label: '弧段间隙', type: 'slider', min: 0.01, max: 0.1, step: 0.01, default: 0.03, unit: 'rad' },
  { key: 'chordOpacity', label: '弦透明度', type: 'slider', min: 0.15, max: 0.9, step: 0.05, default: 0.55 },
  {
    key: 'sortMode',
    label: '弧段排序',
    type: 'select',
    default: 'flow',
    options: [
      { label: '按流量降序', value: 'flow' },
      { label: '按原始顺序', value: 'none' },
    ],
  },
  { key: 'showLabel', label: '地区标签', type: 'toggle', default: true },
]

export interface ChordRenderConfig {
  /** 弧段之间的间隙角（弧度） */
  padAngle: number
  /** 弦填充透明度 */
  chordOpacity: number
  /** 排序模式：flow = 按总流量降序，none = 保持数据顺序 */
  sortMode: 'flow' | 'none'
  showLabel: boolean
  /** 地区标签颜色 */
  labelFill: string
  /** 弦描边色 */
  chordStroke: string
  /** 弧段底色（surface，弦从弧段引出） */
  groupFill: string[]
}

export function buildRenderConfig(theme: ChartTheme, params?: ParamValues): ChordRenderConfig {
  const rawPad = typeof params?.padAngle === 'number' ? params.padAngle : 0.03
  return {
    padAngle: Math.min(Math.max(rawPad, 0.005), 0.15),
    chordOpacity: typeof params?.chordOpacity === 'number' ? params.chordOpacity : 0.55,
    sortMode: params?.sortMode === 'none' ? 'none' : 'flow',
    showLabel: params?.showLabel !== false,
    labelFill: theme.textSecondary,
    chordStroke: theme.isDark ? '#12141a' : '#ffffff',
    groupFill: theme.palette,
  }
}
