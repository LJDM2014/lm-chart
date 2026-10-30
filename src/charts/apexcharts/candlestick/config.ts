import type { ApexOptions } from 'apexcharts'
import type { ApexChartConfig } from '@/adapters/apexcharts'
import type { ChartTheme } from '@/adapters/chartTheme'
import { resolvePalette } from '@/adapters/chartTheme'
import type { ControlDef, ParamValues } from '@/types/params'
import { candleData } from './data'

/** 参数面板控件声明（详情页右侧面板渲染；「配色方案」为全局通用控件，无需在此声明） */
export const controls: ControlDef[] = [
  { key: 'animation', label: '动画', type: 'toggle', default: true },
  { key: 'showGrid', label: '显示网格线', type: 'toggle', default: true },
  {
    key: 'colorScheme',
    label: '涨跌配色',
    type: 'select',
    default: 'green-up',
    options: [
      { label: '红涨绿跌', value: 'red-up' },
      { label: '绿涨红跌', value: 'green-up' },
    ],
  },
]

export function buildConfig(theme: ChartTheme, params?: ParamValues): ApexChartConfig {
  const palette = resolvePalette(params, theme)
  const showGrid = params?.showGrid !== false
  const redUp = params?.colorScheme === 'red-up'

  const options: ApexOptions = {
    series: [{ name: '股价', data: candleData }],
    chart: {
      type: 'candlestick',
      background: 'transparent',
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: 'inherit',
      animations: { enabled: params?.animation !== false },
    },
    theme: { mode: theme.isDark ? 'dark' : 'light' },
    plotOptions: {
      candlestick: {
        colors: {
          upward: redUp ? palette[3] : palette[4],
          downward: redUp ? palette[4] : palette[3],
        },
        wick: { useFillColor: true },
      },
    },
    xaxis: {
      type: 'datetime',
      labels: {
        style: { colors: theme.textSecondary },
        datetimeUTC: false,
      },
      axisBorder: { color: theme.axisLine },
      axisTicks: { color: theme.axisLine },
    },
    yaxis: {
      tooltip: { enabled: true },
      labels: { style: { colors: theme.textSecondary } },
    },
    grid: {
      show: showGrid,
      borderColor: theme.splitLine,
      xaxis: { lines: { show: false } },
    },
    tooltip: { theme: theme.isDark ? 'dark' : 'light' },
  }

  return { options }
}
