import type { G2Spec } from '@/adapters/g2'
import type { ChartTheme } from '@/adapters/chartTheme'
import type { ControlDef, ParamValues } from '@/types/params'
import { stages } from './data'

/** 参数面板控件声明（详情页右侧面板渲染；「配色方案」为全局通用控件，无需在此声明） */
export const controls: ControlDef[] = [
  { key: 'animation', label: '动画', type: 'toggle', default: true },
  { key: 'gap', label: '漏斗间距', type: 'slider', min: 0, max: 0.5, step: 0.05, default: 0 },
  { key: 'showLabel', label: '显示标签', type: 'toggle', default: true },
]

export function buildSpec(theme: ChartTheme, params?: ParamValues): G2Spec {
  const gap = typeof params?.gap === 'number' ? params.gap : 0
  const showLabel = params?.showLabel !== false

  return {
    type: 'interval',
    data: stages,
    coordinate: { transform: [{ type: 'transpose' }] },
    transform: [{ type: 'symmetryY' }],
    encode: { x: 'stage', y: 'value', color: 'stage', shape: 'funnel' },
    scale: { x: { padding: gap } },
    axis: false,
    style: { stroke: theme.surface, strokeWidth: 1.5 },
    labels: showLabel
      ? [
          {
            text: (d: { stage: string; value: number }) => `${d.stage} ${d.value}%`,
            position: 'inside',
            fill: '#ffffff',
            fontSize: 12,
            fontWeight: 500,
          },
        ]
      : [],
    animate: params?.animation === false ? false : { enter: { type: 'fadeIn' } },
  } as unknown as G2Spec
}
