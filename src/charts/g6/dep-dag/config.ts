/**
 * G6 依赖关系图 Spec 构建：dagre 自上而下层次布局，
 * 圆形节点按 tier 用色板着色、可选按扇入（被依赖数）缩放，带箭头连线。
 */
import { g6GraphTheme, type G6Spec } from '@/adapters/g6'
import type { ChartTheme } from '@/adapters/chartTheme'
import { resolvePalette, withAlpha } from '@/adapters/chartTheme'
import type { ControlDef, ParamValues } from '@/types/params'
import { depEdges, depNodes } from './data'

/** 参数面板控件声明 */
export const controls: ControlDef[] = [
  {
    key: 'rankdir',
    label: '排列方向',
    type: 'select',
    default: 'TB',
    options: [
      { label: '从上到下', value: 'TB' },
      { label: '从左到右', value: 'LR' },
    ],
  },
  { key: 'rankSep', label: '层级间距', type: 'slider', min: 40, max: 160, step: 10, default: 70, unit: 'px' },
  { key: 'sizeByFanIn', label: '按被依赖数定大小', type: 'toggle', default: true },
  { key: 'showLabel', label: '包名标签', type: 'toggle', default: true },
]

export function buildSpec(theme: ChartTheme, params?: ParamValues): G6Spec {
  const palette = resolvePalette(params, theme)
  const t = g6GraphTheme(theme)
  const rankdir = params?.rankdir === 'LR' ? 'LR' : 'TB'
  const rankSep = typeof params?.rankSep === 'number' ? params.rankSep : 70
  const sizeByFanIn = params?.sizeByFanIn !== false
  const showLabel = params?.showLabel !== false

  /** 扇入（被依赖次数）：决定节点大小 */
  const fanIn = new Map<string, number>()
  depEdges.forEach((e) => fanIn.set(e.target, (fanIn.get(e.target) ?? 0) + 1))

  const tierColor: Record<string, number> = { core: 0, service: 2, ui: 4, app: 1 }

  return {
    data: {
      nodes: depNodes.map((n) => ({ id: n.id, data: { tier: n.tier, label: n.label } })),
      edges: depEdges.map((e) => ({ source: e.source, target: e.target })),
    },
    layout: { type: 'dagre', rankdir, ranksep: rankSep, nodesep: 30 },
    node: {
      type: 'circle',
      style: (d) => {
        const degree = fanIn.get(d.id) ?? 0
        const size = sizeByFanIn ? 26 + degree * 4 : 32
        const tier = (d.data as { tier?: string }).tier ?? 'core'
        const color = palette[tierColor[tier] % palette.length]
        const isEntry = tier === 'app'
        return {
          size,
          fill: color,
          fillOpacity: 0.92,
          stroke: isEntry ? theme.text : 'transparent',
          lineWidth: isEntry ? 2 : 0,
          labelText: showLabel ? ((d.data as { label?: string }).label ?? d.id) : '',
          labelPlacement: 'bottom',
          labelFill: t.labelFill,
          labelFontSize: 11,
          labelFontWeight: isEntry ? 600 : 400,
          cursor: 'grab',
        }
      },
      state: {
        selected: { stroke: palette[0], lineWidth: 3, shadowColor: withAlpha(palette[0], 0.5) },
      },
    },
    edge: {
      type: rankdir === 'LR' ? 'cubic-horizontal' : 'cubic-vertical',
      style: {
        stroke: t.edgeStroke,
        lineWidth: 1.4,
        endArrow: true,
        endArrowSize: 7,
      },
    },
    behaviors: ['drag-canvas', 'zoom-canvas', 'drag-element', 'click-select'],
    autoFit: 'view',
    padding: 32,
  }
}
