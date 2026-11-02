/**
 * G6 DAG 流程图 Spec 构建：dagre 层次布局（rankdir 控制主流向），
 * 矩形节点 + 箭头连线，起止节点用色板首尾色强调。
 */
import { g6GraphTheme, type G6Spec } from '@/adapters/g6'
import type { ChartTheme } from '@/adapters/chartTheme'
import { resolvePalette, withAlpha } from '@/adapters/chartTheme'
import type { ControlDef, ParamValues } from '@/types/params'
import { flowEdges, flowNodes } from './data'

/** 参数面板控件声明 */
export const controls: ControlDef[] = [
  {
    key: 'rankdir',
    label: '主流向',
    type: 'select',
    default: 'LR',
    options: [
      { label: '从左到右', value: 'LR' },
      { label: '从上到下', value: 'TB' },
    ],
  },
  { key: 'rankSep', label: '层级间距', type: 'slider', min: 30, max: 160, step: 10, default: 60, unit: 'px' },
  { key: 'showLabel', label: '节点标签', type: 'toggle', default: true },
]

export function buildSpec(theme: ChartTheme, params?: ParamValues): G6Spec {
  const palette = resolvePalette(params, theme)
  const t = g6GraphTheme(theme)
  const rankdir = params?.rankdir === 'TB' ? 'TB' : 'LR'
  const rankSep = typeof params?.rankSep === 'number' ? params.rankSep : 60
  const showLabel = params?.showLabel !== false
  const horizontal = rankdir === 'LR'
  /** 与布局方向匹配的圆角连线 */
  const edgeType = horizontal ? 'cubic-horizontal' : 'cubic-vertical'

  return {
    data: {
      nodes: flowNodes.map((n) => ({ id: n.id, data: { kind: n.kind, label: n.label } })),
      edges: flowEdges.map((e) => ({ source: e.source, target: e.target })),
    },
    layout: { type: 'dagre', rankdir, ranksep: rankSep, nodesep: 24 },
    node: {
      type: 'rect',
      style: (d) => {
        const { kind, label } = d.data as { kind?: string; label?: string }
        const isStart = kind === 'start'
        const isEnd = kind === 'end'
        const fill = isStart ? palette[0] : isEnd ? palette[4] : theme.surface
        return {
          size: horizontal ? [112, 40] : [140, 44],
          fill,
          fillOpacity: isStart || isEnd ? 0.95 : 1,
          stroke: isStart || isEnd ? 'transparent' : theme.axisLine,
          lineWidth: 1,
          radius: 8,
          labelText: showLabel ? (label ?? d.id) : '',
          labelPlacement: 'center',
          labelFill: isStart || isEnd ? '#ffffff' : t.labelFill,
          labelFontSize: 12,
          labelFontWeight: isStart || isEnd ? 600 : 400,
          cursor: 'grab',
        }
      },
      state: {
        selected: { stroke: palette[0], lineWidth: 2.5, shadowColor: withAlpha(palette[0], 0.45) },
      },
    },
    edge: {
      type: edgeType,
      style: {
        stroke: t.edgeStroke,
        lineWidth: 1.4,
        endArrow: true,
        endArrowSize: 7,
      },
    },
    behaviors: ['drag-canvas', 'zoom-canvas', 'drag-element', 'click-select'],
    autoFit: 'view',
    padding: 24,
  }
}
