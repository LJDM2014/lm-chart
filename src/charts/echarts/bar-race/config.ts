/**
 * 动态排序条形图 option 构建：realtimeSort 实时换位 + 数值动画。
 * frame 由 Chart.vue 的定时器推进，经增量 setOption 逐帧刷新（不销毁重建）。
 */
import type { EChartsOption } from '@/adapters/echarts'
import { baseTooltip } from '@/adapters/echarts'
import type { ChartTheme } from '@/adapters/chartTheme'
import { resolvePalette } from '@/adapters/chartTheme'
import type { ControlDef, ParamValues } from '@/types/params'
import { frameAt } from './data'

/** 参数面板控件声明 */
export const controls: ControlDef[] = [
  { key: 'frameMs', label: '播放间隔', type: 'slider', min: 400, max: 2000, step: 100, default: 900, unit: 'ms' },
  { key: 'showLabel', label: '数值标签', type: 'toggle', default: true },
  { key: 'barRadius', label: '条形圆角', type: 'slider', min: 0, max: 12, step: 1, default: 4, unit: 'px' },
]

export function buildOption(
  theme: ChartTheme,
  params?: ParamValues,
  /** 当前帧（年份序号），由动态定时器推进 */
  frame = 0,
): EChartsOption {
  const palette = resolvePalette(params, theme)
  const showLabel = params?.showLabel !== false
  const barRadius = typeof params?.barRadius === 'number' ? params.barRadius : 4

  const { year, items } = frameAt(frame)

  return {
    backgroundColor: 'transparent',
    title: {
      text: `${year} 年度交付量`,
      right: 28,
      top: 12,
      textStyle: { color: theme.textSecondary, fontSize: 20, fontWeight: 600 },
    },
    tooltip: {
      ...baseTooltip(theme),
      formatter: (raw: unknown) => {
        const p = raw as { name?: string; value?: number }
        return `${p.name}<br/>年度交付：<b>${p.value}</b> 万辆`
      },
    },
    grid: { top: 24, left: 16, right: 96, bottom: 16, containLabel: true },
    xAxis: {
      type: 'value',
      max: 'dataMax',
      axisLabel: { color: theme.textTertiary, formatter: (v: number) => `${v}万` },
      splitLine: { lineStyle: { color: theme.splitLine } },
    },
    yAxis: {
      type: 'category',
      data: items.map((d) => d.name),
      inverse: true,
      realtimeSort: true,
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: { color: theme.text, fontSize: 12 },
      animationDuration: 300,
      animationDurationUpdate: 700,
    } as EChartsOption['yAxis'],
    series: [
      {
        type: 'bar',
        data: items.map((d, i) => ({
          name: d.name,
          value: d.value,
          itemStyle: {
            color: palette[i % palette.length],
            borderRadius: [0, barRadius, barRadius, 0],
          },
        })),
        realtimeSort: true,
        barMinHeight: 2,
        label: {
          show: showLabel,
          position: 'right',
          valueAnimation: true,
          color: theme.text,
          fontSize: 12,
          formatter: (p: unknown) => {
            const c = p as { value?: number }
            return `${c.value ?? 0}万`
          },
        },
        animationDuration: 0,
        animationDurationUpdate: 700,
        animationEasingUpdate: 'linear',
        animationDelayUpdate: (idx: number) => idx * 40,
      },
    ],
  }
}
