import type { EChartsOption } from '@/adapters/echarts'
import { baseTooltip } from '@/adapters/echarts'
import type { ChartTheme } from '@/adapters/chartTheme'
import { resolvePalette, withAlpha } from '@/adapters/chartTheme'
import type { ControlDef, ParamValues } from '@/types/params'
import { maleSamples, femaleSamples } from './data'

/** 参数面板控件声明（详情页右侧面板渲染；「配色方案」为全局通用控件，无需在此声明） */
export const controls: ControlDef[] = [
  { key: 'animation', label: '动画', type: 'toggle', default: true },
  { key: 'dotSize', label: '点大小', type: 'slider', min: 6, max: 24, step: 1, default: 13, unit: 'px' },
  { key: 'opacity', label: '散点透明度', type: 'slider', min: 0.2, max: 1, step: 0.05, default: 0.75 },
]

export function buildOption(theme: ChartTheme, params?: ParamValues): EChartsOption {
  const palette = resolvePalette(params, theme)
  const dotSize = typeof params?.dotSize === 'number' ? params.dotSize : 13
  const opacity = typeof params?.opacity === 'number' ? params.opacity : 0.75

  const makeSeries = (name: string, color: string, data: [number, number][]) => ({
    name,
    type: 'scatter' as const,
    data,
    symbolSize: (val: [number, number]) => Math.max(dotSize * 0.6, (val[1] / 90) * dotSize * 2),
    itemStyle: { color: withAlpha(color, opacity), borderColor: color, borderWidth: 1 },
  })

  return {
    backgroundColor: 'transparent',
    animation: params?.animation !== false,
    tooltip: {
      ...baseTooltip(theme),
      formatter: (params: unknown) => {
        const list = Array.isArray(params) ? params : [params]
        const first = list[0] as { seriesName?: string; value?: [number, number] }
        if (!first?.value) return ''
        return `${first.seriesName}<br/>身高 ${first.value[0]} cm · 体重 ${first.value[1]} kg`
      },
    },
    legend: { bottom: 0, textStyle: { color: theme.textSecondary }, icon: 'circle' },
    grid: { left: 48, right: 24, top: 24, bottom: 48 },
    xAxis: {
      name: '身高 (cm)',
      nameTextStyle: { color: theme.textTertiary },
      min: 150,
      max: 195,
      axisLine: { lineStyle: { color: theme.axisLine } },
      axisLabel: { color: theme.textSecondary },
      splitLine: { lineStyle: { color: theme.splitLine } },
    },
    yAxis: {
      name: '体重 (kg)',
      nameTextStyle: { color: theme.textTertiary },
      min: 40,
      max: 95,
      axisLine: { show: false },
      axisLabel: { color: theme.textSecondary },
      splitLine: { lineStyle: { color: theme.splitLine } },
    },
    series: [
      makeSeries('男性', palette[0], maleSamples),
      makeSeries('女性', palette[6], femaleSamples),
    ],
  }
}
