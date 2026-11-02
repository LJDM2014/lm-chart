import type { G2Spec } from '@/adapters/g2'
import { g2AxisTheme, g2LegendTheme } from '@/adapters/g2'
import type { ChartTheme } from '@/adapters/chartTheme'
import { resolvePalette } from '@/adapters/chartTheme'
import type { ControlDef, ParamValues } from '@/types/params'
import { retailSales } from './data'

/** 参数面板控件声明（「配色方案」为全局通用控件，无需在此声明） */
export const controls: ControlDef[] = [
  {
    key: 'facetField',
    label: '分面维度',
    type: 'select',
    default: 'category',
    options: [
      { label: '按品类分面', value: 'category' },
      { label: '按区域分面', value: 'region' },
    ],
  },
  { key: 'barGap', label: '柱间距', type: 'slider', min: 0, max: 0.6, step: 0.05, default: 0.15 },
  { key: 'animation', label: '动画', type: 'toggle', default: true },
]

export function buildSpec(theme: ChartTheme, params?: ParamValues): G2Spec {
  const palette = resolvePalette(params, theme)
  const facetField = params?.facetField === 'region' ? 'region' : 'category'
  const barGap = typeof params?.barGap === 'number' ? params.barGap : 0.15
  const axisTheme = g2AxisTheme(theme)

  return {
    type: 'facetRect',
    data: retailSales,
    encode: { y: facetField },
    paddingInner: barGap,
    children: [
      {
        type: 'interval',
        encode: { x: 'month', y: 'sales', color: facetField },
        transform: [{ type: 'dodgeX' }],
        axis: {
          x: { ...axisTheme.x, labelAutoHide: true },
          y: { ...axisTheme.y, title: '销售额 (万元)' },
        },
        style: { radiusTop: 3 },
      },
    ],
    scale: { color: { range: palette.slice(0, 3) } },
    legend: g2LegendTheme(theme),
    tooltip: {
      items: [{ channel: 'y', valueFormatter: (v: number) => `${v} 万元` }],
    },
    animate: params?.animation !== false,
  } as unknown as G2Spec
}
