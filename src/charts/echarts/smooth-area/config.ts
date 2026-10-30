import type { EChartsOption } from '@/adapters/echarts'
import { baseTooltip } from '@/adapters/echarts'
import type { ChartTheme } from '@/adapters/chartTheme'
import { resolvePalette, withAlpha } from '@/adapters/chartTheme'
import type { ControlDef, ParamValues } from '@/types/params'
import { weekdays, income, expense } from './data'

/** 参数面板控件声明（详情页右侧面板渲染；「配色方案」为全局通用控件，无需在此声明） */
export const controls: ControlDef[] = [
  { key: 'animation', label: '动画', type: 'toggle', default: true },
  { key: 'smooth', label: '平滑曲线', type: 'toggle', default: true },
  { key: 'areaOpacity', label: '面积透明度', type: 'slider', min: 0.05, max: 0.8, step: 0.05, default: 0.35 },
]

export function buildOption(theme: ChartTheme, params?: ParamValues): EChartsOption {
  const palette = resolvePalette(params, theme)
  const smooth = params?.smooth !== false
  const areaOpacity = typeof params?.areaOpacity === 'number' ? params.areaOpacity : 0.35

  const makeSeries = (name: string, color: string, data: number[]) => ({
    name,
    type: 'line' as const,
    smooth,
    showSymbol: false,
    data,
    lineStyle: { width: 2.5, color },
    itemStyle: { color },
    areaStyle: {
      color: {
        type: 'linear' as const,
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [
          { offset: 0, color: withAlpha(color, areaOpacity) },
          { offset: 1, color: withAlpha(color, areaOpacity * 0.06) },
        ],
      },
    },
  })

  return {
    backgroundColor: 'transparent',
    animation: params?.animation !== false,
    tooltip: { ...baseTooltip(theme), trigger: 'axis' },
    legend: { bottom: 0, textStyle: { color: theme.textSecondary }, icon: 'roundRect', itemWidth: 14, itemHeight: 6 },
    grid: { left: 48, right: 24, top: 24, bottom: 48 },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: weekdays,
      axisLine: { lineStyle: { color: theme.axisLine } },
      axisTick: { show: false },
      axisLabel: { color: theme.textSecondary },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: theme.textSecondary },
      splitLine: { lineStyle: { color: theme.splitLine } },
    },
    series: [makeSeries('收入', palette[0], income), makeSeries('支出', palette[2], expense)],
  }
}
