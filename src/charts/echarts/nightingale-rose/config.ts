/**
 * 南丁格尔玫瑰图 option 构建：pie + roseType（radius/area），
 * 扇区半径映射销量，强调「占比 + 数值」双重信息。
 */
import type { EChartsOption } from '@/adapters/echarts'
import { baseTooltip } from '@/adapters/echarts'
import type { ChartTheme } from '@/adapters/chartTheme'
import { resolvePalette, withAlpha } from '@/adapters/chartTheme'
import type { ControlDef, ParamValues } from '@/types/params'
import { REGION_SALES } from './data'

/** 参数面板控件声明 */
export const controls: ControlDef[] = [
  {
    key: 'roseMode',
    label: '玫瑰模式',
    type: 'select',
    default: 'radius',
    options: [
      { label: '圆角半径模式', value: 'radius' },
      { label: '面积模式', value: 'area' },
    ],
  },
  { key: 'outerRadius', label: '外圈半径', type: 'slider', min: 50, max: 88, step: 2, default: 74, unit: '%' },
  { key: 'showLabel', label: '扇区标签', type: 'toggle', default: true },
  { key: 'showLegend', label: '底部图例', type: 'toggle', default: true },
]

export function buildOption(theme: ChartTheme, params?: ParamValues): EChartsOption {
  const palette = resolvePalette(params, theme)
  const roseMode = typeof params?.roseMode === 'string' ? params.roseMode : 'radius'
  const outerRadius = typeof params?.outerRadius === 'number' ? params.outerRadius : 74
  const showLabel = params?.showLabel !== false
  const showLegend = params?.showLegend !== false

  return {
    backgroundColor: 'transparent',
    tooltip: {
      ...baseTooltip(theme),
      formatter: (raw: unknown) => {
        const p = raw as { name?: string; value?: number; percent?: number }
        return `${p.name}<br/>销量：<b>${p.value}</b> 万辆（${p.percent}%）`
      },
    },
    legend: {
      show: showLegend,
      bottom: 8,
      textStyle: { color: theme.textSecondary, fontSize: 12 },
      itemWidth: 12,
      itemHeight: 8,
    },
    series: [
      {
        type: 'pie',
        roseType: roseMode === 'area' ? 'area' : 'radius',
        radius: ['16%', `${outerRadius}%`],
        center: ['50%', showLegend ? '46%' : '52%'],
        data: REGION_SALES.map((r, i) => ({
          name: r.region,
          value: r.value,
          itemStyle: { color: palette[i % palette.length] },
        })),
        itemStyle: {
          borderColor: theme.surface,
          borderWidth: 2,
          borderRadius: roseMode === 'radius' ? 6 : 2,
        },
        label: {
          show: showLabel,
          color: theme.textSecondary,
          fontSize: 11,
          formatter: '{b}\n{d}%',
        },
        labelLine: {
          lineStyle: { color: theme.axisLine },
          length: 8,
          length2: 12,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 16,
            shadowColor: withAlpha(palette[0], 0.4),
          },
        },
        animationDurationUpdate: 700,
        animationEasingUpdate: 'cubicInOut',
      },
    ],
  }
}
