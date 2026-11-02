/**
 * G6 组合关系图 Spec 构建：Combo 分组（G6 招牌能力）+ 预设坐标布局。
 * 参数面板变化时全量重建 Spec，经适配器 setOptions + render 增量应用。
 */
import { g6GraphTheme, type G6Spec } from '@/adapters/g6'
import type { ChartTheme } from '@/adapters/chartTheme'
import { resolvePalette } from '@/adapters/chartTheme'
import type { ControlDef, ParamValues } from '@/types/params'
import { ecosystemCombos, ecosystemEdges, ecosystemNodes } from './data'

/** 参数面板控件声明（「配色方案」为全局通用控件，无需在此声明） */
export const controls: ControlDef[] = [
  { key: 'nodeSize', label: '节点大小', type: 'slider', min: 14, max: 40, step: 2, default: 24, unit: 'px' },
  { key: 'unitRadius', label: '组合排布半径', type: 'slider', min: 30, max: 140, step: 5, default: 60, unit: 'px' },
  { key: 'showLabel', label: '节点标签', type: 'toggle', default: true },
]

export function buildSpec(theme: ChartTheme, params?: ParamValues): G6Spec {
  const palette = resolvePalette(params, theme)
  const t = g6GraphTheme(theme)
  const nodeSize = typeof params?.nodeSize === 'number' ? params.nodeSize : 24
  const unitRadius = typeof params?.unitRadius === 'number' ? params.unitRadius : 60
  const showLabel = params?.showLabel !== false

  /**
   * 预设坐标布局：三个 Combo 中心呈三角分布，组内节点绕中心环形排布。
   * 相比 combo-combined + 迭代式内层布局，预设坐标在任意帧率下都稳定，
   * 且 Combo 容器能精确包裹节点簇。
   */
  const comboCenters: Record<string, [number, number]> = {
    前端框架: [230, 140],
    服务端: [670, 140],
    数据与算法: [450, 360],
  }
  const counters: Record<string, number> = {}
  const nodeCount: Record<string, number> = {}
  for (const n of ecosystemNodes) {
    nodeCount[n.combo] = (nodeCount[n.combo] ?? 0) + 1
  }

  return {
    data: {
      nodes: ecosystemNodes.map((n) => {
        const [cx, cy] = comboCenters[n.combo] ?? [450, 250]
        const index = counters[n.combo] ?? 0
        counters[n.combo] = index + 1
        const total = nodeCount[n.combo]
        const angle = (index / total) * Math.PI * 2 - Math.PI / 2
        return {
          id: n.id,
          combo: n.combo,
          data: { group: n.group },
          style: {
            x: cx + Math.cos(angle) * unitRadius * 1.35,
            y: cy + Math.sin(angle) * unitRadius,
          },
        }
      }),
      edges: ecosystemEdges.map((e) => ({ source: e.source, target: e.target })),
      combos: ecosystemCombos.map((id) => ({ id })),
    },
    node: {
      style: (d) => {
        const group = Number((d.data as { group?: number }).group ?? 0)
        return {
          size: nodeSize,
          fill: palette[group % palette.length],
          fillOpacity: 0.9,
          stroke: theme.surface,
          lineWidth: 2,
          labelText: showLabel ? d.id : '',
          labelFill: t.labelFill,
          labelFontSize: 11,
          labelPlacement: 'bottom',
          labelBackground: true,
          labelBackgroundFill: theme.surface,
          labelBackgroundOpacity: 0.75,
          labelBackgroundRadius: 4,
          labelPadding: [1, 4],
          cursor: 'grab',
        }
      },
      state: {
        selected: {
          stroke: palette[0],
          lineWidth: 3,
          labelFontWeight: 700,
        },
      },
    },
    edge: {
      style: {
        stroke: t.edgeStroke,
        lineWidth: 1.2,
        strokeOpacity: 0.7,
      },
    },
    combo: {
      style: (d) => ({
        fill: t.comboFill,
        stroke: t.comboStroke,
        lineWidth: 1,
        lineDash: [4, 4],
        labelText: d.id,
        labelFill: t.labelFill,
        labelFontSize: 12,
        labelFontWeight: 600,
        labelPlacement: 'top',
        labelBackground: true,
        labelBackgroundFill: theme.surface,
        labelBackgroundOpacity: 0.9,
        labelBackgroundRadius: 4,
        labelPadding: [1, 6],
        collapsedSize: 40,
      }),
    },
    behaviors: ['drag-canvas', 'zoom-canvas', 'drag-element', 'click-select'],
    autoFit: 'center',
    padding: 24,
  }
}
