import type { EChartsOption } from '@/adapters/echarts'
import { baseTooltip } from '@/adapters/echarts'
import type { ChartTheme } from '@/adapters/chartTheme'
import { resolvePalette } from '@/adapters/chartTheme'
import type { ControlDef, ParamValues } from '@/types/params'
import { categories, nodes, links } from './data'

/** 参数面板控件声明（详情页右侧面板渲染；「配色方案」为全局通用控件，无需在此声明） */
export const controls: ControlDef[] = [
  { key: 'animation', label: '动画', type: 'toggle', default: true },
  { key: 'repulsion', label: '斥力强度', type: 'slider', min: 100, max: 600, step: 20, default: 260 },
  { key: 'edgeLength', label: '连线距离', type: 'slider', min: 40, max: 200, step: 5, default: 100, unit: 'px' },
]

export function buildOption(theme: ChartTheme, params?: ParamValues): EChartsOption {
  const palette = resolvePalette(params, theme)
  const repulsion = typeof params?.repulsion === 'number' ? params.repulsion : 260
  const edgeLength = typeof params?.edgeLength === 'number' ? params.edgeLength : 100

  return {
    backgroundColor: 'transparent',
    animation: params?.animation !== false,
    tooltip: {
      ...baseTooltip(theme),
      formatter: (params: unknown) => {
        const data = (params as { data?: { name?: string; value?: string } }).data
        if (data?.name && data.value) return `${data.name}<br/>${data.value}`
        return ''
      },
    },
    legend: {
      bottom: 8,
      data: categories.map((c) => c.name),
      textStyle: { color: theme.textSecondary },
      icon: 'circle',
      itemWidth: 10,
      itemHeight: 10,
    },
    series: [
      {
        name: '协作网络',
        type: 'graph',
        layout: 'force',
        roam: true,
        draggable: true,
        categories,
        data: nodes.map((node, index) => ({
          ...node,
          itemStyle: { color: palette[node.category % palette.length] },
          label: { show: index < 6, color: theme.text, fontSize: 11 },
        })),
        links,
        force: {
          repulsion,
          edgeLength: [Math.round(edgeLength * 0.7), Math.round(edgeLength * 1.3)],
          gravity: 0.15,
          friction: 0.15,
        },
        lineStyle: {
          color: 'source',
          opacity: 0.45,
          curveness: 0.1,
        },
        emphasis: {
          focus: 'adjacency',
          lineStyle: { opacity: 0.9, width: 2.5 },
        },
        scaleLimit: { min: 0.6, max: 2.5 },
      },
    ],
  }
}
