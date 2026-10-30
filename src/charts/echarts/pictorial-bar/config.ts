import type { EChartsOption } from '@/adapters/echarts'
import { baseTooltip } from '@/adapters/echarts'
import type { ChartTheme } from '@/adapters/chartTheme'
import { resolvePalette, withAlpha } from '@/adapters/chartTheme'
import type { ControlDef, ParamValues } from '@/types/params'
import { quarters, electricity } from './data'

/** 参数面板控件声明（详情页右侧面板渲染；「配色方案」为全局通用控件，无需在此声明） */
export const controls: ControlDef[] = [
  { key: 'animation', label: '动画', type: 'toggle', default: true },
  { key: 'symbolScale', label: '图标缩放', type: 'slider', min: 0.6, max: 1.4, step: 0.05, default: 1 },
  {
    key: 'sortOrder',
    label: '数据排序',
    type: 'select',
    default: 'original',
    options: [
      { label: '原始', value: 'original' },
      { label: '降序', value: 'desc' },
      { label: '升序', value: 'asc' },
    ],
  },
]

export function buildOption(theme: ChartTheme, params?: ParamValues): EChartsOption {
  const palette = resolvePalette(params, theme)
  const symbolScale = typeof params?.symbolScale === 'number' ? params.symbolScale : 1

  // 数据排序：在副本上重排（联动类目轴），避免修改 data.ts 导出的原始数组
  const pairs = electricity.map((value, index) => ({ quarter: quarters[index], value }))
  if (params?.sortOrder === 'desc') pairs.sort((a, b) => b.value - a.value)
  if (params?.sortOrder === 'asc') pairs.sort((a, b) => a.value - b.value)
  const sortedQuarters = pairs.map((item) => item.quarter)
  const sortedElectricity = pairs.map((item) => item.value)

  return {
    backgroundColor: 'transparent',
    animation: params?.animation !== false,
    tooltip: {
      ...baseTooltip(theme),
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: unknown) => {
        const list = Array.isArray(params) ? params : [params]
        const real = list.find(
          (item) => (item as { seriesName?: string })?.seriesName === '用电量',
        ) as { value?: number } | undefined
        if (!real?.value) return ''
        return `${real.value} 万千瓦时`
      },
    },
    grid: { left: 48, right: 24, top: 32, bottom: 36 },
    xAxis: {
      type: 'category',
      data: sortedQuarters,
      axisLine: { lineStyle: { color: theme.axisLine } },
      axisTick: { show: false },
      axisLabel: { color: theme.textSecondary },
    },
    yAxis: {
      type: 'value',
      max: 160,
      axisLabel: { color: theme.textSecondary },
      splitLine: { lineStyle: { color: theme.splitLine } },
    },
    series: [
      {
        name: '用电量',
        type: 'pictorialBar',
        symbol: 'rect',
        symbolRepeat: true,
        symbolSize: [28 * symbolScale, 7 * symbolScale],
        symbolMargin: 3,
        data: sortedElectricity,
        z: 2,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: palette[1] },
              { offset: 1, color: palette[0] },
            ],
          },
        },
      },
      {
        name: '背景占位',
        type: 'pictorialBar',
        symbol: 'rect',
        symbolRepeat: true,
        symbolSize: [28 * symbolScale, 7 * symbolScale],
        symbolMargin: 3,
        data: quarters.map(() => 160),
        z: 1,
        itemStyle: { color: withAlpha(theme.textTertiary, 0.15) },
        silent: true,
      },
    ],
  }
}
