import type { ApexOptions } from 'apexcharts'
import type { ApexChartConfig } from '@/adapters/apexcharts'
import type { ChartTheme } from '@/adapters/chartTheme'
import { resolvePalette } from '@/adapters/chartTheme'
import type { ControlDef, ParamValues } from '@/types/params'
import { phaseSeries } from './data'

/** 参数面板控件声明（「配色方案」为全局通用控件，无需在此声明） */
export const controls: ControlDef[] = [
  {
    key: 'orientation',
    label: '条形方向',
    type: 'select',
    default: 'horizontal',
    options: [
      { label: '横向（甘特）', value: 'horizontal' },
      { label: '纵向', value: 'vertical' },
    ],
  },
  { key: 'showLabels', label: '显示日期标签', type: 'toggle', default: false },
  { key: 'showGrid', label: '显示网格线', type: 'toggle', default: true },
]

export function buildConfig(theme: ChartTheme, params?: ParamValues): ApexChartConfig {
  const palette = resolvePalette(params, theme)
  const horizontal = params?.orientation !== 'vertical'
  const showLabels = params?.showLabels === true
  const showGrid = params?.showGrid !== false

  const options: ApexOptions = {
    series: phaseSeries.map((phase) => ({
      name: phase.name,
      data: phase.ranges.map((range) => ({
        x: range.project,
        y: [range.from.getTime(), range.to.getTime()],
      })),
    })),
    chart: {
      type: 'rangeBar',
      background: 'transparent',
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: 'inherit',
      animations: { enabled: params?.animation !== false },
    },
    theme: { mode: theme.isDark ? 'dark' : 'light' },
    plotOptions: {
      bar: { horizontal, borderRadius: 4 },
    },
    colors: [palette[0], palette[2], palette[4]],
    fill: { opacity: 0.92 },
    dataLabels: {
      enabled: showLabels,
      style: { colors: [theme.text] },
      formatter: (value) => {
        // rangeBar 的 value 是 [start, end] 时间戳
        const range = value as unknown as [number, number]
        if (!Array.isArray(range)) return ''
        const fmt = (ts: number) => `${new Date(ts).getMonth() + 1}/${new Date(ts).getDate()}`
        return `${fmt(range[0])} - ${fmt(range[1])}`
      },
    },
    xaxis: {
      type: 'datetime',
      min: new Date(2026, 0, 1).getTime(),
      max: new Date(2026, 11, 31).getTime(),
      labels: {
        style: { colors: theme.textSecondary },
        datetimeUTC: false,
        formatter: (value) => {
          const ts = Number(value)
          if (!Number.isFinite(ts)) return String(value)
          return `${new Date(ts).getMonth() + 1}月`
        },
      },
      axisBorder: { color: theme.axisLine },
      axisTicks: { color: theme.axisLine },
    },
    yaxis: { labels: { style: { colors: theme.textSecondary } } },
    grid: {
      show: showGrid,
      borderColor: theme.splitLine,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
    },
    legend: {
      position: 'bottom',
      labels: { colors: theme.textSecondary },
      markers: { shape: 'square' },
    },
    tooltip: { theme: theme.isDark ? 'dark' : 'light' },
  }

  return { options }
}
