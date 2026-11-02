/**
 * G6 思维导图 Spec 构建：mindmap 树布局，根节点居中、子树左右展开。
 * direction 支持 LR（全部向右）/ RL（全部向左）/ H（左右分布）。
 */
import { g6GraphTheme, type G6Spec } from '@/adapters/g6'
import type { ChartTheme } from '@/adapters/chartTheme'
import { resolvePalette } from '@/adapters/chartTheme'
import type { ControlDef, ParamValues } from '@/types/params'
import { treeToGraphData } from '@antv/g6'
import { mindTree } from './data'

/** 参数面板控件声明 */
export const controls: ControlDef[] = [
  {
    key: 'direction',
    label: '展开方向',
    type: 'select',
    default: 'H',
    options: [
      { label: '向右', value: 'LR' },
      { label: '向左', value: 'RL' },
      { label: '左右分布', value: 'H' },
    ],
  },
  { key: 'nodeSize', label: '节点大小', type: 'slider', min: 12, max: 32, step: 2, default: 18, unit: 'px' },
  { key: 'showLabel', label: '节点标签', type: 'toggle', default: true },
]

export function buildSpec(theme: ChartTheme, params?: ParamValues): G6Spec {
  const palette = resolvePalette(params, theme)
  const t = g6GraphTheme(theme)
  const direction = typeof params?.direction === 'string' ? params.direction : 'LR'
  const nodeSize = typeof params?.nodeSize === 'number' ? params.nodeSize : 18
  const showLabel = params?.showLabel !== false

  return {
    data: treeToGraphData(mindTree),
    layout: { type: 'mindmap', direction, deepSep: 56, nodeSep: 14 },
    node: {
      style: (d) => {
        const depth = d.depth ?? 0
        const isRoot = depth === 0
        return {
          size: isRoot ? nodeSize + 12 : nodeSize,
          fill: isRoot ? palette[0] : palette[(depth + 1) % palette.length],
          fillOpacity: isRoot ? 1 : 0.85,
          stroke: theme.surface,
          lineWidth: 2,
          labelText: showLabel || !isRoot ? d.id : '',
          labelFill: t.labelFill,
          labelFontSize: isRoot ? 14 : 11,
          labelFontWeight: isRoot ? 700 : 400,
          labelPlacement: 'right',
          labelOffsetX: 4,
          cursor: 'grab',
        }
      },
      state: {
        selected: { stroke: palette[0], lineWidth: 3, labelFontWeight: 700 },
      },
    },
    edge: {
      type: 'cubic-horizontal',
      style: {
        stroke: t.edgeStroke,
        lineWidth: 1.4,
        strokeOpacity: 0.8,
      },
    },
    behaviors: [
      'drag-canvas',
      'zoom-canvas',
      // 单击切换折叠/展开：默认 dblclick 依赖两次快速点击命中同一元素实例，
      // 树布局重排后元素重建会导致双击失效，改为 click 更稳定也更符合直觉
      { type: 'collapse-expand', trigger: 'click' },
      'drag-element',
    ],
    autoFit: 'view',
    padding: 30,
  }
}
