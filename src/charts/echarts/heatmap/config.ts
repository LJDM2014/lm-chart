import type { EChartsOption } from '@/adapters/echarts'
import { baseTooltip } from '@/adapters/echarts'
import type { ChartTheme } from '@/adapters/chartTheme'
import type { ControlDef, ParamValues } from '@/types/params'
import { days, hours, heatData } from './data'

/** 参数面板控件声明（详情页右侧面板渲染；「配色方案」为全局通用控件，无需在此声明） */
export const controls: ControlDef[] = [
  { key: 'animation', label: '动画', type: 'toggle', default: true },
  { key: 'showLabel', label: '数值标签显隐', type: 'toggle', default: false },
  { key: 'heatMax', label: '热度上界', type: 'slider', min: 5, max: 30, step: 1, default: 10 },
]

export function buildOption(theme: ChartTheme, params?: ParamValues): EChartsOption {
  const showLabel = params?.showLabel === true
  const heatMax = typeof params?.heatMax === 'number' ? params.heatMax : 10

  return {
    backgroundColor: 'transparent',
    animation: params?.animation !== false,
    tooltip: {
      ...baseTooltip(theme),
      formatter: (params: unknown) => {
        const list = Array.isArray(params) ? params : [params]
        const value = (list[0] as { value?: [number, number, number] })?.value
        if (!value) return ''
        const [h, d, v] = value
        return `${days[d]} ${hours[h]}<br/>活跃度：${v}`
      },
    },
    grid: { left: 56, right: 24, top: 24, bottom: 88 },
    xAxis: {
      type: 'category',
      data: hours,
      splitArea: { show: true },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: theme.textSecondary },
    },
    yAxis: {
      type: 'category',
      data: days,
      splitArea: { show: true },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: theme.textSecondary },
    },
    visualMap: {
      min: 0,
      max: heatMax,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: 8,
      itemHeight: 90,
      textStyle: { color: theme.textSecondary },
      inRange: {
        color: theme.isDark
          ? ['#1e2536', '#3d5af1', '#9db4ff']
          : ['#eef1fb', '#6d85ff', '#2b47d8'],
      },
    },
    series: [
      {
        name: '活跃度',
        type: 'heatmap',
        data: heatData,
        label: { show: showLabel },
        itemStyle: {
          borderColor: theme.surface,
          borderWidth: 2,
          borderRadius: 4,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 8,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
          },
        },
      },
    ],
  }
}
