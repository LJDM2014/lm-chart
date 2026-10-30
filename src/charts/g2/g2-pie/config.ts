import type { G2Spec } from '@/adapters/g2'
import { g2LegendTheme } from '@/adapters/g2'
import type { ChartTheme } from '@/adapters/chartTheme'
import { resolvePalette } from '@/adapters/chartTheme'
import type { ControlDef, ParamValues } from '@/types/params'
import { channels } from './data'

/** 参数面板控件声明（详情页右侧面板渲染；「配色方案」为全局通用控件，无需在此声明） */
export const controls: ControlDef[] = [
  { key: 'animation', label: '动画', type: 'toggle', default: true },
  { key: 'innerRadius', label: '内半径', type: 'slider', min: 0, max: 0.7, step: 0.05, default: 0.58 },
  { key: 'showLabel', label: '显示标签', type: 'toggle', default: true },
]

export function buildSpec(theme: ChartTheme, params?: ParamValues): G2Spec {
  const palette = resolvePalette(params, theme)
  const innerRadius = typeof params?.innerRadius === 'number' ? params.innerRadius : 0.58
  const showLabel = params?.showLabel !== false

  return {
    type: 'interval',
    data: channels,
    coordinate: { type: 'theta', innerRadius },
    transform: [{ type: 'stackY' }],
    encode: { y: 'value', color: 'channel' },
    scale: {
      color: { range: [palette[0], palette[1], palette[2], palette[5], palette[6]] },
    },
    legend: g2LegendTheme(theme),
    labels: showLabel
      ? [
          {
            text: (d: { channel: string; value: number }) => `${d.channel} ${d.value}%`,
            position: 'outside',
            fill: theme.textSecondary,
            fontSize: 11,
          },
        ]
      : [],
    tooltip: { items: [{ channel: 'y', valueFormatter: (v: number) => `${v}%` }] },
    style: { stroke: theme.surface, strokeWidth: 2 },
    animate: params?.animation !== false,
  } as unknown as G2Spec
}
