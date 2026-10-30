import type { EChartsOption } from '@/adapters/echarts'
import { baseTooltip } from '@/adapters/echarts'
import type { ChartTheme } from '@/adapters/chartTheme'
import { resolvePalette, withAlpha } from '@/adapters/chartTheme'
import type { ControlDef, ParamValues } from '@/types/params'
import { months, monthlySales } from './data'

/** 参数面板控件声明（详情页右侧面板渲染；「配色方案」为全局通用控件，无需在此声明） */
export const controls: ControlDef[] = [
  { key: 'showLabel', label: '显示数值标签', type: 'toggle', default: false },
  { key: 'barWidth', label: '柱宽', type: 'slider', min: 8, max: 40, step: 1, default: 20, unit: 'px' },
  {
    key: 'gradientDir',
    label: '渐变方向',
    type: 'select',
    default: 'vertical',
    options: [
      { label: '纵向', value: 'vertical' },
      { label: '横向', value: 'horizontal' },
    ],
  },
]

export function buildOption(theme: ChartTheme, params?: ParamValues): EChartsOption {
  const palette = resolvePalette(params, theme)
  const showLabel = params?.showLabel === true
  const barWidth = typeof params?.barWidth === 'number' ? params.barWidth : 20
  const horizontal = params?.gradientDir === 'horizontal'

  return {
    backgroundColor: 'transparent',
    animation: params?.animation !== false,
    tooltip: { ...baseTooltip(theme), trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 48, right: 24, top: 32, bottom: 36 },
    xAxis: {
      type: 'category',
      data: months,
      axisLine: { lineStyle: { color: theme.axisLine } },
      axisTick: { show: false },
      axisLabel: { color: theme.textSecondary },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: theme.textSecondary },
      splitLine: { lineStyle: { color: theme.splitLine } },
    },
    series: [
      {
        name: '销量',
        type: 'bar',
        data: monthlySales,
        barWidth,
        label: { show: showLabel, position: 'top', color: theme.textSecondary, fontSize: 11 },
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: horizontal ? 1 : 0,
            y2: horizontal ? 0 : 1,
            colorStops: [
              { offset: 0, color: palette[0] },
              { offset: 1, color: withAlpha(palette[0], 0.25) },
            ],
          },
        },
      },
    ],
  }
}
