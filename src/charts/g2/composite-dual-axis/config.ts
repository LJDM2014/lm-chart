import type { G2Spec } from '@/adapters/g2'
import { g2AxisTheme, g2LegendTheme } from '@/adapters/g2'
import type { ChartTheme } from '@/adapters/chartTheme'
import { resolvePalette } from '@/adapters/chartTheme'
import type { ControlDef, ParamValues } from '@/types/params'
import { monthlyGrowth, monthlySales } from './data'

/** 参数面板控件声明（「配色方案」为全局通用控件，无需在此声明） */
export const controls: ControlDef[] = [
  { key: 'showGrowth', label: '显示增长率曲线', type: 'toggle', default: true },
  { key: 'barRadius', label: '柱圆角', type: 'slider', min: 0, max: 12, step: 1, default: 4, unit: 'px' },
  { key: 'animation', label: '动画', type: 'toggle', default: true },
]

export function buildSpec(theme: ChartTheme, params?: ParamValues): G2Spec {
  const palette = resolvePalette(params, theme)
  const showGrowth = params?.showGrowth !== false
  const barRadius = typeof params?.barRadius === 'number' ? params.barRadius : 4
  const animate = params?.animation !== false
  const axisTheme = g2AxisTheme(theme)

  const barMark = {
    type: 'interval',
    data: monthlySales,
    encode: { x: 'month', y: 'gmv' },
    style: { fill: palette[0], radiusTop: barRadius },
    axis: {
      x: { ...axisTheme.x, title: '月份' },
      y: { ...axisTheme.y, title: '销售额 (万元)' },
    },
    animate,
  }

  const growthMark = {
    type: 'line',
    data: monthlyGrowth,
    encode: { x: 'month', y: 'growth' },
    // independent: 独立 y 标度，不受主轴影响；position: right 放在右轴
    scale: { y: { independent: true, zero: true } },
    style: { stroke: palette[3], lineWidth: 2.5 },
    axis: {
      y: { ...axisTheme.y, position: 'right', title: '同比增长率 (%)', grid: null },
    },
    animate,
  }

  return {
    type: 'view',
    children: showGrowth ? [barMark, growthMark] : [barMark],
    legend: g2LegendTheme(theme),
    tooltip: {
      items: [
        { channel: 'y', valueFormatter: (v: number) => `${v} 万元` },
        { color: palette[3], name: '同比增长率', valueFormatter: (v: number) => `${v}%` },
      ],
    },
    animate,
  } as unknown as G2Spec
}
