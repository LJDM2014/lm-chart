import type { G2Spec } from '@/adapters/g2'
import { g2AxisTheme, g2LegendTheme } from '@/adapters/g2'
import type { ChartTheme } from '@/adapters/chartTheme'
import { resolvePalette } from '@/adapters/chartTheme'
import type { ControlDef, ParamValues } from '@/types/params'
import { genreStreams } from './data'

/** 参数面板控件声明（「配色方案」为全局通用控件，无需在此声明） */
export const controls: ControlDef[] = [
  {
    key: 'layout',
    label: '河流布局',
    type: 'select',
    default: 'stream',
    options: [
      { label: '中心对称流', value: 'stream' },
      { label: '堆叠基线', value: 'stack' },
    ],
  },
  { key: 'smooth', label: '平滑曲线', type: 'toggle', default: true },
  { key: 'animation', label: '动画', type: 'toggle', default: true },
]

export function buildSpec(theme: ChartTheme, params?: ParamValues): G2Spec {
  const palette = resolvePalette(params, theme)
  const stream = params?.layout !== 'stack'
  const smooth = params?.smooth !== false
  const axisTheme = g2AxisTheme(theme)

  return {
    type: 'area',
    data: genreStreams,
    encode: { x: 'year', y: 'value', color: 'genre' },
    // stackY 沿 y 堆叠，symmetryY 将堆叠结果上下对称 —— 两者组合即河流图
    transform: stream ? [{ type: 'stackY' }, { type: 'symmetryY' }] : [{ type: 'stackY' }],
    shape: smooth ? 'smooth' : 'hvh',
    style: { fillOpacity: 0.88 },
    scale: { color: { range: palette.slice(0, 5) } },
    axis: {
      x: { ...axisTheme.x, title: '年份' },
      y: stream ? false : { ...axisTheme.y, title: '唱片销量 (万张)' },
    },
    legend: g2LegendTheme(theme),
    tooltip: { items: [{ channel: 'y', valueFormatter: (v: number) => `${v} 万张` }] },
    animate: params?.animation !== false,
  } as unknown as G2Spec
}
