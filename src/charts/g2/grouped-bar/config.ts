import type { G2Spec } from '@/adapters/g2'
import { g2AxisTheme, g2LegendTheme } from '@/adapters/g2'
import type { ChartTheme } from '@/adapters/chartTheme'
import { resolvePalette } from '@/adapters/chartTheme'
import type { ControlDef, ParamValues } from '@/types/params'
import { sales } from './data'

/** 参数面板控件声明（详情页右侧面板渲染；「配色方案」为全局通用控件，无需在此声明） */
export const controls: ControlDef[] = [
  { key: 'animation', label: '动画', type: 'toggle', default: true },
  { key: 'barGap', label: '柱间距', type: 'slider', min: 0.05, max: 0.8, step: 0.05, default: 0.1 },
]

export function buildSpec(theme: ChartTheme, params?: ParamValues): G2Spec {
  const palette = resolvePalette(params, theme)
  const barGap = typeof params?.barGap === 'number' ? params.barGap : 0.1

  return {
    type: 'interval',
    data: sales,
    encode: { x: 'quarter', y: 'value', color: 'product' },
    // dodgeX 的 padding 会写入 series 通道的 paddingInner，控制同组柱子间距
    transform: [{ type: 'dodgeX', padding: barGap }],
    scale: { color: { range: [palette[0], palette[1], palette[2]] } },
    axis: {
      x: { ...g2AxisTheme(theme).x, title: '季度' },
      y: { ...g2AxisTheme(theme).y, title: '销量' },
    },
    legend: g2LegendTheme(theme),
    tooltip: { items: [{ channel: 'y', valueFormatter: (v: number) => `${v} 件` }] },
    style: { maxWidth: 28, radiusTopLeft: 4, radiusTopRight: 4 },
    animate: params?.animation === false ? false : { enter: { type: 'growInY' } },
  } as unknown as G2Spec
}
