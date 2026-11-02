import type { EChartsOption } from '@/adapters/echarts'
import { baseTooltip } from '@/adapters/echarts'
import type { ChartTheme } from '@/adapters/chartTheme'
import { resolvePalette, withAlpha } from '@/adapters/chartTheme'
import type { ControlDef, ParamValues } from '@/types/params'
import { riverData } from './data'

/** 参数面板控件声明（「配色方案」为全局通用控件，无需在此声明） */
export const controls: ControlDef[] = [
  { key: 'opacity', label: '河流透明度', type: 'slider', min: 0.4, max: 1, step: 0.05, default: 0.85 },
  { key: 'showLabel', label: '时间轴标签', type: 'toggle', default: true },
  { key: 'animation', label: '动画', type: 'toggle', default: true },
]

export function buildOption(theme: ChartTheme, params?: ParamValues): EChartsOption {
  const palette = resolvePalette(params, theme)
  const opacity = typeof params?.opacity === 'number' ? params.opacity : 0.85
  const showLabel = params?.showLabel !== false

  return {
    backgroundColor: 'transparent',
    animation: params?.animation !== false,
    tooltip: {
      ...baseTooltip(theme),
      trigger: 'axis',
      axisPointer: { type: 'line', lineStyle: { color: theme.axisLine } },
    },
    legend: {
      top: 8,
      data: ['人工智能', '大前端', '云原生', '大数据'],
      textStyle: { color: theme.textSecondary },
    },
    singleAxis: {
      top: 56,
      bottom: 48,
      left: 64,
      right: 64,
      axisTick: 'none',
      type: 'time',
      axisLine: { lineStyle: { color: theme.axisLine } },
      axisLabel: {
        show: showLabel,
        color: theme.textSecondary,
        fontSize: 11,
        formatter: (value: number) => {
          const date = new Date(value)
          return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
        },
      },
      splitLine: { show: false },
    },
    series: [
      {
        type: 'themeRiver',
        boundaryGap: ['18%', '18%'],
        data: riverData,
        label: { show: false },
        emphasis: {
          itemStyle: { shadowBlur: 16, shadowColor: 'rgba(0, 0, 0, 0.3)' },
        },
        itemStyle: {
          opacity,
          borderColor: withAlpha(theme.surface, 0.6),
          borderWidth: 0.5,
        },
        color: palette,
      },
    ],
  }
}
