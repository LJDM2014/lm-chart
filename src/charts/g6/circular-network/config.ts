/**
 * G6 环形关系图 Spec 构建：circular 布局沿圆环排布节点（可选按连接度排序），
 * quadratic 边以 curveOffset 控制弧度形成束状流向，节点按角色着色、可选按度数定大小。
 */
import { g6GraphTheme, type G6Spec } from '@/adapters/g6'
import type { ChartTheme } from '@/adapters/chartTheme'
import { resolvePalette, withAlpha } from '@/adapters/chartTheme'
import type { ControlDef, ParamValues } from '@/types/params'
import { callEdges, serviceNodes } from './data'

/** 参数面板控件声明 */
export const controls: ControlDef[] = [
  { key: 'curveOffset', label: '连线弧度', type: 'slider', min: 0, max: 80, step: 5, default: 30, unit: 'px' },
  {
    key: 'ordering',
    label: '环上排序',
    type: 'select',
    default: 'degree',
    options: [
      { label: '按连接度降序', value: 'degree' },
      { label: '按数据顺序', value: 'data' },
    ],
  },
  { key: 'sizeByDegree', label: '按连接度定大小', type: 'toggle', default: true },
  { key: 'showLabel', label: '服务标签', type: 'toggle', default: true },
]

export function buildSpec(theme: ChartTheme, params?: ParamValues): G6Spec {
  const palette = resolvePalette(params, theme)
  const t = g6GraphTheme(theme)
  const curveOffset = typeof params?.curveOffset === 'number' ? params.curveOffset : 30
  const ordering = params?.ordering === 'data' ? null : 'degree'
  const sizeByDegree = params?.sizeByDegree !== false
  const showLabel = params?.showLabel !== false

  /** 度数（调用 + 被调用）：决定节点大小 */
  const degree = new Map<string, number>()
  callEdges.forEach((e) => {
    degree.set(e.source, (degree.get(e.source) ?? 0) + 1)
    degree.set(e.target, (degree.get(e.target) ?? 0) + 1)
  })

  const roleColor: Record<string, number> = { gateway: 0, core: 2, support: 4 }

  return {
    data: {
      nodes: serviceNodes.map((n) => ({ id: n.id, data: { role: n.role, label: n.label } })),
      edges: callEdges.map((e) => ({ source: e.source, target: e.target })),
    },
    layout: { type: 'circular', ordering, radius: 180 },
    node: {
      type: 'circle',
      style: (d) => {
        const deg = degree.get(d.id) ?? 1
        const size = sizeByDegree ? 24 + deg * 3 : 32
        const role = (d.data as { role?: string }).role ?? 'support'
        const color = palette[roleColor[role] % palette.length]
        const isGateway = role === 'gateway'
        return {
          size,
          fill: color,
          fillOpacity: 0.92,
          stroke: isGateway ? theme.text : 'transparent',
          lineWidth: isGateway ? 2 : 0,
          labelText: showLabel ? ((d.data as { label?: string }).label ?? d.id) : '',
          labelPlacement: 'bottom',
          labelFill: t.labelFill,
          labelFontSize: 11,
          labelFontWeight: isGateway ? 600 : 400,
          cursor: 'grab',
        }
      },
      state: {
        selected: { stroke: palette[0], lineWidth: 3, shadowColor: withAlpha(palette[0], 0.5) },
      },
    },
    edge: {
      type: 'quadratic',
      style: {
        stroke: t.edgeStroke,
        lineWidth: 1.4,
        endArrow: true,
        endArrowSize: 6,
        curveOffset,
      },
    },
    behaviors: ['drag-canvas', 'zoom-canvas', 'drag-element', 'click-select'],
    autoFit: 'view',
    padding: 40,
  }
}
