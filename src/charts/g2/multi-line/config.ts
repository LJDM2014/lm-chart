import type { G2Spec } from '@/adapters/g2'
import { g2AxisTheme, g2LegendTheme } from '@/adapters/g2'
import type { ChartTheme } from '@/adapters/chartTheme'
import { resolvePalette } from '@/adapters/chartTheme'
import type { ControlDef, ParamValues } from '@/types/params'
import { temps } from './data'

/** 参数面板控件声明（详情页右侧面板渲染；「配色方案」为全局通用控件，无需在此声明） */
export const controls: ControlDef[] = [
  { key: 'animation', label: '动画', type: 'toggle', default: true },
  { key: 'lineWidth', label: '线宽', type: 'slider', min: 1, max: 5, step: 0.5, default: 2.5, unit: 'px' },
  { key: 'smooth', label: '平滑曲线', type: 'toggle', default: false },
]

export function buildSpec(theme: ChartTheme, params?: ParamValues): G2Spec {
  const palette = resolvePalette(params, theme)
  const lineWidth = typeof params?.lineWidth === 'number' ? params.lineWidth : 2.5
  const smooth = params?.smooth === true

  return {
    type: 'line',
    data: temps,
    encode: { x: 'month', y: 'value', color: 'city', shape: smooth ? 'smooth' : 'linear' },
    scale: { color: { range: [palette[0], palette[2], palette[4]] } },
    style: { lineWidth },
    axis: {
      x: { ...g2AxisTheme(theme).x, title: '月份' },
      y: { ...g2AxisTheme(theme).y, title: '平均气温 (℃)' },
    },
    legend: g2LegendTheme(theme),
    tooltip: { items: [{ channel: 'y', valueFormatter: (v: number) => `${v} ℃` }] },
    animate: params?.animation !== false,
  } as unknown as G2Spec
}
