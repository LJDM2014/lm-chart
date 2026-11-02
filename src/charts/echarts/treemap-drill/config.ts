import type { EChartsOption } from '@/adapters/echarts'
import { baseTooltip } from '@/adapters/echarts'
import type { ChartTheme } from '@/adapters/chartTheme'
import { resolvePalette } from '@/adapters/chartTheme'
import type { ControlDef, ParamValues } from '@/types/params'
import { budgetTree } from './data'

/** 参数面板控件声明（「配色方案」为全局通用控件，无需在此声明） */
export const controls: ControlDef[] = [
  { key: 'leafDepth', label: '初始展示层级', type: 'slider', min: 1, max: 2, step: 1, unit: '层', default: 2 },
  { key: 'gapWidth', label: '区块间距', type: 'slider', min: 1, max: 10, step: 1, unit: 'px', default: 4 },
  { key: 'showBreadcrumb', label: '面包屑导航', type: 'toggle', default: true },
  { key: 'showUpperLabel', label: '父级名称条', type: 'toggle', default: true },
]

export function buildOption(theme: ChartTheme, params?: ParamValues): EChartsOption {
  const palette = resolvePalette(params, theme)
  const leafDepth = typeof params?.leafDepth === 'number' ? params.leafDepth : 2
  const gapWidth = typeof params?.gapWidth === 'number' ? params.gapWidth : 4
  const showBreadcrumb = params?.showBreadcrumb !== false
  const showUpperLabel = params?.showUpperLabel !== false

  return {
    backgroundColor: 'transparent',
    animation: true,
    animationDuration: 500,
    animationDurationUpdate: 600,
    tooltip: {
      ...baseTooltip(theme),
      formatter: (raw: unknown) => {
        const info = raw as { name?: string; value?: number }
        const value = typeof info.value === 'number' ? info.value : 0
        return `<b>${info.name ?? ''}</b><br/>预算：${value} 亿元`
      },
    },
    series: [
      {
        type: 'treemap',
        name: budgetTree.name,
        width: '100%',
        height: '100%',
        top: 8,
        bottom: showBreadcrumb ? 40 : 8,
        left: 8,
        right: 8,
        // 下钻核心：只展示前 N 层叶子，点击区块逐层深入，面包屑返回
        leafDepth,
        nodeClick: 'zoomToNode',
        roam: false,
        breadcrumb: {
          show: showBreadcrumb,
          bottom: 4,
          // 深色底保证默认白色文字在明暗主题下均可读
          itemStyle: {
            color: palette[0],
            borderColor: theme.axisLine,
            borderWidth: 1,
            shadowBlur: 0,
          },
          emphasis: { itemStyle: { color: palette[1] ?? palette[0] } },
        },
        label: {
          show: true,
          color: '#fff',
          fontSize: 13,
          fontWeight: 600,
          formatter: '{b}',
        },
        upperLabel: {
          show: showUpperLabel,
          height: 26,
          color: '#fff',
          fontSize: 12,
          fontWeight: 600,
        },
        itemStyle: {
          borderColor: theme.surface,
          borderWidth: gapWidth,
          gapWidth,
        },
        levels: [
          // 第 0 层（虚拟根）：子区块间距
          {
            itemStyle: { borderWidth: 0, gapWidth },
          },
          // 第 1 层：一级事业部，底色取色板
          {
            color: palette,
            colorMappingBy: 'id',
            itemStyle: {
              borderColor: theme.surface,
              borderWidth: gapWidth,
              gapWidth,
            },
            upperLabel: { show: showUpperLabel },
          },
          // 第 2 层：子业务线，同色系加深
          {
            colorSaturation: [0.32, 0.55],
            itemStyle: {
              borderWidth: gapWidth,
              gapWidth,
              borderColorSaturation: 0.65,
            },
          },
          // 第 3 层：叶子节点
          {
            colorSaturation: [0.4, 0.7],
            itemStyle: {
              borderWidth: gapWidth,
              gapWidth,
              borderColorSaturation: 0.7,
            },
          },
        ],
        data: budgetTree.children,
      },
    ],
  }
}
