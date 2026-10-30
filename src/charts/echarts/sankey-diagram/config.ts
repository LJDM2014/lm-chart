import type { EChartsOption } from '@/adapters/echarts'
import { baseTooltip } from '@/adapters/echarts'
import type { ChartTheme } from '@/adapters/chartTheme'
import { resolvePalette } from '@/adapters/chartTheme'
import type { ControlDef, ParamValues } from '@/types/params'
import { nodes, links } from './data'

/** 参数面板控件声明（详情页右侧面板渲染；「配色方案」为全局通用控件，无需在此声明） */
export const controls: ControlDef[] = [
  { key: 'animation', label: '动画', type: 'toggle', default: true },
  { key: 'linkOpacity', label: '连线透明度', type: 'slider', min: 0.1, max: 0.8, step: 0.05, default: 0.45 },
  { key: 'showLabel', label: '节点标签显隐', type: 'toggle', default: true },
]

export function buildOption(theme: ChartTheme, params?: ParamValues): EChartsOption {
  const palette = resolvePalette(params, theme)
  const linkOpacity = typeof params?.linkOpacity === 'number' ? params.linkOpacity : 0.45
  const showLabel = params?.showLabel !== false

  return {
    backgroundColor: 'transparent',
    animation: params?.animation !== false,
    tooltip: { ...baseTooltip(theme), formatter: '{b}：{c}' },
    series: [
      {
        name: '能源流向',
        type: 'sankey',
        left: 24,
        right: 64,
        top: 24,
        bottom: 24,
        emphasis: { focus: 'adjacency' },
        nodeGap: 14,
        nodeWidth: 16,
        data: nodes,
        links,
        label: { show: showLabel, color: theme.textSecondary, fontSize: 12 },
        itemStyle: { borderRadius: 3 },
        lineStyle: { color: 'gradient', curveness: 0.5, opacity: linkOpacity },
        levels: [
          { depth: 0, itemStyle: { color: palette[2] } },
          { depth: 1, itemStyle: { color: palette[0] } },
          { depth: 2, itemStyle: { color: palette[4] } },
        ],
      },
    ],
  }
}
